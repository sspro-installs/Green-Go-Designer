// --- 1. CONFIGURATION ---

// Your Formspree URL
const FORM_ENDPOINT = "https://formspree.io/f/mqagbger";

// Your Pricing.json URL (Corrected)
const PRICING_URL = "https://raw.githubusercontent.com/sspro-installs/Green-Go-Designer/main/pricing.json";

// Default rates (will be overwritten by pricing.json)
let LABOR_RATE = 0.20;
let PROGRAMMING_SETUP_RATE = 0.05;
let SUPPORT_MATERIALS_RATE = 0.05; // <-- ADDED DEFAULT

// System Ratios
const WAA_RATIO = 4;
const BC6_RATIO = 6;
const SW_DEVICE_RATIO = 10;

// --- 3. SVG ICONS ---
const Icons = {
    Bell: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    Link2: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    Zap: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    Headset: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>`,
    Trash2: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    CheckCircle: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>`,
    AlertCircle: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    Clipboard: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
    Edit: (cls = 'w-5 h-5') => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`
};

// --- 4. PRODUCT & IMAGE DATA ---
// 'price' and 'sku' are DEFAULTS. They will be overwritten by pricing.json
const productGroups = [{
    name: 'Core Communication Devices',
    icon: 'Bell',
    description: 'Beltpacks, Base Stations, and Multi-Channel Stations.',
    products: [
        { id: 'WBPX', name: 'Wireless Beltpack', sku: 'GGO-WBPX', role: 'Primary DECT User Device', price: 2093.00, count: 0, isPoE: false, isCoreDevice: true, isWireless: true },
        { id: 'WBPXHD', name: 'Wireless Beltpack (Sport)', sku: 'GGO-WBPX SPORT', role: 'Rugged DECT User Device', price: 2093.00, count: 0, isPoE: false, isCoreDevice: true, isWireless: true },
        { id: 'GBPX', name: '32 Channel Wired Beltpack', sku: 'GGO-GBPX', role: 'Primary Wired User Device', price: 1031.33, count: 0, isPoE: true, isCoreDevice: true, isWireless: false },
        { id: 'WSX', name: 'Surface Mount Wall Station w/ Headset and Speaker', sku: 'GGO-WPX', role: 'Permanent Wall-Mounted User Device', price: 1183.00, count: 0, isPoE: true, isCoreDevice: true, isWireless: false },
        { id: 'MCX', name: '32 Channel Key Panel, 1U Rack Mount', sku: 'GGO-MCX', price: 3159.00, count: 0, isPoE: true, isCoreDevice: true, isWireless: false },
        { id: 'MCXD', name: '32 Channel Key Panel, Desktop', sku: 'GGO-MCXD', role: '32-Channel Desktop Station', price: 3159.00, count: 0, isPoE: true, isCoreDevice: true, isWireless: false },
        { id: 'MCXEXT', name: '24 Channel Key Panel Extension, 1U Rack Mount', sku: 'GGO-MCXEXT', role: '24-Channel Rack Extension', price: 2738.67, count: 0, isPoE: true, isCoreDevice: true, isWireless: false },
        { id: 'MCXDEXT', name: '24 Channel Key Panel Extension, Desktop', sku: 'GGO-MCXDEXT', role: '24-Channel Desktop Extension', price: 2738.67, count: 0, isPoE: true, isCoreDevice: true, isWireless: false },
        { id: 'BSRX', name: 'GreenGO -Stride DECT Antenna (US)', sku: 'GGO-STRIDEDAU', role: 'DECT Antenna/Master Station', price: 2847.00, count: 0, isPoE: true, isCoreDevice: true, isWireless: true },
    ]
}, {
    name: 'Interfaces',
    icon: 'Link2',
    description: 'Connect Green-GO network to external audio and intercom systems.',
    products: [
        { id: 'DNTI', name: 'Dante Interface', sku: 'GGO-DNTI', role: 'Dante Audio I/O', price: 3215.33, count: 0, isPoE: true, isCoreDevice: false },
        { id: 'Q4WI', name: 'Quad 4-Wire Interface', sku: 'GGO-Q4WR', role: 'External 4-Wire Connection', price: 2353.00, count: 0, isPoE: true, isCoreDevice: false },
        { id: 'BRIDC', name: 'Bridge Interface 4 Port', sku: 'GGO-BRIDGEX', role: 'Connecting two Green-GO networks', price: 2795.00, count: 0, isPoE: true, isCoreDevice: false },
        { id: 'RDX', name: '2-Way Radio Interface', sku: 'GGO-RDX', role: 'Two-Way Radio Integration', price: 1031.33, count: 0, isPoE: true, isCoreDevice: false },
        { id: 'INTERFACEX', name: 'Audio Interface, 2 x 4-wire and 2-wire', sku: 'GGO-INTERFACEX', role: 'Integrates 2-Wire & 4-Wire Analog Systems', price: 1798.33, count: 0, isPoE: true, isCoreDevice: false },
        { id: 'SI2W', name: 'Single Port 2-Wire Throw Down Interface', sku: 'GGO-SI2W', role: 'External 2-Wire Connection', price: 1031.33, count: 0, isPoE: true, isCoreDevice: false },
        { id: 'SI4W', name: 'Single Port 4-Wire or Line In/Out Throw Down Interface', sku: 'GGO-SI4W', role: 'External 4-Wire Connection/Line I/O', price: 1031.33, count: 0, isPoE: true, isCoreDevice: false },
    ]
}, {
    name: 'Network & Power Infrastructure',
    icon: 'Zap',
    description: 'Essential network switches and power supplies.',
    products: [
        { id: 'SW8', name: '8 PoE Ports + 1 Port Ethernet Switch', sku: 'GGO-SW818', role: 'System Foundation (Network/Power)', price: 1724.67, count: 0, ports: 8, isPoE: true, isSwitch: true },
        { id: 'SW5', name: '5-Port Truss Mount Ethernet Switch with PoE', sku: 'GGO-SW5', role: 'Small Network Expansion', price: 901.33, count: 0, ports: 5, isPoE: false, isSwitch: true },
        { id: 'SW6', name: 'Switch 6, PTPv2 Enabled 6-Port PoE+ Switch', sku: 'GGO-SW6', role: 'Small PTP/PoE Network Switch', price: 1100.67, count: 0, ports: 6, isPoE: true, isSwitch: true },
        { id: 'WAA', name: 'Wireless Active Antenna', sku: 'GGO-WAA', role: 'DECT Wireless Coverage', price: 1993.33, count: 0, isPoE: true, isCoreDevice: false },
        { id: 'SW18', name: '18-Port Gigabit Switch, 2 FO SFP cages', sku: 'GGO-SW18GBX', role: 'Central Backbone Switch', price: 4125.33, count: 0, ports: 8, isPoE: true, isSwitch: true },
        { id: 'SFOM', name: 'Fiber Optic Multimode Module (SFP)', sku: 'GGO-SFOM', role: 'Long-distance fiber link', price: 190.67, count: 0 },
        { id: 'BC6', name: '6 Way Rack Mount Battery Charger', sku: 'GGO-BC6', role: 'Wireless Beltpack Charging', price: 741.00, count: 0 },
        { id: 'PSU1', name: 'Power Supply, 12V 1.8A DC', sku: 'GGO-PSU12V', role: 'External Power Input', price: 134.33, count: 0 },
    ]
}, {
    name: 'Accessories',
    icon: 'Headset',
    description: 'Essential accessories for operation.',
    products: [
        { id: 'HSET2E', name: 'Dual Cup Headset', sku: 'GGO-HS200D', role: 'High Noise/Focus Headset', price: 264.33, count: 0, isHeadset: true },
        { id: 'HSET1E', name: 'Single Cup Headset', sku: 'GGO-HS200S', role: 'Primary Comm Headset', price: 234.00, count: 0, isHeadset: true },
        { id: 'HSETC1E', name: 'Comfort Headset (DT 280, Single-Ear)', sku: 'BYR-DT280', role: 'Premium Single-Ear Comm Headset', price: 562.50, count: 0, isHeadset: true },
        { id: 'HSETC2E', name: 'Comfort Headset (DT 290, Dual-Ear)', sku: 'BYR-DT290', role: 'Premium Dual-Ear Comm Headset', price: 625.00, count: 0, isHeadset: true },
        { id: 'TELH', name: 'Telephone Style Handset', sku: 'GGO-GHSA05', role: 'Handset communication option', price: 199.33, count: 0, isHeadset: true },
        { id: 'GMIC300', name: 'Electret Gooseneck Microphone (300mm)', sku: 'GGO-GNM300', role: 'Microphone for Key Panels', price: 199.33, count: 0 },
        { id: 'GMIC430', name: 'Electret Gooseneck Microphone (430mm)', sku: 'GGO-GNM430', role: 'Microphone for Key Panels (Long)', price: 199.33, count: 0 },
        { id: 'BCON', name: 'Cue Light/Call Beacon', sku: 'GGO-BEACON', role: 'Visual/Audio Alert Device', price: 715.00, count: 0 },
        { id: 'NRGP', name: 'Spare Battery for WBPX', sku: 'GGO-NRGP', role: 'Spare Battery for Wireless Beltpacks', price: 112.67, count: 0 },
        { id: 'HARN', name: 'Beltpack Harness', sku: 'GGO-HARNESS', role: 'Beltpack Accessory', price: 212.33, count: 0 },
        { id: 'RMKI', name: 'Rack Mount Kit for SW5', sku: 'GGO-RMKIT', role: 'Rack Mount Accessory', price: 95.33, count: 0 },
    ]
}, {
    name: 'Customer Supplied',
    icon: 'Headset',
    description: 'Headsets provided by customer (no cost).',
    products: [
        { id: 'HSETCUST', name: 'Customer Supplied Headset', sku: 'CUST-HSET', role: 'Existing/Non-Purchased Comm Headset', price: 0.00, count: 0, isHeadset: true }
    ]
}];

const imageMap = {
    'CRC_LOGO': 'https://raw.githubusercontent.com/sspro-installs/media-assets/main/clients/CRC/CRC%20Logo.png',
    'SS_LOGO': 'https://sspro-installs.github.io/media-assets/branding/SS-Pro-Logo-White.png',
    'WBPX': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_BPXSP.png',
    'WBPXHD': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_BPXSP.png',
    'GBPX': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-GBPX.png',
    'WSX': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-Wallpanel-X.png',
    'BSDX': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_BSDX.png',
    'BSRX': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_BSRX.png',
    'MCX': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-MCXEXT.png',
    'MCXD': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-MCXD.png',
    'MCXEXT': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-MCXEXT.png',
    'MCXDEXT': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-MCXDEXT.png',
    'DNTI': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_dante-interface-x.png',
    'Q4WI': 'httpss://sspro-installs.github.io/media-assets/vendors/greengo/GGO_Q4W.png',
    'BRIDC': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_BRIDGEX.png',
    'RDX': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-TD2WR.png',
    'INTERFACEX': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_INTERFACEX.png',
    'SI2W': 'https::/sspro-installs.github.io/media-assets/vendors/greengo/GGO-SI2W.png',
    'SI4W': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-TD4WR.png',
    'SW8': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-SW81.png',
    'SW5': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-SW5.png',
    'SW6': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-SW6.png',
    'SW18': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-SWITCH18.png',
    'WAA': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-WAA.png',
    'BC6': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_BC6.png',
    'HSET1E': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-HS200S.png',
    'HSET2E': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-HS200D.png',
    'HSETC1E': 'https://sspro-installs.github.io/media-assets/vendors/beyerdynamic/Beyerdynamic-DT280.png',
    'HSETC2E': 'https://sspro-installs.github.io/media-assets/vendors/beyerdynamic/Beyerdynamic-DT-290-MKII.png',
    'TELH': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-HSA05.png',
    'BCON': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-BEACON.png',
    'GMIC300': 'https://raw.githubusercontent.com/sspro-installs/media-assets/main/vendors/greengo/GGO-GNM300.png',
    'GMIC430': 'https://raw.githubusercontent.com/sspro-installs/media-assets/main/vendors/greengo/GGO-GNM430.png',
    'HARN': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-HARNESS.png',
    'RMKI': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-RMKIT.png',
    'PSU1': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-PSU12V.png',
    'NRGP': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO-NRGP.png',
    'SFOM': 'https://sspro-installs.github.io/media-assets/vendors/greengo/GGO_SFOM.png',
    'SOFTWARE': 'https://sspro-installs.github.io/media-assets/vendors/greengo/Green-go-Control.png',

    // --- NEW CHURCH IMAGES ADDED ---
    'CHURCH_WHAT_IS': 'https://sspro-installs.github.io/media-assets/AI created pictures/Multiview, Greengo Keystation, lady.png',
    'CHURCH_WHY': 'https://sspro-installs.github.io/media-assets/AI created pictures/Man behind camera in church.png',
    'CHURCH_PARTS': 'https://sspro-installs.github.io/media-assets/vendors/greengo/Greengo gear on table control room.png',
    'CHURCH_EXAMPLES': 'https://sspro-installs.github.io/media-assets/AI created pictures/Audi-lighting-booth.png',
    'CHURCH_GREAT_FOR': 'https://sspro-installs.github.io/media-assets/AI created pictures/Production team in headsets.png'
};
