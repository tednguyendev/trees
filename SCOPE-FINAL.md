# Tree Mapping Demo - Final Scope

## What We're Building

A static web page with an interactive map for tree management.

**Frontend only. No backend.**

---

## Features

```
┌─────────────────────────────────────────────────────────────┐
│  Tree Mapping                    [Layers ▼] [+ Add Tree]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│      🟢 🟢          ┌─────────────────┐                     │
│           🟡    🟢  │  Singapore Zoo  │                     │
│        🟢    🔴     │                 │                     │
│     🟢          🟢  └─────────────────┘                     │
│                                                             │
│   Legend: 🟢 Low  🟡 Medium  🔴 High Risk                  │
│                                                             │
│                                        [Export DXF]         │
└─────────────────────────────────────────────────────────────┘
```

### Core Features

| Feature | Description |
|---------|-------------|
| Map | Leaflet map centered on Mandai, Singapore |
| Tree markers | Colored circles (green/yellow/red by risk) |
| Add tree | Click button → click map → fill popup form |
| Move tree | Drag marker to new position |
| Delete tree | Click marker → delete button |
| Layers | Toggle: Trees, Zones, Labels |
| Export DXF | Download tree data as CAD file |

---

## UI Components

### 1. Header Bar
```
┌─────────────────────────────────────────────────────────────┐
│  🌳 Tree Mapping          [Layers ▼]  [+ Add Tree]  [Export]│
└─────────────────────────────────────────────────────────────┘
```

### 2. Layers Dropdown
```
┌──────────────────┐
│ ☑ Trees          │
│ ☑ Zones          │
│ ☑ Labels         │
│ ☐ Risk Overlay   │
└──────────────────┘
```

### 3. Add Tree Flow
```
1. Click [+ Add Tree]
2. Button changes to "Click map to place tree"
3. Click on map
4. Popup appears:
   ┌────────────────────────┐
   │ New Tree               │
   │ ID: [T-051]            │
   │ Species: [Select ▼]    │
   │ Risk: ○Low ○Med ○High  │
   │ [Cancel] [Save]        │
   └────────────────────────┘
5. Tree marker appears
```

### 4. Tree Popup (on click)
```
┌────────────────────────┐
│ T-001                  │
│ Rain Tree              │
│ Risk: 🟢 Low           │
│ Lat: 1.4043            │
│ Lng: 103.7930          │
│                        │
│ [Delete] [Edit]        │
└────────────────────────┘
```

### 5. Move Tree
- Markers are draggable
- Drag to new position
- Coordinates update automatically

### 6. Legend
```
┌─────────────────────────────────────┐
│ 🟢 Low Risk  🟡 Medium  🔴 High    │
└─────────────────────────────────────┘
```

---

## Data Structure

### Tree
```javascript
{
  id: "T-001",
  species: "Rain Tree",
  lat: 1.4043,
  lng: 103.7930,
  risk: "low"  // "low" | "medium" | "high"
}
```

### Zone
```javascript
{
  id: "zone-1",
  name: "Singapore Zoo",
  boundary: [[lat, lng], [lat, lng], ...]
}
```

---

## Tech Stack

- **HTML** - Single index.html
- **CSS** - Tailwind CDN
- **JS** - Vanilla JavaScript
- **Map** - Leaflet.js CDN
- **Export** - dxf-writer (bundled)

No build step. No npm. Just files.

---

## File Structure

```
trees/app/
├── index.html      # Main page
├── style.css       # Custom styles
├── app.js          # Main logic
├── data.js         # Fake tree/zone data
├── export.js       # DXF export logic
└── lib/
    └── dxf.min.js  # DXF writer library
```

---

## Color Scheme

| Risk Level | Marker Color | Hex |
|------------|--------------|-----|
| Low | Green | #22c55e |
| Medium | Yellow/Orange | #f59e0b |
| High | Red | #ef4444 |
| Zone border | Blue | #3b82f6 |

---

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Pan map | Drag map | Map moves |
| Zoom | Scroll/buttons | Map zooms |
| View tree | Click marker | Popup shows |
| Add tree | Button → click map | New marker |
| Move tree | Drag marker | Position updates |
| Delete tree | Click delete in popup | Marker removed |
| Toggle layer | Click checkbox | Show/hide |
| Export | Click export | Download .dxf |

---

## Local Storage

Save trees to localStorage so they persist on refresh:

```javascript
// Save
localStorage.setItem('trees', JSON.stringify(trees));

// Load
const trees = JSON.parse(localStorage.getItem('trees')) || defaultTrees;
```

---

## Export DXF

Output includes:
- Tree positions as circles
- Tree labels (ID, species)
- Zone boundaries as polylines
- Zone names

---

## Demo Data

**50 trees** across 4 zones with realistic Singapore species:
- Rain Tree
- Tembusu
- Angsana
- Sea Apple
- Yellow Flame
- Saga
- Frangipani

**4 zones:**
- Singapore Zoo
- Night Safari
- River Wonders
- Bird Paradise
