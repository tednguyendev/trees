// State
let trees = [];
let zones = [];
let treeMarkers = {};
let zonePolygons = {};
let treeLabelMarkers = {};
let isAddingTree = false;
let editingTreeId = null;
let selectedTreeId = null;
let treeCounter = 50;

// Fake inspection data
const inspections = {
  'T-001': [
    { date: '2025-12-15', level: 2, inspector: 'John Tan', crown: 'good', trunk: 'good', root: 'good', risk: 'low', notes: 'Healthy tree, no defects observed.' },
    { date: '2025-09-10', level: 1, inspector: 'Mary Lim', crown: 'good', trunk: 'good', root: 'good', risk: 'low', notes: 'Routine walk-by.' }
  ],
  'T-003': [
    { date: '2025-12-20', level: 2, inspector: 'John Tan', crown: 'fair', trunk: 'fair', root: 'good', risk: 'medium', notes: 'Minor crown dieback noted. Monitor.' }
  ],
  'T-005': [
    { date: '2025-12-22', level: 3, inspector: 'Dr. Ahmad', crown: 'poor', trunk: 'poor', root: 'fair', risk: 'high', notes: 'Significant trunk cavity detected. Recommend removal within 6 months.' }
  ]
};

// Fake photos
const treePhotos = {
  'T-001': ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200'],
  'T-005': ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=200']
};

// Layer groups
let treesLayer, zonesLayer, labelsLayer;

// Map
let map;

// Charts
let zoneChart, riskChart;

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
  initDashboard();
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
}

// Init map
function initMap() {
  map = L.map('map').setView([1.404, 103.790], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
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
      fillOpacity: 0.1,
      interactive: false
    }).addTo(zonesLayer);

    zonePolygons[zone.id] = poly;

    const center = poly.getBounds().getCenter();
    L.marker(center, {
      icon: L.divIcon({
        className: 'zone-label',
        html: zone.name
      }),
      interactive: false
    }).addTo(labelsLayer);
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

  const marker = L.circleMarker([tree.lat, tree.lng], {
    radius: 10,
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 1,
    bubblingMouseEvents: false
  });

  // Drag support
  let dragging = false;
  let hasMoved = false;

  marker.on('mousedown', function(e) {
    dragging = true;
    hasMoved = false;
    map.dragging.disable();
    map.on('mousemove', onDrag);
    map.on('mouseup', onDragEnd);
  });

  // Click to show sidebar
  marker.on('click', function(e) {
    if (!isAddingTree && !hasMoved) {
      showTreeSidebar(tree);
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
  };

  document.addEventListener('click', function(e) {
    if (!layersBtn.contains(e.target) && !layersDropdown.contains(e.target)) {
      layersDropdown.classList.add('hidden');
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

  // View toggle
  document.getElementById('mapViewBtn').onclick = function() {
    showMapView();
  };
  document.getElementById('dashboardViewBtn').onclick = function() {
    showDashboardView();
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

  // Tree Modal
  document.getElementById('cancelModal').onclick = closeModal;
  document.getElementById('saveTreeBtn').onclick = saveTree;
  document.getElementById('deleteTreeBtn').onclick = deleteTree;
  document.getElementById('treeModal').onclick = function(e) {
    if (e.target.id === 'treeModal') closeModal();
  };

  // Sidebar
  document.getElementById('closeSidebar').onclick = closeSidebar;
  document.getElementById('editTreeBtn').onclick = function() {
    if (selectedTreeId) {
      const tree = trees.find(t => t.id === selectedTreeId);
      if (tree) showEditModal(tree);
    }
  };
  document.getElementById('newInspectionBtn').onclick = function() {
    document.getElementById('inspectionModal').classList.remove('hidden');
  };

  // Sidebar tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById('tab' + capitalize(btn.dataset.tab)).classList.remove('hidden');
    };
  });

  // Inspection Modal
  document.getElementById('cancelInspection').onclick = function() {
    document.getElementById('inspectionModal').classList.add('hidden');
  };
  document.getElementById('saveInspection').onclick = function() {
    alert('Inspection saved!');
    document.getElementById('inspectionModal').classList.add('hidden');
  };
  document.getElementById('inspectionModal').onclick = function(e) {
    if (e.target.id === 'inspectionModal') {
      document.getElementById('inspectionModal').classList.add('hidden');
    }
  };

  // Risk calculation
  ['inspCrown', 'inspTrunk', 'inspRoot'].forEach(id => {
    document.getElementById(id).onchange = updateCalcRisk;
  });

  // Export Modal
  document.getElementById('exportBtn').onclick = function() {
    document.getElementById('exportModal').classList.remove('hidden');
  };
  document.getElementById('cancelExport').onclick = function() {
    document.getElementById('exportModal').classList.add('hidden');
  };
  document.getElementById('doExport').onclick = exportToDXF;
  document.getElementById('exportModal').onclick = function(e) {
    if (e.target.id === 'exportModal') {
      document.getElementById('exportModal').classList.add('hidden');
    }
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showMapView() {
  document.getElementById('mapView').classList.remove('hidden');
  document.getElementById('dashboardView').classList.add('hidden');
  document.getElementById('mapViewBtn').classList.add('bg-white', 'shadow-sm', 'font-medium');
  document.getElementById('mapViewBtn').classList.remove('text-gray-600');
  document.getElementById('dashboardViewBtn').classList.remove('bg-white', 'shadow-sm', 'font-medium');
  document.getElementById('dashboardViewBtn').classList.add('text-gray-600');
  map.invalidateSize();
}

function showDashboardView() {
  document.getElementById('mapView').classList.add('hidden');
  document.getElementById('dashboardView').classList.remove('hidden');
  document.getElementById('dashboardViewBtn').classList.add('bg-white', 'shadow-sm', 'font-medium');
  document.getElementById('dashboardViewBtn').classList.remove('text-gray-600');
  document.getElementById('mapViewBtn').classList.remove('bg-white', 'shadow-sm', 'font-medium');
  document.getElementById('mapViewBtn').classList.add('text-gray-600');
  updateDashboard();
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
  closeSidebar();

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
    const tree = trees.find(t => t.id === editingTreeId);
    if (tree) {
      tree.species = species;
      tree.risk = risk;
      treesLayer.removeLayer(treeMarkers[tree.id]);
      labelsLayer.removeLayer(treeLabelMarkers[tree.id]);
      delete treeMarkers[tree.id];
      delete treeLabelMarkers[tree.id];
      addTreeToMap(tree);
    }
  } else {
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

// Sidebar functions
function showTreeSidebar(tree) {
  selectedTreeId = tree.id;

  document.getElementById('sidebarTitle').textContent = tree.id;
  document.getElementById('detailSpecies').textContent = tree.species;

  const riskHtml = '<span class="w-3 h-3 rounded-full" style="background-color: ' + riskColors[tree.risk] + '"></span> ' + capitalize(tree.risk);
  document.getElementById('detailRisk').innerHTML = riskHtml;

  document.getElementById('detailLat').textContent = tree.lat.toFixed(6);
  document.getElementById('detailLng').textContent = tree.lng.toFixed(6);

  // Find zone
  const zone = findZoneForTree(tree);
  document.getElementById('detailZone').textContent = zone ? zone.name : 'Unknown';

  // Last inspection
  const treeInsp = inspections[tree.id] || [];
  if (treeInsp.length > 0) {
    document.getElementById('detailLastInspection').textContent = treeInsp[0].date;
  } else {
    document.getElementById('detailLastInspection').textContent = 'No inspections';
  }

  // Populate inspections tab
  const inspList = document.getElementById('inspectionsList');
  if (treeInsp.length > 0) {
    inspList.innerHTML = treeInsp.map(function(i) {
      return '<div class="inspection-card bg-gray-50 rounded-lg p-3">' +
        '<div class="flex justify-between items-start mb-2">' +
          '<div>' +
            '<div class="font-medium text-sm">' + i.date + '</div>' +
            '<div class="text-xs text-gray-500">Level ' + i.level + ' - ' + i.inspector + '</div>' +
          '</div>' +
          '<span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ' + riskColors[i.risk] + '20; color: ' + riskColors[i.risk] + '">' + capitalize(i.risk) + ' Risk</span>' +
        '</div>' +
        '<div class="text-sm text-gray-600">' + i.notes + '</div>' +
      '</div>';
    }).join('');
  } else {
    inspList.innerHTML = '<div class="text-sm text-gray-500 text-center py-4">No inspection history</div>';
  }

  // Populate photos tab
  const photos = treePhotos[tree.id] || [];
  const photoList = document.getElementById('photosList');
  if (photos.length > 0) {
    photoList.innerHTML = photos.map(function(p) {
      return '<img src="' + p + '" class="photo-thumb" alt="Tree photo">';
    }).join('');
  } else {
    photoList.innerHTML = '<div class="col-span-3 text-sm text-gray-500 text-center py-4">No photos</div>';
  }

  // Reset to details tab
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelector('.tab-btn[data-tab="details"]').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.add('hidden'); });
  document.getElementById('tabDetails').classList.remove('hidden');

  // Open sidebar
  document.getElementById('sidebar').classList.remove('closed');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.add('closed');
  selectedTreeId = null;
}

function findZoneForTree(tree) {
  for (var i = 0; i < zones.length; i++) {
    var zone = zones[i];
    if (zonePolygons[zone.id] && zonePolygons[zone.id].getBounds().contains([tree.lat, tree.lng])) {
      return zone;
    }
  }
  return null;
}

// Dashboard
function initDashboard() {
  // Zone chart
  var zoneCtx = document.getElementById('zoneChart').getContext('2d');
  zoneChart = new Chart(zoneCtx, {
    type: 'bar',
    data: {
      labels: zones.map(function(z) { return z.name; }),
      datasets: [{
        label: 'Trees',
        data: [0, 0, 0, 0],
        backgroundColor: '#22c55e'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });

  // Risk chart
  var riskCtx = document.getElementById('riskChart').getContext('2d');
  riskChart = new Chart(riskCtx, {
    type: 'doughnut',
    data: {
      labels: ['Low', 'Medium', 'High'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
      }]
    },
    options: {
      responsive: true
    }
  });

  updateDashboard();
}

function updateDashboard() {
  // KPIs
  document.getElementById('kpiTotal').textContent = trees.length.toLocaleString();

  // Zone counts
  var zoneCounts = zones.map(function(zone) {
    return trees.filter(function(t) {
      if (!zonePolygons[zone.id]) return false;
      return zonePolygons[zone.id].getBounds().contains([t.lat, t.lng]);
    }).length;
  });

  zoneChart.data.datasets[0].data = zoneCounts;
  zoneChart.update();

  // Risk counts
  var low = trees.filter(function(t) { return t.risk === 'low'; }).length;
  var medium = trees.filter(function(t) { return t.risk === 'medium'; }).length;
  var high = trees.filter(function(t) { return t.risk === 'high'; }).length;

  riskChart.data.datasets[0].data = [low, medium, high];
  riskChart.update();
}

function updateCalcRisk() {
  var crown = document.getElementById('inspCrown').value;
  var trunk = document.getElementById('inspTrunk').value;
  var root = document.getElementById('inspRoot').value;

  var risk = 'low';
  if (crown === 'poor' || trunk === 'poor' || trunk === 'critical' || root === 'poor') {
    risk = 'high';
  } else if (crown === 'fair' || trunk === 'fair' || root === 'fair') {
    risk = 'medium';
  }

  var el = document.getElementById('inspCalcRisk');
  el.innerHTML = '<span class="w-3 h-3 rounded-full" style="background-color: ' + riskColors[risk] + '"></span> ' + capitalize(risk);
}

// DXF Export
function exportToDXF() {
  var zoneFilter = document.getElementById('exportZone').value;
  var includeTrees = document.getElementById('exportTrees').checked;
  var includeLabels = document.getElementById('exportLabels').checked;
  var includeZones = document.getElementById('exportZones').checked;

  // Filter trees by zone if needed
  var exportTreesList = trees;
  if (zoneFilter !== 'all') {
    var zone = zones.find(function(z) { return z.id === zoneFilter; });
    if (zone && zonePolygons[zone.id]) {
      exportTreesList = trees.filter(function(t) {
        return zonePolygons[zone.id].getBounds().contains([t.lat, t.lng]);
      });
    }
  }

  // Generate simple DXF content
  var dxf = generateDXF(exportTreesList, includeTrees, includeLabels, includeZones, zoneFilter);

  // Download
  var blob = new Blob([dxf], { type: 'application/dxf' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'trees_export.dxf';
  a.click();
  URL.revokeObjectURL(url);

  document.getElementById('exportModal').classList.add('hidden');
}

function generateDXF(treesToExport, includeTrees, includeLabels, includeZones, zoneFilter) {
  // Scale factor: convert lat/lng to something reasonable for CAD
  var centerLat = 1.404;
  var centerLng = 103.790;
  var scale = 100000;

  function toX(lng) {
    return (lng - centerLng) * scale;
  }

  function toY(lat) {
    return (lat - centerLat) * scale;
  }

  var entities = '';
  var handle = 100;

  // Add trees as circles
  if (includeTrees) {
    treesToExport.forEach(function(tree) {
      var x = toX(tree.lng);
      var y = toY(tree.lat);
      var radius = 2;

      entities += '0\nCIRCLE\n5\n' + (handle++) + '\n100\nAcDbEntity\n8\nTrees\n62\n' +
        (tree.risk === 'high' ? 1 : tree.risk === 'medium' ? 2 : 3) +
        '\n100\nAcDbCircle\n10\n' + x.toFixed(4) + '\n20\n' + y.toFixed(4) + '\n30\n0.0\n40\n' + radius + '\n';
    });
  }

  // Add labels as text
  if (includeLabels) {
    treesToExport.forEach(function(tree) {
      var x = toX(tree.lng) + 3;
      var y = toY(tree.lat);

      entities += '0\nTEXT\n5\n' + (handle++) + '\n100\nAcDbEntity\n8\nLabels\n100\nAcDbText\n10\n' +
        x.toFixed(4) + '\n20\n' + y.toFixed(4) + '\n30\n0.0\n40\n1.5\n1\n' + tree.id + '\n';
    });
  }

  // Add zone boundaries
  if (includeZones) {
    var zonesToExport = zoneFilter === 'all' ? zones : zones.filter(function(z) { return z.id === zoneFilter; });

    zonesToExport.forEach(function(zone) {
      var points = zone.boundary;
      entities += '0\nLWPOLYLINE\n5\n' + (handle++) + '\n100\nAcDbEntity\n8\nZones\n100\nAcDbPolyline\n90\n' +
        points.length + '\n70\n1\n';

      points.forEach(function(p) {
        entities += '10\n' + toX(p[1]).toFixed(4) + '\n20\n' + toY(p[0]).toFixed(4) + '\n';
      });

      // Zone label
      var centerX = points.reduce(function(sum, p) { return sum + toX(p[1]); }, 0) / points.length;
      var centerY = points.reduce(function(sum, p) { return sum + toY(p[0]); }, 0) / points.length;

      entities += '0\nTEXT\n5\n' + (handle++) + '\n100\nAcDbEntity\n8\nZoneLabels\n100\nAcDbText\n10\n' +
        centerX.toFixed(4) + '\n20\n' + centerY.toFixed(4) + '\n30\n0.0\n40\n3.0\n1\n' + zone.name + '\n';
    });
  }

  // Build complete DXF
  var dxf = '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1015\n0\nENDSEC\n' +
    '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n4\n' +
    '0\nLAYER\n2\nTrees\n70\n0\n62\n3\n6\nContinuous\n' +
    '0\nLAYER\n2\nLabels\n70\n0\n62\n7\n6\nContinuous\n' +
    '0\nLAYER\n2\nZones\n70\n0\n62\n5\n6\nContinuous\n' +
    '0\nLAYER\n2\nZoneLabels\n70\n0\n62\n5\n6\nContinuous\n' +
    '0\nENDTAB\n0\nENDSEC\n' +
    '0\nSECTION\n2\nENTITIES\n' + entities + '0\nENDSEC\n0\nEOF\n';

  return dxf;
}
