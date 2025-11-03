// --- 5. APPLICATION STATE ---

const State = {
    step: 1,
    locations: [],
    configProducts: {},
    isFinalEditMode: false,
    isLocationModalOpen: false,
    editingLocationId: null,
    systemAlert: { show: false, type: 'info', message: "", onConfirm: null, onCancel: null },
    projectDetails: { 
        userName: "", 
        configName: "", 
        userEmail: "",
        organizationName: "" // --- ADDED: This provides "memory" for the new field ---
    },
    infrastructureDetails: {
        isMultiSite: 'no',
        farDistance: 'no', // This is now obsolete but kept for loading old configs
        wirelessAtFar: false,
        wiredAtFar: false,
        needsWalkieTalkieInterface: false,
    },
    savedConfigs: [],
    isSending: false, 
    isCalculating: false,
    hasManualLocation: false // --- ADDED: Flag for "Manually added items"
};

// --- Global State Variables ---

let productMap = {};
let initialProducts = [];
let lastLocationsHash = "";
let cachedConfig = {};
const productCache = new Map();

// --- ADDED: Default rate, will be overwritten by pricing.json ---
let SUPPORT_MATERIALS_RATE = 0.05; 

