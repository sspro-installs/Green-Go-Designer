// --- 8. EVENT HANDLERS & ACTIONS ---

/**
 * Shows a system alert.
 * @param {string} message - The message to display.
 * @param {string} type - 'info', 'success', 'error', 'confirm', 'confirm-danger'.
 * @param {Function} onConfirm - Callback function if confirmed.
 * @param {Function} onCancel - Callback function if canceled.
 */
function showAlert(message, type = 'info', onConfirm = null, onCancel = null) {
    State.systemAlert = { show: true, message, type, onConfirm, onCancel };
    renderApp(); 

    if (type === 'success' || type === 'info' || type === 'error') {
        setTimeout(() => {
            if (State.systemAlert.show && State.systemAlert.message === message) {
                State.systemAlert = { show: false };
                const alertContainer = document.getElementById('alert-container');
                if(alertContainer) alertContainer.innerHTML = renderSystemAlerts();
            }
        }, 2500); // 2.5 seconds
    }
}

/**
 * PDF REQ #3b: Adds a flag location if items are manually edited on Step 5.
 */
function addManualLocationFlag() {
    const manualLocName = "Manually added items";
    let exists = State.locations.find(l => l.name === manualLocName);
    if (!exists) {
        State.locations.push({
            name: manualLocName,
            id: Date.now(),
            keyPanelCount: 0,
            wiredCount: 0,
            wirelessCount: 0,
            wallStationCount: 0,
            beaconCount: 0,
            headsetSplit: {},
            isManual: true // Add a flag
        });
    }
}

/**
 * Handles all clicks on elements with a `data-action` attribute.
 * @param {Event} e - The click event.
 */
function handleGlobalClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    if (action === 'set-step') {
        const newStep = parseInt(target.dataset.step, 10);
        // --- UPDATE: Add organizationName and userEmail to the check ---
        if (newStep > 2 && (!State.projectDetails.configName || !State.projectDetails.userName || !State.projectDetails.userEmail || !State.projectDetails.organizationName)) {
            showAlert('Please complete all fields in Project Setup first.', 'info'); 
            return;
        }
        State.step = newStep;
        renderApp();
    }

    if (action === 'start-step2-check') {
        State.step = 3;
        renderApp();
    }

    if (action === 'go-step4') {
        State.step = 4;
        State.isFinalEditMode = false;
        renderApp();
    }

    if (action === 'skip-to-manual-check') {
        State.isFinalEditMode = true;
        State.step = 5;
        State.locations = [];
        State.configProducts = initialProducts.reduce((acc, p) => {
            acc[p.id] = State.configProducts[p.id] || 0; return acc;
        }, {});
        renderApp();
    }

    if (action === 'open-location-modal') {
        openLocationModal();
    }

    if (action === 'close-location-modal') {
        State.isLocationModalOpen = false;
        renderApp();
    }

    if (action === 'save-location') {
        saveLocation();
    }

    if (action === 'edit-location') {
        const locId = parseInt(target.dataset.id, 10);
        const loc = State.locations.find(l => l.id === locId);
        if (loc) openLocationModal(loc);
    }

    if (action === 'delete-location') {
        const locId = parseInt(target.dataset.id, 10);
        showAlert('Delete this location?', 'confirm-danger', () => {
            State.locations = State.locations.filter(l => l.id !== locId);
            State.isFinalEditMode = false;
            renderApp();
        });
    }

    if (action === 'reset-system') {
        showAlert('Are you sure you want to reset all quantities?', 'confirm', () => {
            State.locations = [];
            State.configProducts = {};
            initialProducts.forEach(p => { State.configProducts[p.id] = 0; });
            State.infrastructureDetails = {
                isMultiSite: 'no',
                farDistance: 'no',
                wirelessAtFar: false,
                wiredAtFar: false,
                needsWalkieTalkieInterface: false,
            };
            State.isFinalEditMode = false;
            cachedConfig = {}; 
            lastLocationsHash = ""; 
            if (State.step !== 2) State.step = 3; 
            renderApp();
            showAlert('System has been reset.', 'success');
        });
    }

    if (action === 'inc-item') {
        const id = target.dataset.id;
        State.configProducts[id] = (State.configProducts[id] || 0) + 1;
        if (!State.isFinalEditMode) State.isFinalEditMode = true;
        
        // --- PDF REQ #3b: Add manual location flag ---
        if (State.step === 5) {
            addManualLocationFlag();
        }
        // --- END REQ #3b ---

        renderApp();
    }

    if (action === 'dec-item') {
        const id = target.dataset.id;
        State.configProducts[id] = Math.max(0, (State.configProducts[id] || 0) - 1);
        if (!State.isFinalEditMode) State.isFinalEditMode = true;
        
        // --- PDF REQ #3b: Add manual location flag ---
        if (State.step === 5) {
            addManualLocationFlag();
        }
        // --- END REQ #3b ---
        
        renderApp();
    }

    if (action === 'alert-confirm') {
        if (State.systemAlert.onConfirm) State.systemAlert.onConfirm();
        State.systemAlert = { show: false };
        const alertContainer = document.getElementById('alert-container');
        if(alertContainer) alertContainer.innerHTML = renderSystemAlerts();
    }

    if (action === 'alert-cancel') {
        if (State.systemAlert.onCancel) State.systemAlert.onCancel();
        State.systemAlert = { show: false };
        const alertContainer = document.getElementById('alert-container');
        if(alertContainer) alertContainer.innerHTML = renderSystemAlerts();
    }

    if (action === 'save-config') {
        saveCurrentConfig();
    }

    if (action === 'save-and-notify') {
        handleSaveAndNotify();
    }

    if (action === 'load-config') {
        const cfgId = parseInt(target.dataset.id, 10);
        const cfg = State.savedConfigs.find(c => c.id === cfgId);
        if (cfg) {
            State.projectDetails.configName = cfg.name;
            State.projectDetails.userName = cfg.user;
            State.projectDetails.userEmail = cfg.email || ""; 
            // --- UPDATE: Load organizationName ---
            State.projectDetails.organizationName = cfg.organization || ""; // Load new field
            State.locations = JSON.parse(JSON.stringify(cfg.locations || []));
            const loadedProducts = cfg.products || {};
            State.configProducts = initialProducts.reduce((acc, p) => {
                acc[p.id] = loadedProducts[p.id] || 0;
                return acc;
            }, {});
            State.infrastructureDetails = {
                isMultiSite: cfg.infrastructure?.isMultiSite || 'no',
                farDistance: cfg.infrastructure?.farDistance || 'no', // This is OK, it's just loading old data
                wirelessAtFar: cfg.infrastructure?.wirelessAtFar || false,
                wiredAtFar: cfg.infrastructure?.wiredAtFar || false,
                needsWalkieTalkieInterface: cfg.infrastructure?.needsWalkieTalkieInterface || false,
            };
            State.step = 5;
            State.isFinalEditMode = true;
            showAlert(`Loaded: ${cfg.name}`, 'success');
        } else {
            showAlert('Could not load configuration.', 'error');
        }
    }

    if (action === 'delete-saved') {
        const id = parseInt(target.dataset.id, 10);
        const name = target.dataset.name || 'this configuration';
        showAlert(`Delete '${name}'? This cannot be undone.`, 'confirm-danger', () => {
            State.savedConfigs = State.savedConfigs.filter(c => c.id !== id);
            saveConfigs();
            renderApp();
            showAlert('Configuration deleted.', 'success');
        });
    }

    if (action === 'delete-all-saved') {
        showAlert('Delete ALL saved configurations? This cannot be undone.', 'confirm-danger', () => {
            State.savedConfigs = [];
            saveConfigs();
            renderApp();
            showAlert('All configurations deleted.', 'success');
        });
    }
}

/**
 * Handles clicks inside the location modal, specifically for quantity controls.
 * @param {Event} e - The click event.
 */
function handleLocationModalEvents(e) {
    if (!State.isLocationModalOpen) return;

    const target = e.target.closest('[data-loc-action]');
    if (target) {
        const action = target.dataset.locAction;
        const id = target.dataset.id;
        const span = byld(id);
        if (!span) return;

        let val = parseInt(span.innerText, 10);
        if (action === 'inc-qty') val++;
        if (action === 'dec-qty') val = Math.max(0, val - 1);
        span.innerText = val;

        setupLocationModalFieldReactivity();
        return;
    }

    if (e.target.id === 'loc-existing-headsets' || e.target.id === 'loc-hd') {
        setupLocationModalFieldReactivity();
    }
}

/**
 * Updates the location modal UI fields based on current values (e.g., remaining headsets).
 */
function setupLocationModalFieldReactivity() {
    if (!State.isLocationModalOpen) return;

    const keyPanelCountEl = byld('loc-keypanelcount');
    const wirelessCountEl = byld('loc-wireless');
    const wiredCountEl = byld('loc-wired');
    const wallStationCountEl = byld('loc-wallstation');
    const hStd1El = byld('h-std1');
    const hStd2El = byld('h-std2');
    const hComf1El = byld('h-comf1');
    const hComf2El = byld('h-comf2');
    const hHandsetEl = byld('h-handset');
    const isCustomerSuppliedEl = byld('loc-existing-headsets');
    const mountWrapEl = byld('loc-mount-wrap');
    const hdWrapEl = byld('loc-hd-wrap');
    const headsetTotalEl = byld('loc-headset-total');
    const remainingEl = byld('loc-headset-remaining');
    const warningEl = byld('loc-headset-warning');
    const customerSuppliedWrapEl = byld('loc-customer-supplied-wrap');

    const keyPanelCount = keyPanelCountEl ? parseInt(keyPanelCountEl.innerText, 10) : 0;
    const wirelessCount = wirelessCountEl ? parseInt(wirelessCountEl.innerText, 10) : 0;
    const wired = wiredCountEl ? parseInt(wiredCountEl.innerText, 10) : 0;
    const wall = wallStationCountEl ? parseInt(wallStationCountEl.innerText, 10) : 0;
    const h_std1 = hStd1El ? parseInt(hStd1El.innerText, 10) : 0;
    const h_std2 = hStd2El ? parseInt(hStd2El.innerText, 10) : 0;
    const h_comf1 = hComf1El ? parseInt(hComf1El.innerText, 10) : 0;
    const h_comf2 = hComf2El ? parseInt(hComf2El.innerText, 10) : 0;
    const h_handset = hHandsetEl ? parseInt(hHandsetEl.innerText, 10) : 0;
    const isCustomerSupplied = isCustomerSuppliedEl ? isCustomerSuppliedEl.checked : false;

    if (mountWrapEl) mountWrapEl.style.visibility = keyPanelCount > 0 ? 'visible' : 'hidden';
    if (hdWrapEl) hdWrapEl.style.display = wirelessCount > 0 ? 'flex' : 'none';

    const totalDevices = keyPanelCount + wirelessCount + wired + wall;
    const totalHeadsetsAllocated = h_std1 + h_std2 + h_comf1 + h_comf2 + h_handset;
    const remaining = totalDevices - totalHeadsetsAllocated;

    if (headsetTotalEl) headsetTotalEl.innerText = `(${totalHeadsetsAllocated} of ${totalDevices} devices)`;

    if (remaining > 0) {
        if (remainingEl) {
            remainingEl.innerText = `Remaining: ${remaining}`;
            remainingEl.style.color = '#f87171';
        }
        if (warningEl) warningEl.style.display = isCustomerSupplied ? 'none' : 'block';
    } else if (remaining < 0) {
        if (remainingEl) {
            remainingEl.innerText = `Over-allocated: ${Math.abs(remaining)}`;
            remainingEl.style.color = '#facc15';
        }
        if (warningEl) warningEl.style.display = 'none';
    } else {
        if (remainingEl) {
            remainingEl.innerText = 'All devices allocated';
            remainingEl.style.color = '#4ade80';
        }
        if (warningEl) warningEl.style.display = 'none';
    }

    if (customerSuppliedWrapEl) {
        customerSuppliedWrapEl.style.display = totalDevices > 0 ? 'flex' : 'none';
        if (totalDevices === 0 && isCustomerSuppliedEl) {
            isCustomerSuppliedEl.checked = false;
        }
    }
    if (warningEl && remaining > 0 && !isCustomerSupplied) warningEl.style.display = 'block';
}

/**
 * Opens the location modal, either for a new or existing location.
 * @param {object | null} location - The location object to edit, or null to create a new one.
 */
function openLocationModal(location = null) {
    State.editingLocationId = location ? location.id : null;
    State.isLocationModalOpen = true;
    renderApp(); 

    const nameInput = byld('loc-name');
    const nameError = byld('loc-name-error');
    const saveBtn = byld('save-location-btn');
    const baseMountSelect = byld('loc-basemount');
    const hdCheckbox = byld('loc-hd');
    const existingHeadsetsCheckbox = byld('loc-existing-headsets');

    if (nameError) nameError.style.display = 'none';

    if (location) {
        if (nameInput) nameInput.value = location.name;
        if (baseMountSelect) baseMountSelect.value = location.keyPanelMount || 'desktop';
        if (hdCheckbox) hdCheckbox.checked = location.isHeavyDuty || false;
        if (existingHeadsetsCheckbox) existingHeadsetsCheckbox.checked = (location.headsetSplit?.customerSupplied > 0);
        if (saveBtn) saveBtn.textContent = 'Save Changes';
    } else {
        if (nameInput) nameInput.value = "";
        if (baseMountSelect) baseMountSelect.value = 'desktop';
        if (hdCheckbox) hdCheckbox.checked = false;
        if (existingHeadsetsCheckbox) existingHeadsetsCheckbox.checked = false;
        if (saveBtn) saveBtn.textContent = 'Add Location';
    }

    setupLocationModalFieldReactivity();
}

/**
 * Saves the location data from the modal to the application state.
 */
function saveLocation() {
    const nameInput = byld('loc-name');
    const name = nameInput ? nameInput.value.trim() : "";
    const nameError = byld('loc-name-error');

    if (!name) {
        if (nameError) nameError.style.display = 'block';
        return;
    }
    if (nameError) nameError.style.display = 'none';

    const locData = {
        name: name,
        keyPanelCount: parseInt(byld('loc-keypanelcount')?.innerText || '0', 10),
        keyPanelMount: byld('loc-basemount')?.value || 'desktop',
        wiredCount: parseInt(byld('loc-wired')?.innerText || '0', 10),
        wirelessCount: parseInt(byld('loc-wireless')?.innerText || '0', 10),
        wallStationCount: parseInt(byld('loc-wallstation')?.innerText || '0', 10),
        beaconCount: parseInt(byld('loc-beacon')?.innerText || '0', 10),
        isHeavyDuty: byld('loc-hd')?.checked || false,
        headsetSplit: {
            stdOneEar: parseInt(byld('h-std1')?.innerText || '0', 10),
            stdDualEar: parseInt(byld('h-std2')?.innerText || '0', 10),
            comfortOneEar: parseInt(byld('h-comf1')?.innerText || '0', 10),
            comfortDualEar: parseInt(byld('h-comf2')?.innerText || '0', 10),
            handset: parseInt(byld('h-handset')?.innerText || '0', 10),
            customerSupplied: 0
        }
    };

    const totalDevices = (locData.keyPanelCount + locData.wiredCount + locData.wirelessCount + locData.wallStationCount);
    const totalHeadsetsAllocated = (locData.headsetSplit.stdOneEar + locData.headsetSplit.stdDualEar + locData.headsetSplit.comfortOneEar + locData.headsetSplit.comfortDualEar + locData.headsetSplit.handset);
    const isCustomerSuppliedChecked = byld('loc-existing-headsets')?.checked || false;
    const headsetWarning = byld('loc-headset-warning');

    if (totalHeadsetsAllocated < totalDevices && !isCustomerSuppliedChecked) {
        if (headsetWarning) headsetWarning.style.display = 'block';
        return;
    }
    if (headsetWarning) headsetWarning.style.display = 'none';

    if (isCustomerSuppliedChecked) {
        locData.headsetSplit.customerSupplied = Math.max(0, totalDevices - totalHeadsetsAllocated);
    } else {
        locData.headsetSplit.customerSupplied = 0;
    }

    if (State.editingLocationId) {
        const index = State.locations.findIndex(l => l.id === State.editingLocationId);
        if (index > -1) State.locations[index] = { ...State.locations[index], ...locData };
    } else {
        State.locations.push({ ...locData, id: Date.now() });
    }

    State.isLocationModalOpen = false;
    State.isFinalEditMode = false;
    renderApp();
}

/**
 * Handles input for the project details fields in Step 2.
 * @param {Event} e - The input event.
 */
function handleProjectDetailsInput(e) {
    if (State.step !== 2) return;
    const { id, value } = e.target;

    if (id === 'configName') State.projectDetails.configName = value;
    if (id === 'userName') State.projectDetails.userName = value;
    if (id === 'userEmail') State.projectDetails.userEmail = value;
    // --- UPDATE: Save organizationName to state ---
    if (id === 'organizationName') State.projectDetails.organizationName = value;

    const btn = byld('start-step2-btn');
    if (btn) {
        // --- UPDATE: Check all 4 fields ---
        if (State.projectDetails.configName && State.projectDetails.userName && State.projectDetails.userEmail && State.projectDetails.organizationName) {
            btn.disabled = false;
            btn.classList.remove('bg-gray-500', 'cursor-not-allowed');
            btn.classList.add('btn-primary', 'hover:bg-green-700');
        } else {
            btn.disabled = true;
            btn.classList.add('bg-gray-500', 'cursor-not-allowed');
            btn.classList.remove('btn-primary', 'hover:bg-green-700');
        }
    }
}

/**
 * Handles input for the infrastructure fields in Step 4.
 * @param {Event} e - The input event.
 */
function handleInfrastructureInput(e) {
    if (State.step !== 4) return;
    const target = e.target.closest('[data-inf-field]');
    if (!target) return;

    const fieldName = target.dataset.infField;
    if (target.type === 'checkbox') {
        State.infrastructureDetails[fieldName] = target.checked;
    } else if (target.type === 'radio') {
        State.infrastructureDetails[fieldName] = target.value;
    }

    // PDF REQ #2: This logic is no longer needed as the fields are removed
    // if (fieldName === 'farDistance' && target.value === 'no') {
    //     State.infrastructureDetails.wirelessAtFar = false;
    //     State.infrastructureDetails.wiredAtFar = false;
    // }

    State.isFinalEditMode = false;
    renderApp();
}

/**
 * Saves the current configuration to the `State.savedConfigs` array and localStorage.
 * @returns {boolean} True if save was successful, false otherwise.
 */
function saveCurrentConfig() {
    const finalProductsToSave = State.isFinalEditMode ? State.configProducts : calculateTotalConfig(State.locations);
    // --- UPDATE: Destructure grand total (which now includes support materials) ---
    const { grand } = computeFromProducts(finalProductsToSave);
    const validationResult = runValidationChecks(Object.entries(finalProductsToSave).map(([id, count]) => ({ ...getProduct(id), count })));

    // --- UPDATE: Check all 4 required fields ---
    if (!State.projectDetails.configName || !State.projectDetails.userName || !State.projectDetails.userEmail || !State.projectDetails.organizationName) {
        showAlert('Please complete all fields in Step 2 before saving.', 'info');
        State.step = 2;
        renderApp();
        
        // Focus on the first empty field
        const configNameInput = byld('configName');
        const orgNameInput = byld('organizationName');
        const userNameInput = byld('userName');
        const emailInput = byld('userEmail');

        if (configNameInput && !State.projectDetails.configName) configNameInput.focus();
        else if (orgNameInput && !State.projectDetails.organizationName) orgNameInput.focus();
        else if (userNameInput && !State.projectDetails.userName) userNameInput.focus();
        else if (emailInput && !State.projectDetails.userEmail) emailInput.focus();
        
        return false;
    }

    const newConfig = {
        id: Date.now(),
        name: State.projectDetails.configName,
        user: State.projectDetails.userName,
        email: State.projectDetails.userEmail, 
        // --- UPDATE: Save organizationName ---
        organization: State.projectDetails.organizationName,
        products: { ...finalProductsToSave },
        locations: [...State.locations],
        infrastructure: { ...State.infrastructureDetails },
        totalCost: grand,
        validationStatus: validationResult.status
    };

    State.savedConfigs.unshift(newConfig);
    if (State.savedConfigs.length > 10) {
        State.savedConfigs = State.savedConfigs.slice(0, 10);
    }
    saveConfigs();
    showAlert('Configuration Saved!', 'success');
    return true;
}

// --- 9. NEW EMAIL & PDF FUNCTIONS ---

/**
 * Saves the config and sends a notification email via Formspree.
 */
async function handleSaveAndNotify() {
    if (State.isSending) return;

    // This check now validates all 4 fields
    const didSave = saveCurrentConfig();
    if (!didSave) {
        return; 
    }

    State.isSending = true;
    renderApp(); 
    showAlert('Sending email...', 'info');

    try {
        const finalProductsMap = State.isFinalEditMode ? State.configProducts : calculateTotalConfig(State.locations);
        // --- UPDATE: Destructure new supportMaterials value ---
        const { list, equipmentCost, labor, programming, supportMaterials, grand } = computeFromProducts(finalProductsMap);
        const filteredList = list.filter(p => p.count > 0 && p.id !== 'HSETCUST').sort((a, b) => a.name.localeCompare(b.name));

        const formData = new FormData();
        formData.append('Config_Name', State.projectDetails.configName);
        // --- UPDATE: Add Organization Name to email ---
        formData.append('Organization', State.projectDetails.organizationName);
        formData.append('Designer', State.projectDetails.userName);
        formData.append('Email', State.projectDetails.userEmail);
        if (State.projectDetails.userEmail) {
            formData.append('_replyto', State.projectDetails.userEmail);
        }
        formData.append('---', '---'); 

        // --- LOCATIONS SECTION ---
        formData.append('--- Locations Breakdown ---', '---');
        
        const getProdDetails = (id) => {
            try {
                const product = getProduct(id);
                if (product) {
                    return { 
                        name: escapeHtml(product.name || id), 
                        sku: escapeHtml(product.sku || 'N/A') 
                    };
                }
                return { name: `[Unknown ID: ${id}]`, sku: 'N/A' };
            } catch (e) {
                console.error(`Error in getProdDetails(${id}):`, e);
                return { name: `[Error: ${id}]`, sku: 'N/A' };
            }
        };

        if (State.locations.length === 0) {
            formData.append('Locations', 'No locations were defined.');
        } else {
            State.locations.forEach((loc, index) => {
                const parts = [];
                
                if (loc.keyPanelCount > 0) {
                    const p = getProdDetails(loc.keyPanelMount === 'rackmount' ? 'MCX' : 'MCXD');
                    parts.push(`${loc.keyPanelCount}x ${p.name} (${p.sku})`);
                }
                if (loc.wiredCount > 0) {
                    const p = getProdDetails('GBPX');
                    parts.push(`${loc.wiredCount}x ${p.name} (${p.sku})`);
                }
                if (loc.wallStationCount > 0) {
                    const p = getProdDetails('WSX');
                    parts.push(`${loc.wallStationCount}x ${p.name} (${p.sku})`);
                }
                if (loc.wirelessCount > 0) {
                    const wirelessId = loc.isHeavyDuty ? 'WBPXHD' : 'WBPX';
                    const p = getProdDetails(wirelessId);
                    parts.push(`${loc.wirelessCount}x ${p.name} (${p.sku})`);
                }
                if (loc.beaconCount > 0) {
                    const p = getProdDetails('BCON');
                    parts.push(`${loc.beaconCount}x ${p.name} (${p.sku})`);
                }
                
                const headsetParts = [];
                if (loc.headsetSplit?.stdOneEar > 0) {
                    const p = getProdDetails('HSET1E');
                    headsetParts.push(`${loc.headsetSplit.stdOneEar}x ${p.name} (${p.sku})`);
                }
                if (loc.headsetSplit?.stdDualEar > 0) {
                    const p = getProdDetails('HSET2E');
                    headsetParts.push(`${loc.headsetSplit.stdDualEar}x ${p.name} (${p.sku})`);
                }
                if (loc.headsetSplit?.comfortOneEar > 0) {
                    const p = getProdDetails('HSETC1E');
                    headsetParts.push(`${loc.headsetSplit.comfortOneEar}x ${p.name} (${p.sku})`);
                }
                if (loc.headsetSplit?.comfortDualEar > 0) {
                    const p = getProdDetails('HSETC2E');
                    headsetParts.push(`${loc.headsetSplit.comfortDualEar}x ${p.name} (${p.sku})`);
                }
                if (loc.headsetSplit?.handset > 0) {
                    const p = getProdDetails('TELH');
                    headsetParts.push(`${loc.headsetSplit.handset}x ${p.name} (${p.sku})`);
                }
                if (loc.headsetSplit?.customerSupplied > 0) {
                    const p = getProdDetails('HSETCUST');
                    headsetParts.push(`${loc.headsetSplit.customerSupplied}x ${p.name} (${p.sku})`);
                }
                
                if (headsetParts.length > 0) {
                    parts.push(`Headsets: [${headsetParts.join(', ')}]`);
                }

                const locationSummary = parts.length > 0 ? parts.join(' | ') : 'No devices in this location.';
                formData.append(`Location_${(index + 1).toString().padStart(2, '0')}`, `${escapeHtml(loc.name)}: ${locationSummary}`);
            });
        }
        formData.append('--- Bill of Materials ---', '---');
        // --- END LOCATIONS SECTION ---

        let itemIndex = 1;
        filteredList.forEach(p => {
            const lineItem = `(x${p.count}) ${escapeHtml(p.name)} (${escapeHtml(p.sku || 'N/A')}) --- ${fmt(p.price * p.count)}`;
            formData.append(`Item_${itemIndex.toString().padStart(2, '0')}`, lineItem);
            itemIndex++;
        });

        formData.append('--- Summary ---', '---'); 
        formData.append('Equipment_Total', fmt(equipmentCost));
        // --- UPDATE: Add new Support Materials line to email ---
        formData.append('Support_Materials_Logistics', fmt(supportMaterials));
        formData.append('Labor', fmt(labor));
        formData.append('Programming', fmt(programming));
        formData.append('GRAND_TOTAL', fmt(grand));

        const response = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            showAlert('Design saved and email sent successfully!', 'success');
        } else {
            const errorData = await response.json();
            console.error('Formspree error:', errorData);
            throw new Error('Formspree submission failed');
        }

    } catch (error) {
        console.error('Error sending email:', error);
        showAlert('Failed to send email. Please check connection.', 'error');
    }

    State.isSending = false;
    renderApp(); 
}
