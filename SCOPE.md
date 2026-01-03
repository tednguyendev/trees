# Tree Management Demo - Scope

## Context

- **Client:** Mandai Wildlife Group (Singapore)
- **RFQ:** Mobile Tree Management Software
- **Problem:** Client requires vendors with existing products
- **Solution:** Build a convincing demo that looks like a complete product
- **Timeline:** Demo in final week of January 2026 (~3-4 weeks)

---

## Demo Philosophy

A demo is **theater**, not a complete product.

```
What client sees:              What actually exists:
─────────────────────────────────────────────────────
"Wow, full product!"           Only the demo script screens
"They have 40k trees!"         50 fake trees in database
"Real-time sync!"              Pre-loaded data
"CAD export works!"            Hardcoded export of demo data
```

**Goal:** Scripted path through the app that looks complete and professional.

---

## Demo Script (8 Scenes)

### Scene 1: Map View (30 sec)
**Show:** Beautiful map of Singapore, zoom to Mandai, tree markers appear with risk colors.

**Build:**
- [ ] Leaflet/Mapbox map component
- [ ] 50-100 fake tree markers with real Mandai GPS coords
- [ ] Color coding: green (low), yellow (medium), red (high risk)

```
┌─────────────────────────────────────────────┐
│  Map View                       [Layers ▼]  │
├─────────────────────────────────────────────┤
│      🟢 🟢          Singapore               │
│           🟡    🟢      Zoo                 │
│        🟢    🔴                             │
│     🟢          🟢   🟡                     │
│   🟢 Low Risk  🟡 Medium  🔴 High Risk     │
└─────────────────────────────────────────────┘
```

---

### Scene 2: Zone Boundaries (20 sec)
**Show:** Toggle "Zones" layer, polygon boundaries appear with labels.

**Build:**
- [ ] Layer toggle UI
- [ ] 3-4 pre-drawn zone polygons (Zoo, Night Safari, River Wonders, Bird Paradise)
- [ ] Hardcoded GeoJSON boundaries

---

### Scene 3: Tree Details (30 sec)
**Show:** Click tree marker, popup shows full details, photos, inspection history.

**Build:**
- [ ] Tree detail popup/sidebar
- [ ] 3-5 trees with complete fake data + photos
- [ ] Other trees can have minimal data

```
┌─────────────────────┬───────────────────────┐
│       MAP           │ TREE-0042             │
│                     │ Species: Rain Tree    │
│      🟢 🟢          │ Height: 15m           │
│           🟡    🟢  │ Risk: Medium 🟡       │
│        🟢 ←click    │                       │
│                     │ Photos (3)            │
│                     │ [img1] [img2] [img3]  │
│                     │                       │
│                     │ Last Inspection       │
│                     │ 2025-12-01 - John T.  │
└─────────────────────┴───────────────────────┘
```

---

### Scene 4: Add New Tree (45 sec) ⭐ LIVE
**Show:** Click "Add Tree", click map to place, fill form, tree appears instantly.

**Build:**
- [ ] "Add Tree" button
- [ ] Click-to-place on map
- [ ] Quick form (species, height, zone auto-detected)
- [ ] Save and show new marker

**Why important:** Proves it's a real app, not screenshots.

---

### Scene 5: Inspection Form (45 sec)
**Show:** Open inspection form, show 4 ISA levels, checklist, upload photo live.

**Build:**
- [ ] Inspection form page
- [ ] Level selector (Level 1-3)
- [ ] Condition dropdowns (crown, trunk, root)
- [ ] Notes textarea
- [ ] Photo upload (working)
- [ ] Risk auto-calculation display

```
┌─────────────────────────────────────────────┐
│  Tree Inspection - TREE-0042                │
├─────────────────────────────────────────────┤
│  Inspection Level:                          │
│  ○ Level 1: Walk-by Inspection              │
│  ● Level 2: Visual Tree Assessment          │
│  ○ Level 2: Tree Risk Assessment            │
│  ○ Level 3: Advance & Aerial Assessment     │
│                                             │
│  Crown Condition:    [Good ▼]               │
│  Trunk Condition:    [Fair - Defects ▼]     │
│  Root Zone:          [Not Visible ▼]        │
│                                             │
│  Photos: [photo1.jpg] [+ Add Photo]         │
│  Risk Level: 🟡 Medium (auto-calculated)    │
│                                             │
│             [Cancel]  [Save Inspection]     │
└─────────────────────────────────────────────┘
```

---

### Scene 6: Dashboard (30 sec)
**Show:** Charts, KPIs (total trees, % inspected, overdue count), zone filter.

**Build:**
- [ ] Dashboard page
- [ ] 3 KPI cards (total, inspected %, overdue)
- [ ] Bar chart (inspections by zone)
- [ ] Pie chart (risk breakdown)
- [ ] All fake/static data is fine

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│  40,000  │ │   85%    │ │    23    │
│  Trees   │ │ Inspected│ │ Overdue  │
└──────────┘ └──────────┘ └──────────┘
```

---

### Scene 7: CAD/DXF Export (30 sec) ⭐ KEY DIFFERENTIATOR
**Show:** Click Export, choose DXF format, download file, open in AutoCAD viewer.

**Build:**
- [ ] Export dialog (zone selector, format selector)
- [ ] DXF file generation (use `dxf-writer` or `ezdxf`)
- [ ] Include tree positions + labels + zone boundaries
- [ ] **Test that it opens in AutoCAD/free viewer**

**Why important:** This is specifically mentioned in RFQ. Competitors may not have this.

---

### Scene 8: Mobile View (20 sec)
**Show:** Same app on phone, responsive layout, "inspectors use this in field".

**Build:**
- [ ] Responsive CSS (Tailwind)
- [ ] Test on one phone screen size
- [ ] Map still works on mobile

---

## What NOT to Build

| RFQ Feature | Build? | Reason |
|-------------|--------|--------|
| Azure AD SSO | ❌ | Show login screen, say "integrates with Azure AD" |
| 40,000 trees | ❌ | 50-100 trees looks identical on map |
| Email notifications | ❌ | Show UI, mention feature verbally |
| Shapefile import | ❌ | Show Excel, mention shapefile support |
| 33,500 tree import | ❌ | Import 50 trees, looks the same |
| User roles/permissions | ❌ | Just login as admin |
| Scheduling calendar | ⚠️ | Low priority, skip if time-constrained |
| Offline mobile | ❌ | Cannot demo convincingly |

---

## Build Schedule

### Week 1: Core (Must Have)
- [ ] Project setup (React + Tailwind + Leaflet)
- [ ] Map with tree markers
- [ ] Click tree → show details popup
- [ ] Zone boundaries on map
- [ ] Layer toggle (trees/zones)

### Week 2: Interactive (Impressive)
- [ ] Add new tree (live on map)
- [ ] Inspection form (Level 1-3)
- [ ] Photo upload
- [ ] Basic dashboard with charts

### Week 3: Differentiator + Polish
- [ ] DXF export ⭐
- [ ] Excel/CSV import
- [ ] Mobile responsive
- [ ] UI polish
- [ ] Realistic fake data
- [ ] Practice demo script

---

## Tech Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Frontend | React | Standard, team likely knows it |
| CSS | Tailwind | Fast to make things look good |
| Map | Leaflet.js | Free, well-documented |
| Charts | Chart.js | Simple, good-looking |
| DXF Export | dxf-writer (npm) | Simple API |
| Backend | Firebase OR static JSON | Fast setup, no server management |
| Hosting | Vercel | Free, instant deploy |

**Alternative if team doesn't know React:**
- Plain HTML + vanilla JS + Tailwind CDN
- Slower to build but no learning curve

---

## Fake Data Required

### Trees (50-100 records)
```json
{
  "id": "TREE-0042",
  "species": "Rain Tree",
  "gps": [1.4043, 103.7930],
  "height": 15,
  "diameter": 0.8,
  "risk_level": "medium",
  "zone_id": "zone-zoo",
  "last_inspection": "2025-12-01",
  "photos": ["rain-tree-1.jpg", "rain-tree-2.jpg"]
}
```

**Species to use (Singapore common trees):**
- Rain Tree (Samanea saman)
- Tembusu (Cyrtophyllum fragrans)
- Angsana (Pterocarpus indicus)
- Sea Apple (Syzygium grande)
- Yellow Flame (Peltophorum pterocarpum)

### Zones (4 records)
```json
{
  "id": "zone-zoo",
  "name": "Singapore Zoo",
  "boundary": [[1.4043, 103.7930], [1.4050, 103.7940], ...]
}
```

**Zones:**
- Singapore Zoo
- Night Safari
- River Wonders
- Bird Paradise

Get boundary coordinates by tracing polygons on Google Maps.

### Inspections (10-20 records)
Attach to 3-5 "hero" trees that will be clicked during demo.

### Photos (10-15 images)
- Stock photos of trees
- Some showing defects (cracks, dead branches, fungus)
- Can use Google Images or Unsplash

---

## Demo Script (What to Say)

```
"Let me show you our tree management platform..."

[Scene 1-2: Map + Zones]
"Here's the Mandai area. Each dot is a tree in your inventory.
Colors indicate risk level. I can toggle zone boundaries..."

[Scene 3: Tree Details]
"When I click a tree, I see full details - species, measurements,
photos, complete inspection history..."

[Scene 4: Add Tree] ⭐
"If your team finds a new tree, they simply click here,
place the marker, fill the form - and it's in the system."

[Scene 5: Inspection]
"For inspections, we support all ISA levels - from walk-by
to advanced aerial. The form is fully customizable..."

[Scene 6: Dashboard]
"Management gets this dashboard - see progress across zones,
identify overdue inspections, track KPIs..."

[Scene 7: Export] ⭐
"And critically - your landscape architects need CAD files.
One click, select DXF format, download. Let me open this
in AutoCAD to show you it works perfectly..."

[Scene 8: Mobile]
"Same system works on mobile - inspectors use this in the field..."
```

---

## Questions for Amy

Before starting, clarify:

1. **Demo format?**
   - Live presentation?
   - Recorded video?
   - Client clicks around themselves?

2. **Audience?**
   - Technical (care about data formats)?
   - Management (care about dashboards)?
   - Field workers (care about mobile)?

3. **Team skills?**
   - Can build React app?
   - Have designers?
   - Backend experience?

4. **Budget?**
   - Can buy Mapbox subscription?
   - Hire freelancer?

---

## Success Criteria

Demo is successful if client believes:
- [ ] This is a real, working product
- [ ] It handles their scale (40k trees)
- [ ] CAD/DXF export actually works
- [ ] Mobile-friendly for field inspectors
- [ ] Dashboard gives management visibility
- [ ] Team understands the arboriculture domain
