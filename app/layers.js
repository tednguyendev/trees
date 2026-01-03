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
  const container = document.getElementById('layersDropdown');
  if (!container) return;

  let html = '';

  layerConfig.forEach((layer, index) => {
    const isFirst = index === 0;
    const bgClass = isFirst ? 'bg-gray-50' : '';

    html += `
      <div class="flex items-center justify-between px-3 py-2.5 border-b ${bgClass}">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400 w-4">${layer.level}</span>
          <span class="text-sm font-medium">${layer.name}</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="${layer.id}" ${layer.defaultOn ? 'checked' : ''} class="sr-only peer">
          <div class="w-9 h-5 bg-gray-300 peer-checked:bg-green-500 rounded-full transition-colors"></div>
          <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
        </label>
      </div>
    `;
  });

  // Base map (non-toggleable)
  html += `
    <div class="flex items-center justify-between px-3 py-2.5 bg-gray-100">
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400 w-4"></span>
        <span class="text-sm text-gray-500">Base Map (street)</span>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
