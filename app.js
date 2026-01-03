// State
let trees = [];
let zones = [];
let treeMarkers = {};
let zonePolygons = {};
let treeLabelMarkers = {};
let zoneLabelMarkers = {};
let isAddingTree = false;
let editingTreeId = null;
let treeCounter = 50;
let currentFilter = 'all';
let currentRiskFilter = 'all';
let filteredTrees = [];
let selectedTreeIndex = -1;

// Layer groups
let treesLayer, zonesLayer, labelsLayer;

// Map
let map;

// Risk colors
const riskColors = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444'
};

// Initialize on DOM ready
window.onload = function() {
  loadData();
  generateLayerPanel();
  initMap();
  setupUI();
  updateStats();
};

// Load data
function loadData() {
  const saved = localStorage.getItem('trees');
  const savedCounter = localStorage.getItem('treeCounter');
  trees = saved ? JSON.parse(saved) : [...defaultTrees];
  zones = [...defaultZones];
  treeCounter = savedCounter ? parseInt(savedCounter) : 50;
}

// Save data
function saveData() {
  localStorage.setItem('trees', JSON.stringify(trees));
  localStorage.setItem('treeCounter', treeCounter.toString());
  updateStats();
  updateZoneCounts();
  generateZoneList();
}

// Update stats display
function updateStats() {
  const total = trees.length;
  const low = trees.filter(t => t.risk === 'low').length;
  const medium = trees.filter(t => t.risk === 'medium').length;
  const high = trees.filter(t => t.risk === 'high').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statLow').textContent = low;
  document.getElementById('statMedium').textContent = medium;
  document.getElementById('statHigh').textContent = high;
}

// Init map
function initMap() {
  map = L.map('map').setView([1.404, 103.790], 16);

  // Light map tiles (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Create layers
  zonesLayer = L.featureGroup().addTo(map);
  treesLayer = L.featureGroup().addTo(map);
  labelsLayer = L.featureGroup().addTo(map);

  // Draw zones
  zones.forEach(zone => {
    const poly = L.polygon(zone.boundary, {
      color: '#3b82f6',
      weight: 2,
      fillOpacity: 0.15,
      interactive: false
    }).addTo(zonesLayer);
    zonePolygons[zone.id] = poly;

    // Zone label with tree count
    const center = poly.getBounds().getCenter();
    const treeCount = trees.filter(t => isTreeInZone(t, zone)).length;
    const label = L.marker(center, {
      icon: L.divIcon({
        className: 'zone-label',
        html: `<div>${zone.name}</div><div class="zone-count">${treeCount} trees</div>`
      }),
      interactive: false
    }).addTo(labelsLayer);
    zoneLabelMarkers[zone.id] = label;
  });

  // Draw trees
  trees.forEach(t => addTreeToMap(t));

  // Zoom to zoo
  const zoo = zones.find(z => z.id === 'zone-zoo');
  if (zoo) {
    map.fitBounds(zoo.boundary, { padding: [30, 30] });
  }

  // Map click - for adding trees
  map.on('click', function(e) {
    if (isAddingTree) {
      showAddModal(e.latlng.lat, e.latlng.lng);
    }
  });
}

// Add single tree to map
function addTreeToMap(tree) {
  const color = riskColors[tree.risk] || riskColors.low;

  // Use circleMarker with glow effect
  const marker = L.circleMarker([tree.lat, tree.lng], {
    radius: 8,
    fillColor: color,
    color: color,
    weight: 3,
    opacity: 0.4,
    fillOpacity: 1,
    bubblingMouseEvents: false
  });

  // Drag support for circleMarker
  let dragging = false;
  let hasMoved = false;

  marker.on('mousedown', function(e) {
    dragging = true;
    hasMoved = false;
    map.dragging.disable();
    map.on('mousemove', onDrag);
    map.on('mouseup', onDragEnd);
  });

  // Click to edit (only if not dragged)
  marker.on('click', function(e) {
    if (!isAddingTree && !hasMoved) {
      showEditModal(tree);
    }
  });

  function onDrag(e) {
    if (dragging) {
      hasMoved = true;
      marker.setLatLng(e.latlng);
      if (treeLabelMarkers[tree.id]) {
        treeLabelMarkers[tree.id].setLatLng(e.latlng);
      }
    }
  }

  function onDragEnd(e) {
    if (dragging) {
      dragging = false;
      map.dragging.enable();
      map.off('mousemove', onDrag);
      map.off('mouseup', onDragEnd);

      const pos = marker.getLatLng();
      tree.lat = pos.lat;
      tree.lng = pos.lng;
      saveData();
    }
  }

  marker.addTo(treesLayer);
  treeMarkers[tree.id] = marker;

  // Label
  const label = L.marker([tree.lat, tree.lng], {
    icon: L.divIcon({
      className: 'tree-label',
      html: tree.id
    }),
    interactive: false
  }).addTo(labelsLayer);
  treeLabelMarkers[tree.id] = label;
}

// Setup UI events
function setupUI() {
  // Layers dropdown
  const layersBtn = document.getElementById('layersBtn');
  const layersDropdown = document.getElementById('layersDropdown');

  layersBtn.onclick = function(e) {
    e.stopPropagation();
    layersDropdown.classList.toggle('hidden');
    zoneDropdown.classList.add('hidden');
  };

  // Filter dropdown
  const filterBtn = document.getElementById('filterBtn');
  const filterDropdown = document.getElementById('filterDropdown');

  filterBtn.onclick = function(e) {
    e.stopPropagation();
    filterDropdown.classList.toggle('hidden');
    zoneDropdown.classList.add('hidden');
    layersDropdown.classList.add('hidden');
  };

  // Generate filter list
  generateFilterList();

  // Zone dropdown
  const zoneBtn = document.getElementById('zoneBtn');
  const zoneDropdown = document.getElementById('zoneDropdown');

  zoneBtn.onclick = function(e) {
    e.stopPropagation();
    zoneDropdown.classList.toggle('hidden');
    filterDropdown.classList.add('hidden');
    layersDropdown.classList.add('hidden');
  };

  // Generate zone list
  generateZoneList();

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!layersBtn.contains(e.target) && !layersDropdown.contains(e.target)) {
      layersDropdown.classList.add('hidden');
    }
    if (!zoneBtn.contains(e.target) && !zoneDropdown.contains(e.target)) {
      zoneDropdown.classList.add('hidden');
    }
    if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
      filterDropdown.classList.add('hidden');
    }
  });

  // Risk filter dropdown
  const riskFilterBtn = document.getElementById('riskFilterBtn');
  const riskFilterDropdown = document.getElementById('riskFilterDropdown');

  riskFilterBtn.onclick = function(e) {
    e.stopPropagation();
    riskFilterDropdown.classList.toggle('hidden');
    filterDropdown.classList.add('hidden');
    zoneDropdown.classList.add('hidden');
    layersDropdown.classList.add('hidden');
  };

  // Generate risk filter list
  generateRiskFilterList();

  // Close risk filter dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!riskFilterBtn.contains(e.target) && !riskFilterDropdown.contains(e.target)) {
      riskFilterDropdown.classList.add('hidden');
    }
  });

  // Layer checkboxes
  document.getElementById('layerTrees').onchange = function(e) {
    e.target.checked ? map.addLayer(treesLayer) : map.removeLayer(treesLayer);
  };
  document.getElementById('layerZones').onchange = function(e) {
    e.target.checked ? map.addLayer(zonesLayer) : map.removeLayer(zonesLayer);
  };
  document.getElementById('layerLabels').onchange = function(e) {
    e.target.checked ? map.addLayer(labelsLayer) : map.removeLayer(labelsLayer);
  };

  // Add tree button
  document.getElementById('addTreeBtn').onclick = function(e) {
    e.stopPropagation();
    isAddingTree = true;
    document.getElementById('addTreeMode').classList.remove('hidden');
    document.getElementById('addTreeBtn').classList.add('hidden');
    document.getElementById('map').style.cursor = 'crosshair';
  };

  document.getElementById('cancelAddTree').onclick = function(e) {
    e.stopPropagation();
    exitAddMode();
  };

  // Modal
  document.getElementById('cancelModal').onclick = closeModal;
  document.getElementById('saveTreeBtn').onclick = saveTree;
  document.getElementById('deleteTreeBtn').onclick = deleteTree;
  document.getElementById('treeModal').onclick = function(e) {
    if (e.target.id === 'treeModal') closeModal();
  };

  // Filtered panel
  document.getElementById('closeFilteredPanel').onclick = function() {
    document.getElementById('filteredPanel').classList.add('hidden');
  };
  document.getElementById('prevTreeBtn').onclick = prevTree;
  document.getElementById('nextTreeBtn').onclick = nextTree;
}

// Generate zone list for dropdown
function generateZoneList() {
  const container = document.getElementById('zoneList');
  let html = '';

  zones.forEach(zone => {
    const treeCount = trees.filter(t => isTreeInZone(t, zone)).length;
    html += `
      <button onclick="zoomToZone('${zone.id}')" class="w-full flex items-center justify-between px-4 py-2.5 border-b border-slate-700 hover:bg-slate-700/50 transition-colors text-left">
        <span class="text-sm text-slate-300">${zone.name}</span>
        <span class="text-xs text-slate-500">${treeCount} trees</span>
      </button>
    `;
  });

  // Show all zones option
  html += `
    <button onclick="zoomToAllZones()" class="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900/50 hover:bg-slate-700/50 transition-colors text-left">
      <span class="text-sm text-green-400 font-medium">Show All Zones</span>
      <span class="text-xs text-slate-500">${trees.length} trees</span>
    </button>
  `;

  container.innerHTML = html;
}

// Check if tree is in zone (simple bounding box check)
function isTreeInZone(tree, zone) {
  const bounds = L.polygon(zone.boundary).getBounds();
  return bounds.contains([tree.lat, tree.lng]);
}

// Zoom to specific zone
function zoomToZone(zoneId) {
  const zone = zones.find(z => z.id === zoneId);
  if (zone) {
    map.fitBounds(zone.boundary, { padding: [50, 50] });
  }
  document.getElementById('zoneDropdown').classList.add('hidden');
}

// Zoom to show all zones
function zoomToAllZones() {
  const allBounds = L.featureGroup();
  zones.forEach(zone => {
    allBounds.addLayer(L.polygon(zone.boundary));
  });
  map.fitBounds(allBounds.getBounds(), { padding: [30, 30] });
  document.getElementById('zoneDropdown').classList.add('hidden');
}

// Generate filter list for species dropdown
function generateFilterList() {
  const container = document.getElementById('filterList');

  // Get unique species from trees
  const species = [...new Set(trees.map(t => t.species))].sort();

  let html = `
    <button onclick="filterBySpecies('all')" class="w-full flex items-center justify-between px-4 py-2.5 border-b border-slate-700 hover:bg-slate-700/50 transition-colors text-left ${currentFilter === 'all' ? 'bg-green-500/20 text-green-400' : ''}">
      <span class="text-sm ${currentFilter === 'all' ? 'text-green-400' : 'text-slate-300'}">All Species</span>
      <span class="text-xs text-slate-500">${trees.length}</span>
    </button>
  `;

  species.forEach(sp => {
    const count = trees.filter(t => t.species === sp).length;
    const isActive = currentFilter === sp;
    html += `
      <button onclick="filterBySpecies('${sp}')" class="w-full flex items-center justify-between px-4 py-2.5 border-b border-slate-700 hover:bg-slate-700/50 transition-colors text-left ${isActive ? 'bg-green-500/20' : ''}">
        <span class="text-sm ${isActive ? 'text-green-400' : 'text-slate-300'}">${sp}</span>
        <span class="text-xs text-slate-500">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

// Filter trees by species
function filterBySpecies(species) {
  currentFilter = species;

  // Update button label
  document.getElementById('filterLabel').textContent = species === 'all' ? 'All Species' : species;

  // Update filter list to show active state
  generateFilterList();

  // Apply combined filters (species + risk)
  applyFilters();

  // Close dropdown
  document.getElementById('filterDropdown').classList.add('hidden');
}

// Generate risk filter list for dropdown
function generateRiskFilterList() {
  const container = document.getElementById('riskFilterList');

  const riskLevels = [
    { value: 'all', label: 'All Risk', color: null },
    { value: 'low', label: 'Low Risk', color: '#22c55e' },
    { value: 'medium', label: 'Medium Risk', color: '#f59e0b' },
    { value: 'high', label: 'High Risk', color: '#ef4444' }
  ];

  let html = '';

  riskLevels.forEach(level => {
    const count = level.value === 'all' ? trees.length : trees.filter(t => t.risk === level.value).length;
    const isActive = currentRiskFilter === level.value;
    const colorDot = level.color ? `<span class="w-2.5 h-2.5 rounded-full" style="background-color: ${level.color}"></span>` : '';

    html += `
      <button onclick="filterByRisk('${level.value}')" class="w-full flex items-center justify-between px-4 py-2.5 border-b border-slate-700 hover:bg-slate-700/50 transition-colors text-left ${isActive ? 'bg-green-500/20' : ''}">
        <span class="flex items-center gap-2">
          ${colorDot}
          <span class="text-sm ${isActive ? 'text-green-400' : 'text-slate-300'}">${level.label}</span>
        </span>
        <span class="text-xs text-slate-500">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

// Filter trees by risk level
function filterByRisk(risk) {
  currentRiskFilter = risk;

  // Update button label
  const labels = { all: 'All Risk', low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };
  document.getElementById('riskFilterLabel').textContent = labels[risk];

  // Update filter list to show active state
  generateRiskFilterList();

  // Apply combined filters (species + risk)
  applyFilters();

  // Close dropdown
  document.getElementById('riskFilterDropdown').classList.add('hidden');
}

// Apply both species and risk filters
function applyFilters() {
  // Build filtered trees list
  filteredTrees = trees.filter(tree => {
    const matchesSpecies = currentFilter === 'all' || tree.species === currentFilter;
    const matchesRisk = currentRiskFilter === 'all' || tree.risk === currentRiskFilter;
    return matchesSpecies && matchesRisk;
  });

  // Update marker opacity
  trees.forEach(tree => {
    const marker = treeMarkers[tree.id];
    const label = treeLabelMarkers[tree.id];

    if (!marker || !label) return;

    const matches = filteredTrees.includes(tree);

    if (matches) {
      marker.setStyle({ opacity: 0.4, fillOpacity: 1 });
      label.getElement().style.opacity = '1';
    } else {
      marker.setStyle({ opacity: 0.1, fillOpacity: 0.2 });
      label.getElement().style.opacity = '0.2';
    }
  });

  // Update filtered panel
  updateFilteredPanel();
}

// Update the filtered trees panel
function updateFilteredPanel() {
  const panel = document.getElementById('filteredPanel');
  const hasFilter = currentFilter !== 'all' || currentRiskFilter !== 'all';

  if (!hasFilter) {
    panel.classList.add('hidden');
    selectedTreeIndex = -1;
    return;
  }

  panel.classList.remove('hidden');

  // Update count
  document.getElementById('filteredCount').textContent = `${filteredTrees.length} trees`;

  // Generate tree list
  const container = document.getElementById('filteredTreeList');
  let html = '';

  filteredTrees.forEach((tree, index) => {
    const isSelected = index === selectedTreeIndex;
    const riskColor = riskColors[tree.risk];
    html += `
      <button onclick="focusTree(${index})" class="w-full flex items-center gap-3 px-4 py-2.5 border-b border-slate-700 hover:bg-slate-700/50 transition-colors text-left ${isSelected ? 'bg-green-500/20' : ''}">
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${riskColor}"></span>
        <div class="flex-1 min-w-0">
          <div class="text-sm text-white truncate ${isSelected ? 'text-green-400' : ''}">${tree.id}</div>
          <div class="text-xs text-slate-400 truncate">${tree.species}</div>
        </div>
      </button>
    `;
  });

  container.innerHTML = html || '<div class="px-4 py-3 text-sm text-slate-400 text-center">No trees match filter</div>';

  // Update navigation
  updateNavigation();
}

// Focus on a specific tree
function focusTree(index) {
  if (index < 0 || index >= filteredTrees.length) return;

  selectedTreeIndex = index;
  const tree = filteredTrees[index];

  // Pan to tree
  map.setView([tree.lat, tree.lng], 18, { animate: true });

  // Highlight the marker briefly
  const marker = treeMarkers[tree.id];
  if (marker) {
    const originalRadius = 8;
    marker.setRadius(14);
    setTimeout(() => marker.setRadius(originalRadius), 500);
  }

  // Update panel
  updateFilteredPanel();

  // Scroll selected item into view
  const listContainer = document.getElementById('filteredTreeList');
  const selectedBtn = listContainer.children[index];
  if (selectedBtn) {
    selectedBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Navigate to previous tree
function prevTree() {
  if (filteredTrees.length === 0) return;
  const newIndex = selectedTreeIndex <= 0 ? filteredTrees.length - 1 : selectedTreeIndex - 1;
  focusTree(newIndex);
}

// Navigate to next tree
function nextTree() {
  if (filteredTrees.length === 0) return;
  const newIndex = selectedTreeIndex >= filteredTrees.length - 1 ? 0 : selectedTreeIndex + 1;
  focusTree(newIndex);
}

// Update navigation buttons state
function updateNavigation() {
  const prevBtn = document.getElementById('prevTreeBtn');
  const nextBtn = document.getElementById('nextTreeBtn');
  const navIndex = document.getElementById('treeNavIndex');

  const hasItems = filteredTrees.length > 0;
  prevBtn.disabled = !hasItems;
  nextBtn.disabled = !hasItems;

  if (hasItems && selectedTreeIndex >= 0) {
    navIndex.textContent = `${selectedTreeIndex + 1} / ${filteredTrees.length}`;
  } else {
    navIndex.textContent = `- / ${filteredTrees.length}`;
  }
}

// Update zone labels with tree counts
function updateZoneCounts() {
  zones.forEach(zone => {
    const label = zoneLabelMarkers[zone.id];
    if (label) {
      const treeCount = trees.filter(t => isTreeInZone(t, zone)).length;
      label.setIcon(L.divIcon({
        className: 'zone-label',
        html: `<div>${zone.name}</div><div class="zone-count">${treeCount} trees</div>`
      }));
    }
  });
}

function exitAddMode() {
  isAddingTree = false;
  document.getElementById('addTreeMode').classList.add('hidden');
  document.getElementById('addTreeBtn').classList.remove('hidden');
  document.getElementById('map').style.cursor = '';
}

function showAddModal(lat, lng) {
  exitAddMode();
  editingTreeId = null;
  treeCounter++;

  document.getElementById('modalTitle').textContent = 'New Tree';
  document.getElementById('treeId').value = 'T-' + String(treeCounter).padStart(3, '0');
  document.getElementById('treeSpecies').value = 'Rain Tree';
  document.querySelector('input[name="risk"][value="low"]').checked = true;
  document.getElementById('treeLat').value = lat.toFixed(6);
  document.getElementById('treeLng').value = lng.toFixed(6);
  document.getElementById('deleteTreeBtn').classList.add('hidden');
  document.getElementById('treeModal').classList.remove('hidden');
}

function showEditModal(tree) {
  editingTreeId = tree.id;

  document.getElementById('modalTitle').textContent = 'Edit Tree';
  document.getElementById('treeId').value = tree.id;
  document.getElementById('treeSpecies').value = tree.species;
  document.querySelector('input[name="risk"][value="' + tree.risk + '"]').checked = true;
  document.getElementById('treeLat').value = tree.lat.toFixed(6);
  document.getElementById('treeLng').value = tree.lng.toFixed(6);
  document.getElementById('deleteTreeBtn').classList.remove('hidden');
  document.getElementById('treeModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('treeModal').classList.add('hidden');
  editingTreeId = null;
}

function saveTree() {
  const id = document.getElementById('treeId').value;
  const species = document.getElementById('treeSpecies').value;
  const risk = document.querySelector('input[name="risk"]:checked').value;
  const lat = parseFloat(document.getElementById('treeLat').value);
  const lng = parseFloat(document.getElementById('treeLng').value);

  if (editingTreeId) {
    // Update
    const tree = trees.find(t => t.id === editingTreeId);
    if (tree) {
      tree.species = species;
      tree.risk = risk;
      // Remove old marker
      treesLayer.removeLayer(treeMarkers[tree.id]);
      labelsLayer.removeLayer(treeLabelMarkers[tree.id]);
      delete treeMarkers[tree.id];
      delete treeLabelMarkers[tree.id];
      // Add new
      addTreeToMap(tree);
    }
  } else {
    // New tree
    const newTree = { id, species, lat, lng, risk };
    trees.push(newTree);
    addTreeToMap(newTree);
  }

  saveData();
  closeModal();
}

function deleteTree() {
  if (!editingTreeId) return;

  trees = trees.filter(t => t.id !== editingTreeId);

  if (treeMarkers[editingTreeId]) {
    treesLayer.removeLayer(treeMarkers[editingTreeId]);
    delete treeMarkers[editingTreeId];
  }
  if (treeLabelMarkers[editingTreeId]) {
    labelsLayer.removeLayer(treeLabelMarkers[editingTreeId]);
    delete treeLabelMarkers[editingTreeId];
  }

  saveData();
  closeModal();
}
