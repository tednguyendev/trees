# Tree Mapping Demo - CAD/DXF Focus Only

## Scope

**Goal:** Demonstrate that we can display trees on a map and export to CAD/DXF format.

**NOT building:** Inspections, scheduling, dashboard, mobile app, user management.

**Timeline:** 3-5 days

---

## What We're Demoing

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   WEB APP                         AUTOCAD                │
│   ────────                        ───────                │
│                                                          │
│   ┌────────────────┐              ┌────────────────┐     │
│   │ ○ T-001        │              │ ○ T-001        │     │
│   │   Rain Tree    │   Export     │   Rain Tree    │     │
│   │                │   ──────►    │                │     │
│   │ ○ T-002        │    .dxf      │ ○ T-002        │     │
│   │   Tembusu      │              │   Tembusu      │     │
│   │                │              │                │     │
│   │ ── Zone ──     │              │ ── Zone ──     │     │
│   └────────────────┘              └────────────────┘     │
│                                                          │
│   "Same data, same layout, CAD-compatible"               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**The pitch:** "We can take your tree inventory and give your architects CAD files."

---

## Features to Build

### 1. Map View
- [ ] Map centered on Mandai area
- [ ] Tree markers with labels (ID, species)
- [ ] Zone boundary polygons
- [ ] Clean, CAD-like visual style (minimal, technical look)

### 2. Export to DXF
- [ ] Export button
- [ ] Generate valid DXF file containing:
  - Tree positions as points/circles
  - Tree labels (ID, species, height)
  - Zone boundaries as polylines
- [ ] Download file

### 3. Proof It Works
- [ ] Open exported DXF in AutoCAD or free viewer
- [ ] Show same layout as web app
- [ ] Demonstrate it's editable in CAD software

---

## Visual Style: CAD-like

Make the web map look like a technical drawing, not a colorful app.

```
NORMAL MAP STYLE              CAD-LIKE STYLE
──────────────────            ──────────────────
Colorful markers              Simple circles
Satellite imagery             White/light background
Rounded UI                    Grid lines, coordinates
                              Monospace labels
                              Technical font
```

**CSS approach:**
- White or light gray background
- Black/dark gray lines
- Monospace font for labels
- Thin, precise lines for boundaries
- Optional: coordinate grid overlay

---

## Tech Stack (Minimal)

| Component | Choice | Why |
|-----------|--------|-----|
| Map | Leaflet.js | Free, simple |
| Styling | Plain CSS or Tailwind | Keep it minimal |
| DXF Export | `dxf-writer` (npm) | ~50 lines of code |
| Backend | None | Static JSON file for tree data |
| Hosting | Vercel or GitHub Pages | Free, instant |

**Total dependencies:** Leaflet + dxf-writer. That's it.

---

## File Structure

```
trees-demo/
├── index.html          # Single page app
├── style.css           # CAD-like styling
├── app.js              # Map + export logic
├── data/
│   ├── trees.json      # 50 fake trees
│   └── zones.json      # 4 zone boundaries
└── lib/
    ├── leaflet/        # Map library
    └── dxf-writer.js   # DXF export
```

---

## Fake Data

### trees.json (50 records)
```json
[
  {
    "id": "T-001",
    "species": "Rain Tree",
    "lat": 1.4043,
    "lng": 103.7930,
    "height": 15,
    "zone": "Singapore Zoo"
  },
  {
    "id": "T-002",
    "species": "Tembusu",
    "lat": 1.4045,
    "lng": 103.7935,
    "height": 12,
    "zone": "Singapore Zoo"
  }
]
```

### zones.json (4 records)
```json
[
  {
    "id": "zone-1",
    "name": "Singapore Zoo",
    "boundary": [
      [1.4040, 103.7925],
      [1.4055, 103.7925],
      [1.4055, 103.7945],
      [1.4040, 103.7945]
    ]
  }
]
```

---

## DXF Export Logic

Using `dxf-writer`:

```javascript
import DxfWriter from 'dxf-writer';

function exportToDxf(trees, zones) {
  const dxf = new DxfWriter();

  // Add trees as circles with labels
  trees.forEach(tree => {
    // Circle for tree position
    dxf.drawCircle(tree.lng * 10000, tree.lat * 10000, 5);

    // Label: ID + species
    dxf.drawText(
      tree.lng * 10000 + 10,
      tree.lat * 10000,
      10,
      `${tree.id} - ${tree.species}`
    );
  });

  // Add zone boundaries as polylines
  zones.forEach(zone => {
    const points = zone.boundary.map(([lat, lng]) => [lng * 10000, lat * 10000]);
    dxf.drawPolyline(points, true); // true = closed shape

    // Zone label
    const center = getCenter(zone.boundary);
    dxf.drawText(center.lng * 10000, center.lat * 10000, 15, zone.name);
  });

  return dxf.stringify();
}

// Trigger download
function downloadDxf() {
  const content = exportToDxf(trees, zones);
  const blob = new Blob([content], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'tree_mapping.dxf';
  a.click();
}
```

---

## Demo Script (2 minutes)

```
[Open web app]
"This is our tree mapping interface. You can see all trees
in the Mandai area - each marker shows tree ID and species."

[Pan/zoom map]
"Zone boundaries are clearly marked. This matches your
existing park divisions."

[Click Export button]
"When your architects need this data, one click exports
everything to CAD format."

[Open downloaded file in AutoCAD]
"Here's the same data in AutoCAD. Tree positions, labels,
zone boundaries - all preserved. Your team can add this
directly to construction drawings."

[Show editing in AutoCAD]
"It's fully editable - move trees, add annotations,
integrate with existing plans."
```

---

## Build Schedule (5 Days)

### Day 1: Setup + Map
- [ ] Project setup (HTML + Leaflet)
- [ ] Load and display tree markers
- [ ] CAD-like visual styling

### Day 2: Zones + Interaction
- [ ] Zone boundary polygons
- [ ] Click tree to show info
- [ ] Pan/zoom works smoothly

### Day 3: DXF Export
- [ ] Integrate dxf-writer
- [ ] Export trees as circles + labels
- [ ] Export zones as polylines

### Day 4: Test + Fix
- [ ] Test DXF in AutoCAD
- [ ] Test in free viewers (LibreCAD, online viewers)
- [ ] Fix any formatting issues

### Day 5: Polish + Data
- [ ] Create realistic fake data (50 trees, 4 zones)
- [ ] Use real Mandai GPS coordinates
- [ ] UI polish
- [ ] Practice demo

---

## Testing the DXF

**Free ways to verify DXF works:**

1. **Online viewer:** https://sharecad.org/
2. **LibreCAD:** Free desktop CAD software
3. **AutoCAD web:** Free Autodesk account
4. **FreeCAD:** Open source CAD

Must verify:
- [ ] File opens without errors
- [ ] Trees appear at correct positions
- [ ] Labels are readable
- [ ] Zone boundaries are closed shapes
- [ ] Scale is reasonable

---

## What This Demo Proves

| Client Concern | Demo Answer |
|----------------|-------------|
| "Can you handle our tree data?" | Yes, map shows all trees |
| "Will it work with our CAD workflow?" | Yes, DXF export opens in AutoCAD |
| "Is the data accurate?" | Yes, GPS coords preserved exactly |
| "Can architects use this?" | Yes, fully editable in CAD |

---

## What This Demo Does NOT Cover

- Inspections
- Scheduling
- Mobile app
- User login
- Dashboard
- Real-time sync
- Data import

**If client asks about these:** "Those features are in our full platform. Today we're focusing on the mapping and CAD integration you specifically asked about."

---

## Risks

| Risk | Mitigation |
|------|------------|
| DXF format issues | Test early with multiple CAD viewers |
| Coordinates wrong scale | Use multiplier, test in CAD |
| Client wants more features | Prepare screenshots of "full system" |
| Map looks too simple | Add grid, coordinates, technical styling |

---

## Success Criteria

- [ ] Map displays 50+ trees with labels
- [ ] 4 zone boundaries visible
- [ ] Export button generates DXF
- [ ] DXF opens in AutoCAD without errors
- [ ] Layout in CAD matches web view
- [ ] Demo takes < 3 minutes
- [ ] Client believes this is production-ready
