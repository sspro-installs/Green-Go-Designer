// --- 10. APP INITIALIZATION ---

/**
 * Loads pricing data from the external JSON file and initializes the app.
 */
async function loadPricingAndInit() {
    State.isCalculating = true; // Show loading state
    renderApp();

    try {
        const response = await fetch(PRICING_URL);
        if (!response.ok) throw new Error(`Failed to load pricing from ${PRICING_URL}`);
        const pricingData = await response.json();

        // Update rates
        LABOR_RATE = pricingData.labor_rate || LABOR_RATE;
        PROGRAMMING_SETUP_RATE = pricingData.programming_rate || PROGRAMMING_SETUP_RATE;

        // Update product prices and SKUs
        productGroups.forEach(group => {
            group.products.forEach(product => {
                if (pricingData.products[product.id]) {
                    product.price = pricingData.products[product.id].price;
                    product.sku = pricingData.products[product.id].sku || product.sku;
                }
            });
        });

        console.log(`Pricing v${pricingData.version} loaded successfully.`);

    } catch (error) {
        console.error('Failed to load external pricing:', error);
        showAlert('Could not load pricing. Using default values.', 'error');
    }

    // Now that prices are loaded (or defaults are used), build the maps
    initializeProductData();

    State.isCalculating = false; // Hide loading state
    renderApp(); // Initial render with correct data
}

/**
 * Main application entry point.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Load saved configs from localStorage
    try {
        const stored = localStorage.getItem('greenGoConfigs');
        State.savedConfigs = stored ? JSON.parse(stored) : [];
    } catch (e) {
        State.savedConfigs = [];
    }

    // Start the app by loading pricing
    loadPricingAndInit();

    const debouncedProjectInput = debounce(handleProjectDetailsInput, 200);

    // Global event listeners
    document.body.addEventListener('click', e => {
        handleGlobalClick(e);
        handleLocationModalEvents(e);
    });

    document.body.addEventListener('input', e => {
        if (State.step === 2 && (e.target.id === 'configName' || e.target.id === 'userName' || e.target.id === 'userEmail')) {
            debouncedProjectInput(e);
        }
        if (State.step === 4 && e.target.closest('[data-inf-field]')) {
            handleInfrastructureInput(e);
        }
        if (State.isLocationModalOpen && (e.target.id === 'loc-existing-headsets' || e.target.id === 'loc-hd')) {
            setupLocationModalFieldReactivity();
        }
    });
});
