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
            // Only hide if it's still the same alert
            if (State.systemAlert.show && State.systemAlert.message === message) {
                State.systemAlert = { show: false };
                // We just re-render the alerts, not the whole app
                const alertContainer = document.getElementById('alert-container');
                if(alertContainer) alertContainer.innerHTML = renderSystemAlerts();
            }
        }, 2500); // 2.5 seconds
    }
}

/**
 * PDF REQ #3b: Adds a flag location if items are manually edited on Step 5.
 * --- UPDATED: This now uses the State.hasManualLocation flag ---
 */
function addManualLocationFlag() {
    if (State.hasManualLocation) return; // Don't add more than once

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
    State.hasManualLocation = true; // Set the flag
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
        
        // --- UPDATED: Check all 4 required fields ---
        const isSetupIncomplete = !State.projectDetails.configName || 
                                  !State.projectDetails.userName || 
                                  !State.projectDetails.userEmail ||
                                  !State.projectDetails.organizationName;

        if (newStep > 2 && isSetupIncomplete) {
            showAlert('Please complete all 4 fields in Project Setup first.', 'info'); 
            return;
        }
        State.step = newStep;
        renderApp();
    }

    // --- BUG FIX: This check was redundant and breaking the button ---
    // The logic is now correctly inside the 'set-step' action above.
    if (action === 'start-step2-check') {
        // This action now just proceeds to step 3,
        // as the button itself is enabled/disabled by handleProjectDetailsInput.
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
            State.hasManualLocation = false; // --- ADDED: Reset manual location flag ---
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
            addManualLocationFlag(); // This function now uses the state flag
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
            addManualLocationFlag(); // This function now uses the state flag
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
            State.projectDetails.organizationName = cfg.organizationName || ""; // --- UPDATED: Load organizationName ---
            State.locations = JSON.parse(JSON.stringify(cfg.locations || []));
            const loadedProducts = cfg.products || {};
            State.configProducts = initialProducts.reduce((acc, p) => {
                acc[p.id] = loadedProducts[p.id] || 0;
                return acc;
            }, {});
            State.infrastructureDetails = {
                isMultiSite: cfg.infrastructure?.isMultiSite || 'no',
                farDistance: 'no', // --- UPDATED: Force-remove obsolete "farDistance" ---
                wirelessAtFar: false,
                wiredAtFar: false,
                needsWalkieTalkieInterface: cfg.infrastructure?.needsWalkieTalkieInterface || false,
            };
            // --- ADDED: Check if loaded config has a manual location ---
            State.hasManualLocation = !!State.locations.find(l => l.name === "Manually added items");
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
    if (id === 'organizationName') State.projectDetails.organizationName = value; // --- ADDED ---
    if (id === 'userName') State.projectDetails.userName = value;
    if (id === 'userEmail') State.projectDetails.userEmail = value;

    const btn = byld('start-step2-btn');
    if (btn) {
        // --- UPDATED: Added all 4 fields to this check ---
        const isDisabled = !State.projectDetails.configName || 
                           !State.projectDetails.organizationName || 
                           !State.projectDetails.userName || 
                           !State.projectDetails.userEmail;
                           
        btn.disabled = isDisabled;
        if (isDisabled) {
            btn.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
            btn.classList.remove('btn-primary', 'hover:bg-green-700');
        } else {
            btn.classList.remove('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
            btn.classList.add('btn-primary', 'hover:bg-green-700');
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

    // --- REMOVED: Obsolete logic for "farDistance" ---

    State.isFinalEditMode = false;
    renderApp();
}

/**
 * Saves the current configuration to the `State.savedConfigs` array and localStorage.
 * @returns {boolean} True if save was successful, false otherwise.
 */
function saveCurrentConfig() {
    const finalProductsToSave = State.isFinalEditMode ? State.configProducts : calculateTotalConfig(State.locations);
    
    // --- UPDATED: Pass new Support Materials cost to save ---
    const { grand, supportMaterials } = computeFromProducts(finalProductsToSave);
    
    // --- UPDATED: This is now just a warning, not a blocker ---
    if (!State.projectDetails.configName || !State.projectDetails.userName || !State.projectDetails.userEmail || !State.projectDetails.organizationName) {
        showAlert('Project details are incomplete. Please fill them out in Step 2.', 'info');
        State.step = 2;
        renderApp();
        // Try to focus the first empty field
        if (!State.projectDetails.configName) byld('configName')?.focus();
        else if (!State.projectDetails.organizationName) byld('organizationName')?.focus();
        else if (!State.projectDetails.userName) byld('userName')?.focus();
        else if (!State.projectDetails.userEmail) byld('userEmail')?.focus();
        return false; // --- CHANGED: Still returns false to stop email, but it's just an info alert ---
    }

    const validationResult = runValidationChecks(Object.entries(finalProductsToSave).map(([id, count]) => ({ ...getProduct(id), count })));

    const newConfig = {
        id: Date.now(),
        name: State.projectDetails.configName,
        user: State.projectDetails.userName,
        email: State.projectDetails.userEmail, 
        organizationName: State.projectDetails.organizationName, // --- ADDED ---
        products: { ...finalProductsToSave },
        locations: [...State.locations],
        infrastructure: { ...State.infrastructureDetails },
        totalCost: grand,
        supportCost: supportMaterials, // --- ADDED: Save support cost ---
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

// --- 9. EMAIL FUNCTIONS ---

/**
 * Helper to get a product's name and SKU safely for the email.
 */
function getEmailProductLine(productId, count) {
    const p = getProduct(productId);
    const name = p ? escapeHtml(p.name) : 'Unknown Device';
    const sku = p ? escapeHtml(p.sku || 'N/A') : 'N/A';
    return `(x${count}) ${name} (${sku})`;
}

/**
 * Saves the config and sends a notification email via Formspree.
 */
async function handleSaveAndNotify() {
    if (State.isSending) return;

    // --- UPDATED: Validation is no longer a hard blocker ---
    const didSave = saveCurrentConfig();
    if (!didSave) {
        // saveCurrentConfig shows its own alert, so just stop.
        return; 
    }

    State.isSending = true;
    renderApp(); 
    showAlert('Sending email...', 'info');

    try {
        const finalProductsMap = State.isFinalEditMode ? State.configProducts : calculateTotalConfig(State.locations);
        // --- UPDATED: Get all cost components ---
        const { list, equipmentCost, labor, programming, supportMaterials, grand } = computeFromProducts(finalProductsMap);
        const filteredList = list.filter(p => p.count > 0 && p.id !== 'HSETCUST').sort((a, b) => a.name.localeCompare(b.name));
        const validation = runValidationChecks(list);

        const formData = new FormData();
        formData.append('Config_Name', State.projectDetails.configName);
        formData.append('Designer', State.projectDetails.userName);
        formData.append('Organization', State.projectDetails.organizationName); // --- ADDED ---
        formData.append('Email', State.projectDetails.userEmail);
        if (State.projectDetails.userEmail) {
            formData.append('_replyto', State.projectDetails.userEmail);
        }
        formData.append('---', '---'); 

        // --- NEW: Add Locations Breakdown ---
        formData.append('--- LOCATIONS BREAKDOWN ---', '---');
        if (State.locations.length > 0) {
            State.locations.forEach((loc, index) => {
                const locHeader = `${index + 1}. ${escapeHtml(loc.name)}`;
                let locDetails = [];
                
                if (loc.keyPanelCount > 0) {
                    const id = loc.keyPanelMount === 'rackmount' ? 'MCX' : 'MCXD';
                    locDetails.push(getEmailProductLine(id, loc.keyPanelCount));
                }
                if (loc.wiredCount > 0) locDetails.push(getEmailProductLine('GBPX', loc.wiredCount));
                if (loc.wirelessCount > 0) {
                    const id = loc.isHeavyDuty ? 'WBPXHD' : 'WBPX';
                    locDetails.push(getEmailProductLine(id, loc.wirelessCount));
                }
                if (loc.wallStationCount > 0) locDetails.push(getEmailProductLine('WSX', loc.wallStationCount));
                if (loc.beaconCount > 0) locDetails.push(getEmailProductLine('BCON', loc.beaconCount));
                
                if (locDetails.length > 0) {
                    formData.append(locHeader, locDetails.join(', '));
                } else {
                    formData.append(locHeader, 'No devices in this location.');
                }
            });
        } else {
            formData.append('Locations', 'No locations defined (Manual BOM).');
        }
        
        // --- NEW: Add Validation Status ---
        formData.append('--- VALIDATION ---', '---');
        formData.append('Status', validation.status);
        if(validation.validation_issues.length > 0) {
            validation.validation_issues.forEach((issue, i) => {
                formData.append(`Warning_${i+1}`, issue);
            });
        }

        // --- UPDATED: Add Bill of Materials ---
        formData.append('--- BILL OF MATERIALS ---', '---');
        let itemIndex = 1;
        filteredList.forEach(p => {
            // --- UPDATED: Added SKU to line item ---
            const lineItem = `(x${p.count}) ${escapeHtml(p.name)} (${escapeHtml(p.sku || 'N/A')}) --- ${fmt(p.price * p.count)}`;
            formData.append(`Item_${itemIndex.toString().padStart(2, '0')}`, lineItem);
            itemIndex++;
        });

        // --- UPDATED: Add new cost lines to Summary ---
        formData.append('--- SUMMARY ---', '---'); 
        formData.append('Equipment_Total', fmt(equipmentCost));
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

