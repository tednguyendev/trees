// Layer configuration
const layerConfig = [
  {
    id: 'layerLabels',
    name: 'Labels',
    level: 3,
    defaultOn: true
  },
  {
    id: 'layerZones',
    name: 'Zone Boundaries',
    level: 2,
    defaultOn: true
  },
  {
    id: 'layerTrees',
    name: 'Tree Positions',
    level: 1,
    defaultOn: true
  }
];

// Generate layer panel HTML (light theme)
function generateLayerPanel() {
  const container = document.getElementById('layersList');
  if (!container) return;

  let html = '';

  layerConfig.forEach((layer, index) => {
    html += `
      <div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold group-hover:scale-110 transition-transform">${layer.level}</span>
          <span class="text-sm text-gray-700 font-medium">${layer.name}</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="${layer.id}" ${layer.defaultOn ? 'checked' : ''} class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-all duration-300 shadow-inner"></div>
          <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-5"></div>
        </label>
      </div>
    `;
  });

  // Base map (non-toggleable)
  html += `
    <div class="flex items-center justify-between px-4 py-3.5 bg-gray-50/50">
      <div class="flex items-center gap-3">
        <span class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </span>
        <span class="text-sm text-gray-600 font-medium">Base Map</span>
      </div>
      <span class="text-xs text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full font-medium">Active</span>
    </div>
  `;

  container.innerHTML = html;
}
