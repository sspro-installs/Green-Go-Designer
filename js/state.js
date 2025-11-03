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
        organizationName: "" // <-- ADDED
    },
    infrastructureDetails: {
        isMultiSite: 'no',
        farDistance: 'no',
        wirelessAtFar: false,
        wiredAtFar: false,
        needsWalkieTalkieInterface: false,
    },
    savedConfigs: [],
    isSending: false, // Replaces isPrinting
    isCalculating: false,
};

// --- Global State Variables ---

let productMap = {};
let initialProducts = [];
let lastLocationsHash = "";
let cachedConfig = {};
const productCache = new Map();
