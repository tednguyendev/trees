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

// Generate layer panel HTML (dark theme)
function generateLayerPanel() {
  const container = document.getElementById('layersList');
  if (!container) return;

  let html = '';

  layerConfig.forEach((layer, index) => {
    html += `
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs text-gray-400 font-medium">${layer.level}</span>
          <span class="text-sm text-white">${layer.name}</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="${layer.id}" ${layer.defaultOn ? 'checked' : ''} class="sr-only peer">
          <div class="w-10 h-6 bg-white/10 peer-checked:bg-green-500 rounded-full transition-all duration-200"></div>
          <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-200 peer-checked:translate-x-4"></div>
        </label>
      </div>
    `;
  });

  // Base map (non-toggleable)
  html += `
    <div class="flex items-center justify-between px-4 py-3 bg-white/5">
      <div class="flex items-center gap-3">
        <span class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
          <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </span>
        <span class="text-sm text-gray-500">Base Map</span>
      </div>
      <span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Default</span>
    </div>
  `;

  container.innerHTML = html;
}
