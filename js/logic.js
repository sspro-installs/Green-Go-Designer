// --- 6. CORE LOGIC (CALCULATIONS, VALIDATION, STORAGE) ---

/**
 * Populates productMap and initialProducts from the productGroups data.
 * This function is called after prices are fetched and updated.
 */
function initializeProductData() {
    const flat = {};
    productGroups.forEach(g => {
        g.products.forEach(p => { flat[p.id] = { ...p, group: g.name }; });
    });
    productMap = flat;

    const arr = [];
    productGroups.forEach(g => g.products.forEach(p => arr.push({ ...p, group: g.name, count: 0 })));
    initialProducts = arr;
}

/**
 * Retrieves a product from the cache or productMap.
 * @param {string} id - The product ID.
 * @returns {object} The product object.
 */
function getProduct(id) {
    if (!productCache.has(id)) {
        productCache.set(id, productMap[id]);
    }
    return productCache.get(id);
}

/**
 * Calculates the aggregated Bill of Materials (BOM) based on locations and infrastructure.
 * Uses caching to avoid recalculation if inputs haven't changed.
 * @param {Array} currentLocations - The array of location objects from State.
 * @returns {object} An aggregated BOM object with product IDs as keys and counts as values.
 */
function calculateTotalConfig(currentLocations) {
    const locationsHash = JSON.stringify(currentLocations) + JSON.stringify(State.infrastructureDetails);

    if (locationsHash === lastLocationsHash) {
        return { ...cachedConfig };
    }

    const aggregated = {};
    initialProducts.forEach(p => aggregated[p.id] = 0);

    let totalSites = 0;
    let totalWiredPoEDevices = 0;
    let totalKeyPanels = 0;

    currentLocations.forEach(loc => {
        totalSites++;

        const keyPanelCount = loc.keyPanelCount || 0;
        if (keyPanelCount > 0) {
            const baseId = (loc.keyPanelMount === 'rackmount') ? 'MCX' : 'MCXD';
            aggregated[baseId] += keyPanelCount;
            totalWiredPoEDevices += keyPanelCount;
            totalKeyPanels += keyPanelCount;
        }

        const wiredUsers = loc.wiredCount || 0;
        aggregated['GBPX'] += wiredUsers;
        totalWiredPoEDevices += wiredUsers;

        const wallStations = loc.wallStationCount || 0;
        aggregated['WSX'] += wallStations;
        totalWiredPoEDevices += wallStations;

        const wirelessUsers = loc.wirelessCount || 0;
        if (wirelessUsers > 0) {
            const beltpackId = loc.isHeavyDuty ? 'WBPXHD' : 'WBPX';
            aggregated[beltpackId] += wirelessUsers;
        }

        aggregated['HSET1E'] += (loc.headsetSplit?.stdOneEar || 0);
        aggregated['HSET2E'] += (loc.headsetSplit?.stdDualEar || 0);
        aggregated['HSETC1E'] += (loc.headsetSplit?.comfortOneEar || 0);
        aggregated['HSETC2E'] += (loc.headsetSplit?.comfortDualEar || 0);
        aggregated['TELH'] += (loc.headsetSplit?.handset || 0);
        aggregated['BCON'] += (loc.beaconCount || 0);
        aggregated['HSETCUST'] += (loc.headsetSplit?.customerSupplied || 0);
    });

    const totalWirelessUsers = currentLocations.reduce((s, l) => s + (l.wirelessCount || 0), 0);

    aggregated['GMIC300'] += totalKeyPanels;

    if (totalWirelessUsers > 0) {
        let waaCount = Math.ceil(totalWirelessUsers / WAA_RATIO);
        aggregated['WAA'] += waaCount;
        aggregated['BC6'] += Math.ceil(totalWirelessUsers / BC6_RATIO);
        totalWiredPoEDevices += waaCount;
    }

    if (State.infrastructureDetails.isMultiSite === 'yes' && totalSites > 0) {
        const BRIDC_COUNT = 1;
        aggregated['BRIDC'] += BRIDC_COUNT;
        totalWiredPoEDevices += BRIDC_COUNT;
    }

    if (State.infrastructureDetails.needsWalkieTalkieInterface) {
        aggregated['RDX'] += 1;
        totalWiredPoEDevices += 1;
    }

    if (State.infrastructureDetails.farDistance === 'yes') {
        let totalFiberLinks = 2;
        aggregated['SW18'] = 1;
        aggregated['SW8'] = 0; // Reset SW8 if SW18 is added
        if (State.infrastructureDetails.wiredAtFar || State.infrastructureDetails.wirelessAtFar) {
            aggregated['SW8'] += 1; // Add a remote switch
        }
        aggregated['SFOM'] += totalFiberLinks;
    }

    let currentSwitchCount = (aggregated['SW18'] || 0) + (aggregated['SW8'] || 0) + (aggregated['SW6'] || 0);
    let requiredSwitches = Math.max(1, Math.ceil(totalWiredPoEDevices / SW_DEVICE_RATIO));
    let switchesToAdd = requiredSwitches - currentSwitchCount;

    if (switchesToAdd > 0 && aggregated['SW18'] === 0) {
        aggregated['SW8'] += switchesToAdd;
    } else if (switchesToAdd > 0 && aggregated['SW18'] > 0 && (State.infrastructureDetails.wiredAtFar || State.infrastructureDetails.wirelessAtFar)) {
        aggregated['SW8'] += switchesToAdd;
    } else if (totalWiredPoEDevices > 0 && currentSwitchCount === 0) {
        aggregated['SW8'] = 1;
    }

    const out = {};
    Object.entries(aggregated).forEach(([k, v]) => { out[k] = v; });

    lastLocationsHash = locationsHash;
    cachedConfig = { ...out };
    return out;
}

/**
 * Computes final totals from a given product map.
 * @param {object} finalProductsMap - A map of product IDs and counts.
 * @returns {object} An object containing the list, costs, and counts.
 */
function computeFromProducts(finalProductsMap) {
    let list = Object.entries(finalProductsMap).map(([id, count]) => ({ ...getProduct(id), count }))
        .filter(p => p && p.count >= 0);

    const equipmentCost = list.reduce((s, i) => s + (i.price || 0) * (i.count || 0), 0);
    const devicesCount = list.reduce((s, i) => i.isCoreDevice ? s + (i.count || 0) : s, 0);
    const headsetsCount = list.reduce((s, i) => i.isHeadset ? s + (i.count || 0) : s, 0);
    const labor = equipmentCost * LABOR_RATE;
    const programming = equipmentCost * PROGRAMMING_SETUP_RATE;
    const grand = equipmentCost + labor + programming;

    return { list, equipmentCost, devicesCount, headsetsCount, labor, programming, grand };
}

/**
 * Runs validation checks on the final product list.
 * @param {Array} productsList - The list of product objects with counts.
 * @returns {object} An object with status and an array of validation issues.
 */
function runValidationChecks(productsList) {
    const issues = [];
    const currentTotalDevices = productsList.reduce((s, i) => i.isCoreDevice ? s + (i.count || 0) : s, 0);
    const currentTotalHeadsets = productsList.reduce((s, i) => i.isHeadset ? s + (i.count || 0) : s, 0);

    if (currentTotalHeadsets < currentTotalDevices) {
        issues.push(`Headset Warning: Only ${currentTotalHeadsets} headsets/handsets configured for ${currentTotalDevices} core devices.`);
    }

    let totalPoEDevices = 0;
    let totalPoEPorts = 0;
    productsList.forEach(p => {
        if (p.isPoE && !p.isSwitch && p.id !== 'WAA') totalPoEDevices += p.count || 0;
        if (p.isSwitch && p.isPoE) totalPoEPorts += (p.ports || 0) * (p.count || 0);
    });

    if (totalPoEDevices > totalPoEPorts) {
        issues.push(`Infrastructure Warning: Estimated PoE Devices (${totalPoEDevices}) may exceed available dedicated PoE Switch Ports (${totalPoEPorts}). Review switch configuration.`);
    }

    const status = issues.length ? 'REVIEW' : 'PASS';
    return { status, validation_issues: issues, totalPoEDevices, totalPoEPorts };
}

/**
 * Saves the current configurations array to localStorage.
 */
function saveConfigs() {
    try {
        const compressed = State.savedConfigs.map(cfg => ({
            id: cfg.id,
            name: cfg.name,
            user: cfg.user,
            email: cfg.email, // Save email
            products: Object.fromEntries(Object.entries(cfg.products).filter(([k, v]) => v > 0)),
            locations: cfg.locations,
            infrastructure: cfg.infrastructure,
            totalCost: cfg.totalCost,
            validationStatus: cfg.validationStatus
        }));
        localStorage.setItem('greenGoConfigs', JSON.stringify(compressed));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            if (State.savedConfigs.length > 0) {
                State.savedConfigs.pop();
                saveConfigs(); // Retry saving
                showAlert('Storage limit reached. Removed oldest configuration.', 'warning');
            } else {
                showAlert('Storage limit reached and no configurations to remove.', 'error');
            }
        } else {
            showAlert('Error saving configurations.', 'error');
        }
    }
}
