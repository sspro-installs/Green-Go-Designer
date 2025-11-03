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
        organizationName: "" // --- ADDED THIS LINE ---
    },
    infrastructureDetails: {
        isMultiSite: 'no',
        farDistance: 'no',
        wirelessAtFar: false,
        wiredAtFar: false,
        needsWalkieTalkieInterface: false,
    },
    savedConfigs: [],
    isSending: false, 
    isCalculating: false,
    // --- ADDED: A flag to track if a manual location has been created ---
    hasManualLocation: false 
};

// --- Global State Variables ---

// --- ADDED: Default rate for Support Materials ---
let SUPPORT_MATERIALS_RATE = 0.05; 
let LABOR_RATE = 0.20;
let PROGRAMMING_SETUP_RATE = 0.05;

let productMap = {};
let initialProducts = [];
let lastLocationsHash = "";
let cachedConfig = {};
const productCache = new Map();

