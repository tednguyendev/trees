// Fake tree data - Mandai area, Singapore
const defaultTrees = [
  // Singapore Zoo area
  { id: "T-001", species: "Rain Tree", lat: 1.4043, lng: 103.7930, risk: "low" },
  { id: "T-002", species: "Tembusu", lat: 1.4045, lng: 103.7935, risk: "low" },
  { id: "T-003", species: "Angsana", lat: 1.4048, lng: 103.7928, risk: "medium" },
  { id: "T-004", species: "Sea Apple", lat: 1.4040, lng: 103.7940, risk: "low" },
  { id: "T-005", species: "Yellow Flame", lat: 1.4052, lng: 103.7932, risk: "high" },
  { id: "T-006", species: "Rain Tree", lat: 1.4038, lng: 103.7925, risk: "low" },
  { id: "T-007", species: "Saga", lat: 1.4055, lng: 103.7938, risk: "low" },
  { id: "T-008", species: "Tembusu", lat: 1.4042, lng: 103.7945, risk: "medium" },
  { id: "T-009", species: "Frangipani", lat: 1.4035, lng: 103.7935, risk: "low" },
  { id: "T-010", species: "Rain Tree", lat: 1.4050, lng: 103.7942, risk: "low" },

  // Night Safari area
  { id: "T-011", species: "Angsana", lat: 1.4020, lng: 103.7890, risk: "low" },
  { id: "T-012", species: "Rain Tree", lat: 1.4025, lng: 103.7895, risk: "medium" },
  { id: "T-013", species: "Tembusu", lat: 1.4018, lng: 103.7885, risk: "low" },
  { id: "T-014", species: "Sea Apple", lat: 1.4030, lng: 103.7892, risk: "high" },
  { id: "T-015", species: "Yellow Flame", lat: 1.4022, lng: 103.7900, risk: "low" },
  { id: "T-016", species: "Saga", lat: 1.4015, lng: 103.7888, risk: "low" },
  { id: "T-017", species: "Rain Tree", lat: 1.4028, lng: 103.7882, risk: "medium" },
  { id: "T-018", species: "Frangipani", lat: 1.4032, lng: 103.7898, risk: "low" },
  { id: "T-019", species: "Angsana", lat: 1.4012, lng: 103.7895, risk: "low" },
  { id: "T-020", species: "Tembusu", lat: 1.4035, lng: 103.7885, risk: "low" },

  // River Wonders area
  { id: "T-021", species: "Rain Tree", lat: 1.4035, lng: 103.7870, risk: "low" },
  { id: "T-022", species: "Sea Apple", lat: 1.4040, lng: 103.7875, risk: "low" },
  { id: "T-023", species: "Yellow Flame", lat: 1.4032, lng: 103.7865, risk: "medium" },
  { id: "T-024", species: "Angsana", lat: 1.4045, lng: 103.7868, risk: "low" },
  { id: "T-025", species: "Tembusu", lat: 1.4038, lng: 103.7880, risk: "high" },
  { id: "T-026", species: "Saga", lat: 1.4030, lng: 103.7872, risk: "low" },
  { id: "T-027", species: "Rain Tree", lat: 1.4048, lng: 103.7862, risk: "low" },
  { id: "T-028", species: "Frangipani", lat: 1.4042, lng: 103.7858, risk: "medium" },
  { id: "T-029", species: "Sea Apple", lat: 1.4028, lng: 103.7878, risk: "low" },
  { id: "T-030", species: "Angsana", lat: 1.4050, lng: 103.7872, risk: "low" },

  // Bird Paradise area
  { id: "T-031", species: "Rain Tree", lat: 1.4060, lng: 103.7905, risk: "low" },
  { id: "T-032", species: "Tembusu", lat: 1.4065, lng: 103.7910, risk: "low" },
  { id: "T-033", species: "Yellow Flame", lat: 1.4058, lng: 103.7915, risk: "medium" },
  { id: "T-034", species: "Saga", lat: 1.4070, lng: 103.7908, risk: "low" },
  { id: "T-035", species: "Sea Apple", lat: 1.4062, lng: 103.7920, risk: "low" },
  { id: "T-036", species: "Angsana", lat: 1.4068, lng: 103.7918, risk: "high" },
  { id: "T-037", species: "Rain Tree", lat: 1.4055, lng: 103.7912, risk: "low" },
  { id: "T-038", species: "Frangipani", lat: 1.4072, lng: 103.7902, risk: "low" },
  { id: "T-039", species: "Tembusu", lat: 1.4064, lng: 103.7898, risk: "medium" },
  { id: "T-040", species: "Sea Apple", lat: 1.4075, lng: 103.7915, risk: "low" },

  // Additional scattered trees
  { id: "T-041", species: "Rain Tree", lat: 1.4008, lng: 103.7910, risk: "low" },
  { id: "T-042", species: "Angsana", lat: 1.4080, lng: 103.7890, risk: "medium" },
  { id: "T-043", species: "Tembusu", lat: 1.4010, lng: 103.7860, risk: "low" },
  { id: "T-044", species: "Saga", lat: 1.4078, lng: 103.7865, risk: "low" },
  { id: "T-045", species: "Yellow Flame", lat: 1.4005, lng: 103.7920, risk: "high" },
  { id: "T-046", species: "Sea Apple", lat: 1.4082, lng: 103.7925, risk: "low" },
  { id: "T-047", species: "Rain Tree", lat: 1.4015, lng: 103.7950, risk: "low" },
  { id: "T-048", species: "Frangipani", lat: 1.4085, lng: 103.7855, risk: "medium" },
  { id: "T-049", species: "Angsana", lat: 1.4002, lng: 103.7875, risk: "low" },
  { id: "T-050", species: "Tembusu", lat: 1.4088, lng: 103.7940, risk: "low" }
];

// Zone boundaries
const defaultZones = [
  {
    id: "zone-zoo",
    name: "Singapore Zoo",
    boundary: [
      [1.4030, 103.7920],
      [1.4030, 103.7950],
      [1.4060, 103.7950],
      [1.4060, 103.7920]
    ]
  },
  {
    id: "zone-safari",
    name: "Night Safari",
    boundary: [
      [1.4005, 103.7875],
      [1.4005, 103.7905],
      [1.4040, 103.7905],
      [1.4040, 103.7875]
    ]
  },
  {
    id: "zone-river",
    name: "River Wonders",
    boundary: [
      [1.4025, 103.7855],
      [1.4025, 103.7885],
      [1.4055, 103.7885],
      [1.4055, 103.7855]
    ]
  },
  {
    id: "zone-bird",
    name: "Bird Paradise",
    boundary: [
      [1.4052, 103.7895],
      [1.4052, 103.7925],
      [1.4080, 103.7925],
      [1.4080, 103.7895]
    ]
  }
];
