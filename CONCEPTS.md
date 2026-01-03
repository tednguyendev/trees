# Tree Management System - Domain Concepts

## Overview

This system helps organizations manage large populations of trees across multiple sites. It tracks tree locations, health status, inspection history, and risk levels to ensure public safety and regulatory compliance.

---

## Core Entities

### Tree

A **tree** is a digital record representing a physical tree.

**Not just "a plant"** - it's an inventory item with:
- Unique identifier (e.g., TREE-0042)
- GPS coordinates (latitude, longitude)
- Physical attributes (species, height, trunk diameter)
- Health/risk status
- Inspection history
- Photos

```
Real World                      Software Record
────────────────────────────────────────────────
A mango tree near               {
the zoo entrance                  id: "TREE-0042",
                                  species: "Mango",
                        →         gps: [1.3521, 103.8198],
                                  height: 12m,
                                  trunk_diameter: 45cm,
                                  health_status: "Fair",
                                  risk_level: "Medium"
                                }
```

**Operations on trees:**
- **Plot** = Add new tree to the map
- **Shift** = Move position (GPS correction or transplant)
- **Remove** = Delete from system (tree cut down)

---

### Zone

A **zone** is a geographic area containing trees. Used for organization and reporting.

```
Mandai Wildlife Reserve
│
├── Zone: Singapore Zoo
│   ├── Sub-zone: Elephant Exhibit
│   ├── Sub-zone: Reptile Garden
│   └── Sub-zone: Parking Lot A
│
├── Zone: Night Safari
│   ├── Sub-zone: Entrance Plaza
│   └── Sub-zone: Walking Trail North
│
└── Zone: Bird Paradise
```

**On the map:** A zone is drawn as a **polygon** (closed shape with boundaries).

**Why zones matter:**
- Filter: "Show all trees in the Zoo"
- Report: "How many trees inspected in Night Safari this month?"
- Assign: "Team A handles Zone 1, Team B handles Zone 2"

---

### Layer

A **layer** is a visual overlay on the map. Multiple layers stack together. Each can be toggled on/off.

```
┌─────────────────────────────┐
│  Layer 3: Inspection Status │  ON/OFF
├─────────────────────────────┤
│  Layer 2: Zone Boundaries   │  ON/OFF
├─────────────────────────────┤
│  Layer 1: Tree Positions    │  ON/OFF
├─────────────────────────────┤
│  Base Map (satellite/street)│
└─────────────────────────────┘
```

**Example layers:**
- Trees layer - all tree markers
- Zones layer - boundary lines
- Overdue Inspections layer - highlights trees needing inspection
- High Risk Trees layer - shows only dangerous trees

---

### Inspection

An **inspection** is a physical check of a tree's condition, recorded in the system.

**4 Levels of inspection (ISA standard):**

| Level | Name | Description | Time |
|-------|------|-------------|------|
| Level 1 | Walk-by Inspection | Quick visual check while walking past | 1-2 min |
| Level 2 | Visual Tree Assessment | Stop and examine leaves, bark, lean angle | 10-15 min |
| Level 2 | Tree Risk Assessment | Detailed risk scoring, document defects | 20-30 min |
| Level 3 | Advance & Aerial | Climb tree or use drone, check internal decay | 1-2 hours |

**Inspection record contains:**
- Tree ID
- Inspector name
- Date/time
- Level (1-3)
- Checklist results (crown, trunk, root conditions)
- Risk assessment
- Photos and PDF attachments
- Recommendations and next inspection date

---

### Tree Risk

**Why trees fail (fall):**

```
1. BRANCH FAILURE          2. TRUNK FAILURE         3. ROOT FAILURE
   (branch breaks)            (trunk snaps)            (whole tree tips)

        ╱                         │                        │
       ╱  ← breaks               │ ← breaks              │
      ╱                          │                       │╲
     🌳                          🌳                      🌳 ← roots fail
```

**Risk = Likelihood × Consequence**

|                         | Low Traffic Area | High Traffic Area |
|-------------------------|------------------|-------------------|
| Healthy tree            | LOW              | LOW               |
| Tree with minor defects | LOW              | MEDIUM            |
| Tree with major defects | MEDIUM           | HIGH              |
| Tree likely to fail     | HIGH             | CRITICAL          |

A tree near a playground = higher consequence = higher priority.

---

### Schedule

Trees need **regular inspections** based on risk level.

```
Tree TREE-0042 (High Risk)
├── Inspection frequency: every 3 months
├── Last inspection: 2025-10-15
├── Next due: 2026-01-15
└── Status: Due in 12 days

Tree TREE-0099 (Low Risk)
├── Inspection frequency: every 12 months
├── Last inspection: 2025-06-01
├── Next due: 2026-06-01
└── Status: OK
```

System sends **email alerts** for upcoming and overdue inspections.

---

## Data Formats

### CAD/DXF

- **CAD** = Computer-Aided Design (software like AutoCAD)
- **DXF** = Drawing Exchange Format (file format)

Landscape architects and engineers need tree data in their drawings. The system exports tree positions and zone boundaries as DXF files that open in AutoCAD.

### Shapefile

GIS (Geographic Information System) format for geospatial vector data. Used by mapping professionals.

### Excel

Standard spreadsheet format for bulk import/export of tree data.

---

## Data Model

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    ZONE      │       │     TREE     │       │   INSPECTION     │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id           │       │ id           │       │ id               │
│ name         │◄──────│ zone_id      │◄──────│ tree_id          │
│ parent_id    │  1:N  │ species      │  1:N  │ inspector_id     │
│ boundary_geo │       │ gps_lat      │       │ date             │
│ area_sqm     │       │ gps_lng      │       │ level            │
│ created_at   │       │ height       │       │ risk_level       │
└──────────────┘       │ diameter     │       │ crown_condition  │
                       │ health       │       │ trunk_condition  │
                       │ risk_level   │       │ root_condition   │
                       │ planted_date │       │ notes            │
                       │ created_at   │       │ created_at       │
                       └──────────────┘       └──────────────────┘
                              │                        │
                              │ 1:N                    │ 1:N
                              ▼                        ▼
                       ┌──────────────┐       ┌──────────────────┐
                       │  TREE_PHOTO  │       │ INSPECTION_FILE  │
                       ├──────────────┤       ├──────────────────┤
                       │ id           │       │ id               │
                       │ tree_id      │       │ inspection_id    │
                       │ file_url     │       │ file_type        │
                       │ caption      │       │ file_url         │
                       └──────────────┘       └──────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    USER      │       │   SCHEDULE   │       │     LAYER        │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id           │       │ id           │       │ id               │
│ name         │◄──────│ inspector_id │       │ name             │
│ email        │  1:N  │ zone_id      │       │ type             │
│ role         │       │ tree_id      │       │ style_json       │
│ azure_ad_id  │       │ due_date     │       │ visible_default  │
└──────────────┘       │ frequency    │       └──────────────────┘
                       │ status       │
                       └──────────────┘
```

**Relationships:**
- 1 Zone has many Trees
- 1 Zone has many Sub-zones (self-referential)
- 1 Tree has many Inspections
- 1 Tree has many Photos
- 1 Inspection has many Files
- 1 User has many Inspections (as inspector)

---

## Typical Workflow

```
1. Import Excel with tree data
   ↓
2. Trees appear on map as markers
   ↓
3. Draw zone boundaries on map
   ↓
4. Assign trees to zones
   ↓
5. Create inspection schedule
   ↓
6. Inspector receives email alert
   ↓
7. Inspector goes on-site with mobile app
   ↓
8. Fills inspection form, takes photos
   ↓
9. Data syncs to server
   ↓
10. Dashboard shows progress
    ↓
11. Export to CAD/DXF for architects
```
