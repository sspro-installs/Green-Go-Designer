// --- 2. UTILITY FUNCTIONS ---

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function byld(id) { return document.getElementById(id); }

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const fmt = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount || 0);

// --- 7. RENDER FUNCTIONS (HTML TEMPLATES) ---

function renderHeader() {
    return `
<div class="no-print flex-between items-center border-b border-gray-700 pb-2 mb-8">
    <div class="flex flex-col">
        <h1 class="text-3xl font-extrabold text-green-400">Green-GO Dynamic System Designer</h1>
        <!-- EDIT: Removed CRC Logo line from here -->
    </div>
    <!-- EDIT 1 (Last time): Set height to h-16 (4rem) to match left column height. flex-between handles right-justification. (Request #1) -->
    <img src="${imageMap.SS_LOGO}" alt="S&S Logo" class="h-16 w-auto object-contain" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/100x48/ffffff/111827?text=SS'">
</div>`;
}

function renderProgress() {
    const steps = [
        { title: 'System Overview' },
        { title: 'Project Setup' },
        { title: 'Location Manager' },
        { title: 'Infrastructure' },
        { title: 'Review & Export' },
    ];
    const isSetupIncomplete = !State.projectDetails.configName || !State.projectDetails.userName;
    return `
<div class="no-print flex justify-between mb-8">
    ${steps.map((s, idx) => `
    <div data-action="set-step" data-step="${idx + 1}"
        class="flex-1 text-center py-2 rounded-full mx-1 transition duration-300 ${
            // EDIT 2 (Last time): Modified logic to only block *future* steps (Request #2)
            idx + 1 > 2 && isSetupIncomplete ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${
            idx + 1 === State.step ? 'bg-green-600 text-white shadow-lg' : (idx + 1 < State.step ? 'bg-green-800 text-green-100' : 'bg-gray-700 text-gray-400')
        }">
        <span class="font-medium text-sm md:text-base">Step ${idx + 1}: ${s.title}</span>
    </div>
    `).join("")}
</div>`;
}

function renderSidebar(equipmentCost, devicesCount, headsetsCount, labor, programming, grand) {
    // EDIT 3 (Last time): Simplified cost section text (Request #11) and added margin-top (Request #12 & #14)
    const costSection = equipmentCost > 0 ?
        `<div class="flex-between font-extrabold text-lg pt-2 border-t-2 border-gray-600">
            <span>Total Equipment Cost:</span><span class="text-green-400">${fmt(equipmentCost)}</span>
        </div>
        <h3 class="font-bold text-base border-b border-gray-600 pb-1 mb-2 mt-4 text-gray-200">Labor & Services</h3>
        <div class="space-y-2 mb-4">
            <div class="flex-between"><span class="text-sm text-gray-400">Labor Cost:</span><span class="font-medium text-green-500">${fmt(labor)}</span></div>
            <div class="flex-between"><span class="text-sm text-gray-400">Programming:</span><span class="font-medium text-green-500">${fmt(programming)}</span></div>
        </div>
        <div class="flex-between font-extrabold text-xl mt-4 border-t-4 pt-4 border-green-700">
            <span class="text-white">GRAND TOTAL:</span>
            <span class="text-red-400">${fmt(grand)}</span>
        </div>`
        :
        // EDIT 4 (Last time): Added $0 values for when cost is 0 (Request #10)
        // EDIT 5 (Last time): Simplified text (Request #11) and added margin-top (Request #12 & #14)
        `<div class="flex-between font-extrabold text-lg pt-2 border-t-2 border-gray-600">
            <span>Total Equipment Cost:</span><span class="text-green-400">${fmt(0)}</span>
        </div>
        <h3 class="font-bold text-base border-b border-gray-600 pb-1 mb-2 mt-4 text-gray-200">Labor & Services</h3>
        <div class="space-y-2 mb-4">
            <div class="flex-between"><span class="text-sm text-gray-400">Labor Cost:</span><span class="font-medium text-green-500">${fmt(0)}</span></div>
            <div class="flex-between"><span class="text-sm text-gray-400">Programming:</span><span class="font-medium text-green-500">${fmt(0)}</span></div>
        </div>
        <div class="flex-between font-extrabold text-xl mt-4 border-t-4 pt-4 border-green-700">
            <span class="text-white">GRAND TOTAL:</span>
            <span class="text-red-400">${fmt(0)}</span>
        </div>`;

    return `
<div class="space-y-8 no-print">
    <div class="bg-gray-800 p-6 shadow-xl rounded-lg border border-gray-700">
        <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <!-- EDIT 6 (Last time): Wrapped icon in span to constrain size (Request #3) -->
            <span class="w-6 h-6 mr-2">${Icons.Clipboard('w-6 h-6 text-green-400')}</span>
            Project Summary
        </h2>
        <div class="space-y-3 mb-6 text-gray-300">
            <div class="flex-between font-semibold"><span>Locations Defined:</span><span>${State.locations.length}</span></div>
            <div class="flex-between"><span>Total Core Devices:</span><span>${devicesCount || 0}</span></div>
            <div class="flex-between"><span>Total Headsets:</span><span>${headsetsCount || 0}</span></div>
        </div>
        ${costSection}
        <!-- REQ #5: Add ballpark estimate note -->
        <p class="text-xs text-gray-400 mt-4 text-center">
            This is a ballpark estimate. A final quote will be given separately.
        </p>
    </div>
    
    <!-- EDIT 7 (Last time): Added "Reset System" button card (Request #5) -->
    <div class="card p-4">
        <button data-action="reset-system" class="w-full btn bg-red-600 hover:bg-red-700 text-white py-2">Reset Current System</button>
        <p class="text-xs text-gray-400 mt-2 text-center">This resets all quantities to zero, but keeps your project name and email.</p>
    </div>

    ${renderSavedConfigs()}
</div>`;
}

function renderApp() {
    // EDIT: Removed logic that blocked returning to Step 1
    // if (State.isFinalEditMode && State.step === 1) State.step = 5;

    if (State.isCalculating) {
        document.getElementById('app').innerHTML = `<div class="text-center p-10"><h2 class="text-2xl font-semibold text-green-400">Loading Pricing...</h2></div>`;
        return;
    }

    const calculatedConfig = calculateTotalConfig(State.locations);
    const finalProductsMap = State.isFinalEditMode ? State.configProducts : calculatedConfig;

    if (State.step === 5 && State.locations.length > 0 && !State.isFinalEditMode) {
        State.configProducts = { ...calculatedConfig };
        State.isFinalEditMode = true;
    }

    const mapForDisplay = (State.step === 5 && State.isFinalEditMode) ?
        Object.keys(productMap).reduce((acc, id) => {
            acc[id] = finalProductsMap[id] || 0;
            return acc;
        }, {}) : finalProductsMap;

    const { list, equipmentCost, devicesCount, headsetsCount, labor, programming, grand } = computeFromProducts(mapForDisplay);
    const displayList = list.filter(p => p.id !== 'HSETCUST');

    let stepContent;
    if (State.step === 1) stepContent = renderStep1Overview();
    else if (State.step === 2) stepContent = renderStep2();
    else if (State.step === 3) stepContent = renderStep3LocationManager(calculatedConfig);
    else if (State.step === 4) stepContent = renderStep4Infrastructure();
    else stepContent = renderStep5Review(displayList, { equipmentCost, devicesCount, headsetsCount, labor, programming, grand });

    const html = `
    <!-- EDIT: Added alert-container for toasts -->
    <div id="alert-container" class="fixed top-0 left-0 right-0 z-modal" style="pointer-events: none;">
        ${renderSystemAlerts()}
    </div>
    ${renderHeader()}
    ${State.isLocationModalOpen ? renderLocationModal() : ""}
    ${renderProgress()}
    <div class="grid lg:grid-cols-3 gap-8 p-0 sm:p-4">
        <div class="lg:col-span-2 space-y-8">
            <div class="card p-6 md:p-8">
                ${stepContent}
            </div>
        </div>
        ${renderSidebar(equipmentCost, devicesCount, headsetsCount, labor, programming, grand)}
    </div>
    ${renderPrintSection(displayList, { equipmentCost, labor, programming, grand })}
    `;
    document.getElementById('app').innerHTML = html;
}

function renderStep1Overview() {
    // This content is new, based on the user's HTML file and new images.
    // It's styled with Tailwind to match the application's theme.
    // REMOVED inline style to let images use their natural height.
    return `
<div class="space-y-6 text-center">
    <h1 class="text-3xl font-extrabold text-white">How Green-GO Helps Church Teams Stay Connected</h1>
</div>

<main class="flex-grow mt-8 space-y-6">

    <!-- What Is Green-GO? -->
    <div class="bg-gray-700 rounded-lg shadow-lg overflow-hidden border border-gray-600">
        <img class="w-full" src="${imageMap.CHURCH_WHAT_IS}" alt="Green-GO Keystation in use" onerror="this.src='https://placehold.co/600x384/1f2937/4ade80?text=What+Is+Green-GO%3F'">
        <div class="p-6">
            <h2 class="text-xl font-semibold text-green-400 mb-2">What Is Green-GO?</h2>
            <p class="text-sm text-gray-300">Green-GO is like a high-tech walkie-talkie system made for churches. It lets your whole production team stay connected—sound, lighting, cameras, and worship leaders—all talking clearly without shouting or waving hands. It works through the same kind of cables your church already uses for the internet.</p>
        </div>
    </div>

    <!-- Why Churches Use It -->
    <div class="bg-gray-700 rounded-lg shadow-lg overflow-hidden border border-gray-600">
        <img class="w-full" src="${imageMap.CHURCH_WHY}" alt="Man behind camera in church" onerror="this.src='https://placehold.co/600x384/1f2937/4ade80?text=Why+Churches+Use+It'">
        <div class="p-6">
            <h2 class="text-xl font-semibold text-green-400 mb-2">Why Churches Use It</h2>
            <p class="text-sm text-gray-300">During worship, services, or special events, timing matters. Green-GO helps volunteers and staff stay calm and coordinated—from lighting cues to livestream direction. It brings clear communication and teamwork to every part of the service.</p>
        </div>
    </div>

    <!-- Main Parts of the System -->
    <div class="bg-gray-700 rounded-lg shadow-lg overflow-hidden border border-gray-600">
        <img class_=("w-full" src="${imageMap.CHURCH_PARTS}" alt="Green-GO gear on a table" onerror="this.src='https://placehold.co/600x384/1f2937/4ade80?text=Main+Parts'">
        <div class="p-6">
            <h2 class="text-xl font-semibold text-green-400 mb-2">Main Parts of the System</h2>
            <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li><b>Beltpacks:</b> Small boxes that clip to your belt—talk and listen using a headset.</li>
                <li><b>Wireless Packs & Antennas:</b> Let people move freely around the church or stage.</li>
                <li><b>Stations:</b> Used by tech directors or worship leaders to talk to everyone.</li>
                <li><b>Cue Lights:</b> Flash when it’s time for a cue or transition.</li>
                <li><b>Interfaces:</b> Connect Green-GO to the sound board or livestream setup.</li>
                <li><b>Chargers:</b> Keep everything powered and ready for Sunday morning.</li>
            </ul>
        </div>
    </div>

    <!-- Real Church Examples -->
    <div class="bg-gray-700 rounded-lg shadow-lg overflow-hidden border border-gray-600">
        <img class="w-full" src="${imageMap.CHURCH_EXAMPLES}" alt="Audio and lighting booth" onerror="this.src='https://placehold.co/600x384/1f2937/4ade80?text=Real+Examples'">
        <div class="p-6">
            <h2 class="text-xl font-semibold text-green-400 mb-2">Real Church Examples</h2>
            <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li><b>Sound Booth:</b> The audio engineer can quietly talk to camera operators or worship leaders.</li>
                <li><b>Camera Crew:</b> Operators get instant direction during the livestream—no confusion.</li>
                <li><b>Lighting Team:</b> Knows exactly when to trigger scenes or transitions.</li>
                <li><b>Stage Manager:</b> Cues the pastor, choir, or worship band right on time.</li>
                <li><b>Worship Leader:</b> Gets updates through a headset instead of guessing or texting.</li>
            </ul>
        </div>
    </div>

    <!-- Why It’s Great for Churches -->
    <div class="bg-gray-700 rounded-lg shadow-lg overflow-hidden border border-gray-600">
        <img class="w-full" src="${imageMap.CHURCH_GREAT_FOR}" alt="Production team in headsets" onerror="this.src='https://placehold.co/600x384/1f2937/4ade80?text=Why+It%27s+Great'">
        <div class="p-6">
            <h2 class="text-xl font-semibold text-green-400 mb-2">Why It’s Great for Churches</h2>
            <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>Everyone stays connected during services and events.</li>
                <li>Volunteers feel confident and supported.</li>
                <li>Works with the church’s existing network cables.</li>
                <li>Clear, reliable sound without delay.</li>
                <li>Grows with your ministry as your team expands.</li>
            </ul>
        </div>
    </div>

</main>

<footer class="mt-8 pt-6 border-t border-gray-700">
    <button data-action="set-step" data-step="2" class="w-full btn btn-primary py-3 text-lg hover:bg-green-700">
        Start Designing Now &rarr;
    </button>
</footer>
`;
}


function renderStep2() {
    const disabled = (!State.projectDetails.configName || !State.projectDetails.userName || !State.projectDetails.userEmail || !State.projectDetails.organizationName) ? 'disabled' : "";
    return `
<div class="space-y-6">
    <h2 class="text-xl font-semibold text-green-400">2. Project Naming & Setup</h2>
    <div class="p-4 bg-gray-700 rounded-lg border-l-4 border-green-500">
        <p class="text-sm text-gray-300">Define your project. This information is used to save and export configurations.</p>
        <button data-action="skip-to-manual-check" class="mt-3 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold">Skip to Manual BOM Entry &rarr;</button>
    </div>
    <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-300" for="configName">Configuration Name</label>
            <input class="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300" id="configName" type="text" value="${escapeHtml(State.projectDetails.configName || "")}" placeholder="e.g., Main Stage Intercom" />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300" for="organizationName">Organization Name</label>
            <input class="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300" id="organizationName" type="text" value="${escapeHtml(State.projectDetails.organizationName || "")}" placeholder="e.g., City Church" />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300" for="userName">Your Name (Designer)</label>
            <input class="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300" id="userName" type="text" value="${escapeHtml(State.projectDetails.userName || "")}" placeholder="e.g., John Smith" />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300" for="userEmail">Your Email</label>
            <input class="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300" id="userEmail" type="email" value="${escapeHtml(State.projectDetails.userEmail || "")}" placeholder="e.g., john.smith@example.com" />
        </div>
    </div>
    <button id="start-step2-btn" data-action="start-step2-check" ${disabled} class="w-full btn py-2 ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'btn-primary hover:bg-green-700'}">Start Adding Locations</button>
</div>`;
}

function renderStep3LocationManager(aggregatedBOM) {
    return `
<div class="space-y-6">
    <h2 class="text-xl font-semibold text-green-400">3. Define Green-GO Locations</h2>
    <!-- EDIT: Added description paragraph -->
    <p class="text-sm text-gray-300 -mt-4">
        A Location represents a physical area where communication devices are needed - such as Stage, FOH, or Backstage. Defining locations helps organize your system and plan communication paths clearly.
    </p>
    <div class="flex-between pb-3 border-b border-gray-700">
        <h3 class="text-lg font-medium text-gray-300">Locations: ${State.locations.length}</h3>
        <button data-action="open-location-modal" class="btn btn-primary px-4 py-2 hover:bg-green-700">+ Add Location</button>
    </div>
    ${State.locations.length === 0 ? `
    <div class="text-center py-10 text-gray-500 bg-gray-700 rounded-lg">Click "Add Location" to start</div>
    ` : `
    <div class="space-y-3">
        ${State.locations.map(loc => {
        const parts = [];
        if (loc.wiredCount > 0) parts.push(`${loc.wiredCount} Wired`);
        if (loc.wirelessCount > 0) parts.push(`${loc.wirelessCount} Wireless`);
        if (loc.wallStationCount > 0) parts.push(`${loc.wallStationCount} Wall`);
        if ((loc.keyPanelCount || 0) > 0) parts.push(`${loc.keyPanelCount} Panel`);
        const summary = parts.length > 0 ? parts.join(', ') : 'No Devices';
        return `
            <div class="flex-between p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm">
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-100">${escapeHtml(loc.name)}</p>
                    <p class="text-xs text-gray-400">${summary}</p>
                </div>
                <div class="flex space-x-2">
                    <!-- REQ #1: Making icons transparent. This is best done with CSS, but adding 'opacity-75' is a fallback. -->
                    <!-- I will ask for css/styles.css to do this properly. -->
                    <button data-action="edit-location" data-id="${loc.id}" class="text-indigo-400 hover:text-indigo-300 p-1">${Icons.Edit()}</button>
                    <button data-action="delete-location" data-id="${loc.id}" class="text-red-400 hover:text-red-300 p-1">${Icons.Trash2()}</button>
                </div>
            </div>
            `;
    }).join("")}
    </div>
    `}
    <button data-action="go-step4" ${State.locations.length === 0 ? 'disabled' : ""} class="w-full btn py-2 ${State.locations.length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'btn-primary hover:bg-green-700'}">Continue to Infrastructure &rarr;</button>
</div>`;
}

function renderStep4Infrastructure() {
    const inf = State.infrastructureDetails;
    // REQ #2: Removed isFarDistance variable
    return `
<div class="space-y-6">
    <h2 class="text-xl font-semibold text-green-400">4. Infrastructure & Connectivity</h2>
    <p class="text-gray-300">These questions determine advanced networking components needed.</p>

    <div class="p-4 bg-gray-700 rounded-lg border-l-4 border-indigo-500">
        <label class="inline-flex items-center font-medium text-gray-300">
            <input type="checkbox" data-inf-field="needsWalkieTalkieInterface" ${inf.needsWalkieTalkieInterface ? 'checked' : ""} class="h-4 w-4 text-indigo-500 rounded bg-gray-600 border-gray-500" />
            <span class="ml-2">Interface with Walkie-Talkies?</span>
        </label>
        ${inf.needsWalkieTalkieInterface ? '<p class="text-xs text-red-400 mt-2">Adds RDX Interface to BOM</p>' : ""}
    </div>

    <div class="p-4 bg-gray-700 rounded-lg border-l-4 border-indigo-500">
        <label class="block font-medium text-gray-300 mb-2">Connect to separate building/location (Bridge)?</label>
        <div class="flex space-x-4 text-gray-300">
            <label class="inline-flex items-center">
                <input type="radio" data-inf-field="isMultiSite" name="isMultiSite" value="no" ${inf.isMultiSite === 'no' ? 'checked' : ""} class="text-indigo-500 bg-gray-600 border-gray-500" />
                <span class="ml-2 text-sm">No</span>
            </label>
            <label class="inline-flex items-center">
                <input type="radio" data-inf-field="isMultiSite" name="isMultiSite" value="yes" ${inf.isMultiSite === 'yes' ? 'checked' : ""} class="text-indigo-500 bg-gray-600 border-gray-500" />
                <span class="ml-2 text-sm">Yes</span>
            </label>
        </div>
        ${inf.isMultiSite === 'yes' ? '<p class="text-xs text-red-400 mt-2">Adds Bridge Interface to BOM</p>' : ""}
    </div>

    <!-- REQ #2: Removed "Furthest point" question block -->

    <div class="flex-between pt-4 border-t border-gray-700">
        <button data-action="set-step" data-step="3" class="btn btn-secondary px-4 py-2">Back</button>
        <button data-action="set-step" data-step="5" class="btn btn-primary px-4 py-2 hover:bg-green-700">Review & Export &rarr;</button>
    </div>
</div>`;
}

function renderStep5Review(productsToDisplay, totals) {
    const validation = runValidationChecks(productsToDisplay);
    const fullListWithCounts = initialProducts.map(p => ({
        ...p,
        count: productsToDisplay.find(item => item.id === p.id)?.count || 0
    })).filter(p => p.id !== 'HSETCUST');

    // REQ #3a: Sort list to show items with count > 0 first, then alphabetically
    const sortedProducts = fullListWithCounts.sort((a, b) => {
        if (a.count > 0 && b.count === 0) return -1;
        if (a.count === 0 && b.count > 0) return 1;
        return a.name.localeCompare(b.name);
    });

    const groups = productGroups.map(g => {
        if (g.name === 'Customer Supplied') return null;
        return {
            ...g,
            products: sortedProducts.filter(p => p.group === g.name)
        };
    }).filter(g => g && g.products.length > 0); // Also filter out groups with no products to show

    const getImageTag = (id) => {
        const url = imageMap[id];
        if (!url) return "";
        const altText = getProduct(id)?.name || 'Product';
        // EDIT: Removed 'bg-white' class
        return `<img loading="lazy" src="${url}" alt="${altText}" class="img-bom-thumb hidden sm:block p-1" onerror="this.style.display='none'" />`;
    };

    return `
<div class="space-y-6">
    <h2 class="text-xl font-semibold text-green-400">5. Final Bill of Materials</h2>
    <div class="p-4 border-l-4 border-green-500 bg-gray-700 rounded-lg">
        <p class="text-sm text-gray-300">Review and manually adjust quantities if needed.</p>
        <div class="mt-2 font-medium text-sm text-gray-300">Project: <strong>${escapeHtml(State.projectDetails.configName || 'UNNAMED')}</strong> by <strong>${escapeHtml(State.projectDetails.userName || 'DESIGNER')}</strong></div>
    </div>

    <div class="p-4 shadow rounded-lg ${validation.status === 'PASS' ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-500'} border-l-4">
        <h3 class="lg:text-lg font-bold flex items-center ${validation.status === 'PASS' ? 'text-green-400' : 'text-red-400'}">
            <!-- EDIT: Wrapped icon in span and set size -->
            <span class="w-16 h-16 mr-2">
                ${validation.status === 'PASS' ? Icons.CheckCircle('w-16 h-16') : Icons.AlertCircle('w-16 h-16')}
            </span>
            Validation: ${validation.status}
        </h3>
        ${validation.validation_issues.length ? `<ul class="list-disc ml-5 ${validation.status === 'PASS' ? 'text-green-300' : 'text-red-300'} text-sm mt-2">${validation.validation_issues.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : ""}
    </div>

    <div class="space-y-6">
        ${groups.map(group => `
        <div class="space-y-3">
            <h3 class="text-lg font-bold text-gray-100 border-b border-gray-600 pb-1 flex items-center">
                <!-- EDIT: Wrapped icon in span and set size -->
                <span class="w-16 h-16 mr-2">
                    ${Icons[group.icon] ? Icons[group.icon]('w-16 h-16 text-green-400') : ""}
                </span>
                ${group.name}
            </h3>
            ${group.products.map(item => `
            <div class="flex items-center justify-between p-3 ${item.count > 0 ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700 opacity-70'} border rounded-lg shadow-sm">
                <div class="flex-1 min-w-0 flex items-center">
                    ${getImageTag(item.id)}
                    <div>
                        <div class="font-semibold ${item.count > 0 ? 'text-gray-100' : 'text-gray-400'}">${escapeHtml(item.name)} <span class="text-xs text-gray-400">(${escapeHtml(item.sku || "")})</span></div>
                        <div class="text-xs ${item.count > 0 ? 'text-green-400' : 'text-gray-500'}">${escapeHtml(item.role || "")}</div>
                        <div class="text-sm font-bold text-indigo-400 mt-1">${fmt(item.price || 0)}</div>
                    </div>
                </div>
                <!-- EDIT: Replaced button layout with bom-control classes -->
                <div class="bom-control ml-4">
                    <button data-action="dec-item" data-id="${item.id}" class="bom-control-btn bom-minus">-</button>
                    <span class="bom-count ${item.count === 0 ? 'text-gray-500' : 'text-gray-100'}">${item.count || 0}</span>
                    <button data-action="inc-item" data-id="${item.id}" class="bom-control-btn bom-plus">+</button>
                </div>
            </div>
            `).join("")}
        </div>
        `).join("")}
    </div>

    <div class="flex-col items-center pt-4 border-t border-gray-700">
        <div class="flex justify-between w-full space-x-4">
            <button data-action="set-step" data-step="4" class="btn btn-secondary px-4 py-2">Back</button>
            <button data-action="save-config" class="btn bg-indigo-600 hover:bg-indigo-700 text-white py-3">Save Configuration</button>
            <button data-action="save-and-notify" class="btn btn-primary py-3 hover:bg-green-700" ${State.isSending ? 'disabled' : ""}>
                ${State.isSending ? 'Sending...' : 'Email Design'}
            </button>
        </div>
        <p class="text-sm text-gray-400 mt-3 text-center">
            This will notify S&S that you have saved a new design.
        </p>
    </div>
</div>`;
}

function renderSavedConfigs() {
    return `
<div class="p-4 bg-gray-800 shadow-xl rounded-lg border border-gray-700">
    <!-- EDIT: Added flex-between and Delete All button -->
    <div class="flex-between items-center mb-4">
        <!-- REQ #6: Change title -->
        <h2 class="text-2xl font-bold text-white flex items-center">
            <!-- EDIT: Wrapped icon in span to constrain size -->
            <span class="w-6 h-6 mr-2">${Icons.Clipboard('w-6 h-6 text-green-400')}</span>
            Saved Configurations
        </h2>
        <!-- EDIT: Added Delete All button -->
        ${State.savedConfigs.length > 0 ? `
        <button data-action="delete-all-saved" class="btn btn-secondary bg-red-800 hover:bg-red-700 text-red-100 px-3 py-1 text-sm">
            ${Icons.Trash2('w-4 h-4 mr-1')}
            Delete All
        </button>
        ` : ''}
    </div>
    <div class="space-y-3">
        ${State.savedConfigs.length === 0 ? '<p class="text-gray-400">No saved configurations</p>' : State.savedConfigs.map(cfg => `
        <div class="flex-between p-3 bg-gray-700 border border-gray-600 rounded-lg">
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-100">${escapeHtml(cfg.name)}</p>
                <p class="text-xs text-gray-400">${escapeHtml(cfg.user)} | ${new Date(cfg.id).toLocaleDateString()} | ${fmt(cfg.totalCost || 0)}</p>
            </div>
            <!-- EDIT: Restyled Load/Delete buttons -->
            <div class="flex space-x-2">
                <button data-action="load-config" data-id="${cfg.id}" class="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold">Load</button>
                <button data-action="delete-saved" data-id="${cfg.id}" data-name="${escapeHtml(cfg.name)}" class="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold">Delete</button>
            </div>
        </div>
        `).join("")}
    </div>
</div>`;
}

/**
 * EDIT: This function now renders *all* active alerts.
 * It's split into Modals (which block UI) and Toasts (which overlay).
 */
function renderSystemAlerts() {
    if (!State.systemAlert.show) return "";

    const alert = State.systemAlert;
    const type = alert.type;

    // Render MODALS (confirm, confirm-danger)
    if (type === 'confirm' || type === 'confirm-danger') {
        const isDanger = type === 'confirm-danger';
        const icon = isDanger ? Icons.AlertCircle('w-6 h-6 text-red-400') : Icons.CheckCircle('w-6 h-6 text-green-400');
        const bgColor = isDanger ? 'bg-red-800 border-red-700' : 'bg-green-800 border-green-700';
        const confirmBtnColor = isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';
        const textColor = isDanger ? 'text-red-100' : 'text-green-100';

        return `
        <div class="modal-backdrop z-modal" style="pointer-events: auto;">
            <div class="p-6 rounded-xl shadow-2xl w-full max-w-md ${bgColor} border ${textColor}">
                <div class="flex space-x-3">
                    <div class="flex-shrink-0">${icon}</div>
                    <div class="flex-1">
                        <p class="font-semibold text-lg text-white">${escapeHtml(alert.message || "")}</p>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-5">
                    <button data-action="alert-cancel" class="px-4 py-2 text-sm bg-gray-600 text-gray-200 rounded-md border border-gray-500 hover:bg-gray-500 font-medium">Cancel</button>
                    <button data-action="alert-confirm" class="px-4 py-2 text-sm text-white rounded-md ${confirmBtnColor} font-medium">Confirm</button>
                </div>
            </div>
        </div>`;
    }

    // Render TOASTS (success, error, info)
    // These render inside the #alert-container which is position: fixed
    let style, icon;
    if (type === 'success') {
        style = 'bg-green-700 text-white border-green-600';
        icon = Icons.CheckCircle('w-5 h-5');
    } else if (type === 'error') {
        style = 'bg-red-700 text-white border-red-600';
        icon = Icons.AlertCircle('w-5 h-5');
    } else { // 'info'
        style = 'bg-yellow-700 text-white border-yellow-600';
        icon = Icons.AlertCircle('w-5 h-5');
    }

    return `
    <div class="toast-notification ${style}" style="pointer-events: auto;">
        <div class="flex items-center space-x-2">
            ${icon}
            <span class="font-medium">${escapeHtml(alert.message)}</span>
        </div>
    </div>`;
}


function renderQuantityControl(id, value) {
    return `
<div class="bubble-control" data-field-id="${id}">
    <button data-loc-action="dec-qty" data-id="${id}" class="bubble-minus"><span class="text-2xl leading-none">-</span></button>
    <span id="${id}" class="bubble-count">${value}</span>
    <button data-loc-action="inc-qty" data-id="${id}" class="bubble-plus"><span class="text-2xl leading-none">+</span></button>
</div>`;
}

function getModalImageTag(productId) {
    const url = imageMap[productId];
    if (!url) return "";
    const altText = getProduct(productId)?.name || 'Product';
    return `<img loading="lazy" src="${url}" alt="${altText}" class="img-modal-icon" onerror="this.style.display='none'" />`;
}

function renderLocationModal() {
    const isEditing = State.editingLocationId !== null;
    const readValue = (id) => {
        const location = isEditing ? State.locations.find(l => l.id === State.editingLocationId) : null;
        if (location) {
            if (id === 'loc-keypanelcount') return location.keyPanelCount || 0;
            if (id === 'loc-wired') return location.wiredCount || 0;
            if (id === 'loc-wireless') return location.wirelessCount || 0;
            if (id === 'loc-wallstation') return location.wallStationCount || 0;
            if (id === 'loc-beacon') return location.beaconCount || 0;
            if (id === 'h-std1') return location.headsetSplit?.stdOneEar || 0;
            if (id === 'h-std2') return location.headsetSplit?.stdDualEar || 0;
            if (id === 'h-comf1') return location.headsetSplit?.comfortOneEar || 0;
            if (id === 'h-comf2') return location.headsetSplit?.comfortDualEar || 0;
            if (id === 'h-handset') return location.headsetSplit?.handset || 0;
        }
        return 0;
    };

    // EDIT: Increased image sizes
    // w-10 h-10 -> w-12 h-12
    // w-8 h-8 -> w-10 h-10
    return `
<div class="modal-backdrop z-modal" style="pointer-events: auto;">
    <div class="modal-content">
        <h3 class="text-2xl font-bold mb-4 border-b border-gray-600 pb-2 text-green-400">${isEditing ? 'Edit Location' : 'Add Location'}</h3>
        <div class="space-y-4 overflow-y-auto pr-2" style="max-height: 60vh;">
            
            <input id="loc-name" type="text" placeholder="Location Name" class="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300" />
            <p id="loc-name-error" class="text-sm text-red-400 font-medium" style="display: none;">Location Name required</p>

            <h4 class="font-semibold text-gray-200 mt-2">Device Counts</h4>
            <div class="grid md:grid-cols-3 gap-3">
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center">
                        <img loading="lazy" src="${imageMap.GBPX}" alt="Wired Beltpack" class="w-12 h-12 object-contain mr-1" onerror="this.style.display='none'"> Wired:
                    </label>
                    ${renderQuantityControl('loc-wired', readValue('loc-wired'))}
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center">
                        <img loading="lazy" src="${imageMap.WBPX}" alt="Wireless Beltpack" class="w-12 h-12 object-contain mr-1" onerror="this.style.display='none'"> Wireless:
                    </label>
                    ${renderQuantityControl('loc-wireless', readValue('loc-wireless'))}
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center">
                        <img loading="lazy" src="${imageMap.WSX}" alt="Wall Station" class="w-12 h-12 object-contain mr-1" onerror="this.style.display='none'"> Wall:
                    </label>
                    ${renderQuantityControl('loc-wallstation', readValue('loc-wallstation'))}
                </div>
            </div>

            <div class="grid md:grid-cols-4 gap-3 mt-4 items-end">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center">
                        <img loading="lazy" src="${imageMap.MCXD}" alt="Key Panel" class="w-12 h-12 object-contain mr-1" onerror="this.style.display='none'"> Key Panels:
                    </label>
                    ${renderQuantityControl('loc-keypanelcount', readValue('loc-keypanelcount'))}
                </div>
                <div id="loc-mount-wrap" style="visibility:hidden;">
                    <label class="block text-sm font-medium mb-1 text-gray-300">Mount:</label>
                    <select id="loc-basemount" class="w-full p-2 border border-gray-600 rounded h-10 bg-gray-700 text-gray-300">
                        <option value="desktop">Desktop</option>
                        <option value="rackmount">Rackmount</option>
                    </select>
                </div>
            </div>

            <div class="grid md:grid-cols-4 gap-3 mt-4">
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center">
                        <img loading="lazy" src="${imageMap.BCON}" alt="Beacon" class="w-12 h-12 object-contain mr-1" onerror="this.style.display='none'"> Beacons:
                    </label>
                    ${renderQuantityControl('loc-beacon', readValue('loc-beacon'))}
                </div>
            </div>

            <div id="loc-hd-wrap" class="hidden items-center p-2 bg-gray-700 border border-yellow-600 rounded-md">
                <input id="loc-hd" type="checkbox" class="h-4 w-4 mr-2 text-yellow-500 bg-gray-600 border-gray-500 rounded focus:ring-yellow-500" />
                <span class="text-sm text-yellow-300 flex items-center">Use <strong class="mx-1">Heavy Duty/Sports</strong> Wireless <img loading="lazy" src="${imageMap.WBPXHD}" alt="Sport Beltpack" class="w-10 h-10 object-contain ml-1" onerror="this.style.display='none'"></span>
            </div>

            <h4 class="font-semibold text-gray-200 mt-2">Headset Allocation <span id="loc-headset-total" class="text-xs text-gray-400"></span></h4>
            <p id="loc-headset-remaining" class="text-sm font-medium text-red-400">Remaining: 0</p>
            <p id="loc-headset-warning" class="text-xs font-medium text-red-400" style="display: none;">Allocation required or check Customer Supplied</p>

            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center"><img loading="lazy" src="${imageMap.HSET1E}" alt="Single Headset" class="w-10 h-10 object-contain mr-1" onerror="this.style.display='none'"> Std Single:</label>
                    ${renderQuantityControl('h-std1', readValue('h-std1'))}
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center"><img loading="lazy" src="${imageMap.HSET2E}" alt="Dual Headset" class="w-10 h-10 object-contain mr-1" onerror="this.style.display='none'"> Std Dual:</label>
                    ${renderQuantityControl('h-std2', readValue('h-std2'))}
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center"><img loading="lazy" src="${imageMap.HSETC1E}" alt="Comfort Single" class="w-10 h-10 object-contain mr-1" onerror="this.style.display='none'"> Comf Single:</label>
                    ${renderQuantityControl('h-comf1', readValue('h-comf1'))}
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center"><img loading="lazy" src="${imageMap.HSETC2E}" alt="Comfort Dual" class="w-10 h-10 object-contain mr-1" onerror="this.style.display='none'"> Comf Dual:</label>
                    ${renderQuantityControl('h-comf2', readValue('h-comf2'))}
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-300 flex items-center"><img loading="lazy" src="${imageMap.TELH}" alt="Handset" class="w-10 h-10 object-contain mr-1" onerror="this.style.display='none'"> Handset:</label>
                    ${renderQuantityControl('h-handset', readValue('h-handset'))}
                </div>
            </div>

            <div id="loc-customer-supplied-wrap" class="hidden items-center p-2 bg-gray-700 border border-indigo-500 rounded-md mt-4">
                <input id="loc-existing-headsets" type="checkbox" class="h-4 w-4 mr-2 text-indigo-500 bg-gray-600 border-gray-500 rounded focus:ring-indigo-500" />
                <span class="text-sm text-indigo-300">Customer Supplied Headsets cover remaining</span>
            </div>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
            <button data-action="close-location-modal" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button data-action="save-location" id="save-location-btn" class="btn btn-primary px-4 py-2 hover:bg-green-700">Add Location</button>

        </div>
    </div>
</div>`;
}

function renderPrintSection(productsToDisplay, totals) {
    const { equipmentCost, labor, programming, grand } = totals;
    const validation = runValidationChecks(productsToDisplay);
    const today = new Date().toLocaleDateString();

    const filteredList = productsToDisplay.filter(p => p.count > 0);
    const groups = productGroups.map(g => {
        if (g.name === 'Customer Supplied') return null;
        const groupProducts = filteredList.filter(p => p.group === g.name).sort((a, b) => a.name.localeCompare(b.name));
        if (groupProducts.length === 0) return null;
        return { name: g.name, products: groupProducts };
    }).filter(Boolean);

    return `
<div class="print-only">
    <div class="flex-between border-b pb-2 mb-8">
        <div>
            <h1 class="text-3xl font-extrabold text-green-800">Green-GO System Quote</h1>
            <!-- EDIT: Removed CRC Logo line from here -->
            <div class="mt-4 text-sm">
                <p><strong>Project:</strong> ${escapeHtml(State.projectDetails.configName || 'N/A')}</p>
                <p><strong>Designer:</strong> ${escapeHtml(State.projectDetails.userName || 'N/A')}</p>
                <p><strong>Date:</strong> ${today}</p>
            </div>
        </div>
        <img src="https://sspro-installs.github.io/media-assets/branding/SS-Pro-Logo-Set-Black.png" alt="S&S Logo Print" class="h-16 w-auto object-contain">
    </div>

    <h2 class="text-2xl font-bold text-gray-800 mb-4">Bill of Materials</h2>
    <table class="w-full text-sm" style="border-collapse: collapse;">
        <thead>
            <tr class="border-b-2 border-gray-300">
                <th class="text-left p-2">SKU</th>
                <th class="text-left p-2">Product Name</th>
                <th class="text-right p-2">Qty</th>
                <th class="text-right p-2">Unit Price</th>
                <th class="text-right p-2">Total</th>
            </tr>
        </thead>
        <tbody>
            ${groups.map(g => ` 
            <tr>
                <td colspan="5" class="font-bold text-lg pt-4 pb-1 border-b">${g.name}</td>
            </tr>
            ${g.products.map(p => `
            <tr class="border-b border-gray-200">
                <td class="p-2">${escapeHtml(p.sku)}</td>
                <td class="p-2">${escapeHtml(p.name)}<br><span class="text-xs text-gray-500">${escapeHtml(p.role)}</span></td>
                <td class="text-right p-2">${p.count}</td>
                <td class="text-right p-2">${fmt(p.price)}</td>
                <td class="text-right p-2">${fmt(p.price * p.count)}</td>
            </tr>
            `).join("")}
            `).join("")}
        </tbody>
    </table>

    <div class="max-w-sm ml-auto mt-8 space-y-3">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Quote Summary</h2>
        <div class="flex-between font-semibold text-lg border-b pb-2">
            <span>Equipment Total:</span>
            <span class="text-green-600">${fmt(equipmentCost)}</span>
        </div>
        <!-- EDIT: Removed percentages -->
        <div class="flex-between">
            <span>Labor:</span>
            <span class="font-medium">${fmt(labor)}</span>
        </div>
        <div class="flex-between">
            <span>Programming:</span>
            <span class="font-medium">${fmt(programming)}</span>
        </div>
        <div class="flex-between font-extrabold text-2xl mt-4 border-t-4 pt-4 border-green-700">
            <span>GRAND TOTAL:</span>
            <span class="text-red-600">${fmt(grand)}</span>
        </div>
    </div>

    <div class="mt-8 pt-4 border-t">
        <h3 class="font-bold text-lg">System Validation</h3>
        <div class="p-4 ${validation.status === 'PASS' ? 'bg-green-100 border-green-700' : 'bg-red-50 border-red-500'} border-l-4 rounded-lg mt-2">
            <p><strong>Status: ${validation.status}</strong></p>
            ${validation.validation_issues.length ? `<ul class="list-disc ml-5 text-red-700 text-sm mt-2">${validation.validation_issues.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : ""}
        </div>
    </div>
</div>`;
}

