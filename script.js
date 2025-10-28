/* =========================================================
   Green-GO Dynamic System Designer
   Auto-mapped Media Assets via GitHub
   ========================================================= */

/* --------------------------
   Configuration
   -------------------------- */
const ASSET_BASE = "https://sspro-installs.github.io/media-assets/vendors"; // Base path for vendors

const vendors = {
  greengo: [
    "GGO_BC6.png",
    "GGO_BPXSP.png",
    "GGO_BRIDGEX.png",
    "GGO_INTERFACEX.png",
    "GGO_Q4W.png",
    "GGO-GNM300.png",
    "GGO-GNM430.png"
  ],
  beyerdynamic: [
    "Beyerdynamic-DT280.png",
    "Beyerdynamic-DT-290-MKII.png"
  ],
  nexo: [
    "NXAMP4X2MK2.png",
    "NXAMP4X1MK2.png"
  ]
};

/* --------------------------
   Page Initialization
   -------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="logo-bar">
      <img src="https://sspro-installs.github.io/media-assets/clients/crc/crc_logo.png" alt="CRC Logo" />
      <img src="https://sspro-installs.github.io/media-assets/branding/sspro_logo.png" alt="S&S Pro Logo" />
    </div>

    <h1 class="text-3xl font-bold text-green-800 mb-6">Green-GO Dynamic System Designer</h1>
    <p class="text-green-700 mb-4">Create and visualize your custom Green-GO communication setup.</p>

    <div id="product-gallery" class="space-y-8"></div>

    <footer class="mt-10">
      © ${new Date().getFullYear()} S&S Pro Installations • All Rights Reserved
    </footer>
  `;

  renderAllVendors();
});

/* --------------------------
   Render Vendor Galleries
   -------------------------- */
function renderAllVendors() {
  const galleryContainer = document.getElementById("product-gallery");

  Object.keys(vendors).forEach(vendor => {
    const products = vendors[vendor];

    const section = document.createElement("div");
    section.className = "card";

    section.innerHTML = `
      <h2 class="text-2xl font-semibold mb-4 capitalize">${vendor}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" id="gallery-${vendor}">
        ${products
          .map(
            img => `
          <div class="flex flex-col items-center p-2 border rounded-lg hover:bg-green-50 transition">
            <img src="${ASSET_BASE}/${vendor}/${img}" alt="${img}" class="img-medium mb-2" />
            <span class="text-sm text-gray-600">${img.replace(".png", "")}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    galleryContainer.appendChild(section);
  });
}

/* --------------------------
   Example Interactive Logic
   -------------------------- */

function showModal(title, contentHTML) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2 class="text-2xl font-bold text-green-800 mb-4">${title}</h2>
      <div>${contentHTML}</div>
      <div class="mt-6 text-right">
        <button class="btn" id="closeModal">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("closeModal").onclick = () => modal.remove();
}
