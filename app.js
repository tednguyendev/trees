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

// Measure state
let isMeasuring = false;
let measurePoint1 = null;
let measurePoint2 = null;
let measureMarkers = [];
let measureLine = null;

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

  // Zone dropdown
  const zoneBtn = document.getElementById('zoneBtn');
  const zoneDropdown = document.getElementById('zoneDropdown');

  zoneBtn.onclick = function(e) {
    e.stopPropagation();
    zoneDropdown.classList.toggle('hidden');
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

  // Search input
  const searchInput = document.getElementById('searchInput');
  searchInput.oninput = function(e) {
    filterTrees(e.target.value);
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

  // Measure tool
  document.getElementById('measureBtn').onclick = function(e) {
    e.stopPropagation();
    startMeasure();
  };

  document.getElementById('cancelMeasure').onclick = function(e) {
    e.stopPropagation();
    exitMeasureMode();
  };

  document.getElementById('clearMeasure').onclick = function(e) {
    e.stopPropagation();
    clearMeasurement();
  };
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

// Filter trees by search query
function filterTrees(query) {
  query = query.toLowerCase().trim();

  trees.forEach(tree => {
    const marker = treeMarkers[tree.id];
    const label = treeLabelMarkers[tree.id];

    if (!marker || !label) return;

    const matches = query === '' ||
      tree.id.toLowerCase().includes(query) ||
      tree.species.toLowerCase().includes(query) ||
      tree.risk.toLowerCase().includes(query);

    if (matches) {
      marker.setStyle({ opacity: 0.4, fillOpacity: 1 });
      label.getElement().style.opacity = '1';
    } else {
      marker.setStyle({ opacity: 0.1, fillOpacity: 0.2 });
      label.getElement().style.opacity = '0.2';
    }
  });
}

// Measurement tool
function startMeasure() {
  isMeasuring = true;
  measurePoint1 = null;
  measurePoint2 = null;
  document.getElementById('measureMode').classList.remove('hidden');
  document.getElementById('measureBtn').classList.add('hidden');
  document.getElementById('measureText').textContent = 'Click first point';
  document.getElementById('map').style.cursor = 'crosshair';

  // Add click handler for measuring
  map.on('click', onMeasureClick);
}

function onMeasureClick(e) {
  if (!isMeasuring) return;

  if (!measurePoint1) {
    // First point
    measurePoint1 = e.latlng;
    const marker = L.circleMarker(e.latlng, {
      radius: 6,
      fillColor: '#3b82f6',
      color: '#3b82f6',
      weight: 2,
      fillOpacity: 1
    }).addTo(map);
    measureMarkers.push(marker);
    document.getElementById('measureText').textContent = 'Click second point';
  } else if (!measurePoint2) {
    // Second point
    measurePoint2 = e.latlng;
    const marker = L.circleMarker(e.latlng, {
      radius: 6,
      fillColor: '#3b82f6',
      color: '#3b82f6',
      weight: 2,
      fillOpacity: 1
    }).addTo(map);
    measureMarkers.push(marker);

    // Draw line
    measureLine = L.polyline([measurePoint1, measurePoint2], {
      color: '#3b82f6',
      weight: 2,
      dashArray: '5, 10'
    }).addTo(map);

    // Calculate distance
    const distance = measurePoint1.distanceTo(measurePoint2);
    const distanceText = distance < 1000
      ? distance.toFixed(1) + ' m'
      : (distance / 1000).toFixed(2) + ' km';

    document.getElementById('measureDistance').textContent = distanceText;
    document.getElementById('measureResult').classList.remove('hidden');

    // Exit measure mode but keep result visible
    exitMeasureMode();
  }
}

function exitMeasureMode() {
  isMeasuring = false;
  document.getElementById('measureMode').classList.add('hidden');
  document.getElementById('measureBtn').classList.remove('hidden');
  document.getElementById('map').style.cursor = '';
  map.off('click', onMeasureClick);
}

function clearMeasurement() {
  measurePoint1 = null;
  measurePoint2 = null;

  // Remove markers
  measureMarkers.forEach(m => map.removeLayer(m));
  measureMarkers = [];

  // Remove line
  if (measureLine) {
    map.removeLayer(measureLine);
    measureLine = null;
  }

  document.getElementById('measureResult').classList.add('hidden');
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
