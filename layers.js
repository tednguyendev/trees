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

// Generate layer panel HTML
function generateLayerPanel() {
  const container = document.getElementById('layersList');
  if (!container) return;

  let html = '';

  layerConfig.forEach((layer, index) => {
    html += `
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 hover:bg-slate-700/50 transition-colors group">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-400 font-medium group-hover:scale-110 transition-transform">${layer.level}</span>
          <span class="text-sm text-slate-300">${layer.name}</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="${layer.id}" ${layer.defaultOn ? 'checked' : ''} class="sr-only peer">
          <div class="w-9 h-5 bg-slate-600 peer-checked:bg-green-500 rounded-full transition-colors duration-200"></div>
          <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4"></div>
        </label>
      </div>
    `;
  });

  // Base map (non-toggleable)
  html += `
    <div class="flex items-center justify-between px-4 py-2.5 bg-slate-900/50">
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded bg-slate-700 flex items-center justify-center">
          <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </span>
        <span class="text-sm text-slate-500">Base Map</span>
      </div>
      <span class="text-xs text-slate-500">Default</span>
    </div>
  `;

  container.innerHTML = html;
}
