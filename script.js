// ===============================================================
//  Green-GO Dynamic System Designer
//  Optimized for GitHub Pages (mobile friendly + robust images)
// ===============================================================

(function () {
  // ---------- Safe image helper ----------
  function safeImg(src, alt = "", cls = "") {
    const fallback = "https://placehold.co/150x100/1F2937/ffffff?text=Image";
    return `<img 
      src="${src}" 
      alt="${alt}" 
      class="${cls}" 
      loading="lazy" 
      decoding="async"
      referrerpolicy="no-referrer"
      crossorigin="anonymous"
      style="max-width:100%;height:auto"
      onerror="this.onerror=null;this.src='${fallback}'"
    />`;
  }

  // ---------- Image & product maps ----------
  const imageMap = {
    // replace these Imgur links with your GitHub-hosted images when ready
    WBPX: "https://i.imgur.com/YOURIMAGE1.png",
    SW6: "https://i.imgur.com/YOURIMAGE2.png",
    CONVERTER: "https://i.imgur.com/YOURIMAGE3.png",
    // add more...
  };

  const productMap = {
    WBPX: { name: "Wired and Wireless Beltpacks", price: 123 },
    SW6: { name: "Switch 6", price: 456 },
    CONVERTER: { name: "Converter", price: 789 },
    // add more...
  };

  // ---------- Step logic example ----------
  const app = document.getElementById("app");

  function renderStep1() {
    app.innerHTML = `
      <section class="text-center space-y-6">
        <h1 class="text-2xl font-bold text-green-800">Step 1: Choose Components</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${Object.entries(productMap)
            .map(
              ([id, prod]) => `
              <div class="border rounded-xl p-4 bg-white shadow hover:shadow-lg transition">
                ${safeImg(imageMap[id], prod.name, "mx-auto mb-2")}
                <h2 class="font-semibold text-green-700">${prod.name}</h2>
                <p class="text-sm text-gray-600">$${prod.price}</p>
                <button data-id="${id}" class="mt-2 px-4 py-1 bg-green-600 text-white rounded">Add</button>
              </div>`
            )
            .join("")}
        </div>
      </section>`;
    document.querySelectorAll("button[data-id]").forEach((btn) =>
      btn.addEventListener("click", () => addItem(btn.dataset.id))
    );
  }

  // ---------- BOM / item list ----------
  const bom = {};

  function addItem(id) {
    bom[id] = (bom[id] || 0) + 1;
    renderBOM();
  }

  function removeItem(id) {
    if (!bom[id]) return;
    bom[id]--;
    if (bom[id] <= 0) delete bom[id];
    renderBOM();
  }

  function renderBOM() {
    const containerId = "bom";
    let bomDiv = document.getElementById(containerId);
    if (!bomDiv) {
      bomDiv = document.createElement("div");
      bomDiv.id = containerId;
      app.appendChild(bomDiv);
    }
    const items = Object.keys(bom);
    if (items.length === 0) {
      bomDiv.innerHTML = `<div class="mt-6 text-gray-500 italic">No items selected</div>`;
      return;
    }

    const rows = items
      .map(
        (id) => `
        <div class="flex items-center justify-between py-2 border-b">
          <div class="flex items-center gap-3">
            ${safeImg(imageMap[id], productMap[id]?.name, "w-12 h-auto rounded")}
            <span>${productMap[id]?.name}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-green-700 font-semibold">x${bom[id]}</span>
            <button data-id="${id}" class="text-red-600 hover:text-red-800 font-bold">−</button>
          </div>
        </div>`
      )
      .join("");

    bomDiv.innerHTML = `
      <div class="mt-8 p-4 bg-white rounded-xl shadow">
        <h3 class="text-lg font-bold text-green-800 mb-4">Bill of Materials</h3>
        ${rows}
      </div>`;

    bomDiv.querySelectorAll("button[data-id]").forEach((btn) =>
      btn.addEventListener("click", () => removeItem(btn.dataset.id))
    );
  }

  // ---------- Initialization ----------
  document.addEventListener("DOMContentLoaded", renderStep1);
})();
