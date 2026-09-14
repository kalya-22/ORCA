import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'bluecurrent.db');

// Recreate the DB each boot so seed data is always fresh during development.
// Swap `rmSync` for a persistent file in production.
if (fs.existsSync(DB_PATH)) fs.rmSync(DB_PATH);

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE vessels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    heading REAL NOT NULL,
    speed REAL NOT NULL,
    status TEXT NOT NULL
  );

  CREATE TABLE pfz_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    radius_m INTEGER NOT NULL,
    sst_c REAL NOT NULL,
    chlorophyll TEXT NOT NULL,
    density TEXT NOT NULL,
    yield_pct REAL NOT NULL,
    distance_km REAL NOT NULL
  );

  CREATE TABLE spills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    radius_m INTEGER NOT NULL,
    severity TEXT NOT NULL
  );

  CREATE TABLE debris (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    size TEXT NOT NULL
  );

  CREATE TABLE boundaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    coords TEXT NOT NULL
  );

  CREATE TABLE corridors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    points TEXT NOT NULL
  );

  CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    lat REAL,
    lng REAL,
    created_at TEXT NOT NULL,
    source_type TEXT,
    source_ref TEXT
  );

  CREATE TABLE weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    wave_height_m REAL NOT NULL,
    wind_speed_kmh REAL NOT NULL,
    sst_c REAL NOT NULL,
    condition TEXT NOT NULL
  );

  CREATE TABLE agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    latency_ms INTEGER NOT NULL,
    source TEXT NOT NULL,
    message TEXT NOT NULL
  );

  CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    generated_at TEXT NOT NULL,
    content TEXT NOT NULL
  );

  CREATE TABLE habitat_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    season TEXT NOT NULL,
    status TEXT NOT NULL,
    temp_min_c REAL NOT NULL,
    temp_max_c REAL NOT NULL,
    sst_c REAL NOT NULL,
    coords TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE vessel_tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vessel_id INTEGER NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    heading REAL NOT NULL,
    speed REAL NOT NULL,
    recorded_at TEXT NOT NULL
  );

  CREATE TABLE spill_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spill_id INTEGER NOT NULL,
    affected_area_km2 REAL NOT NULL,
    spread_points TEXT NOT NULL,
    affected_species TEXT NOT NULL,
    response_status TEXT NOT NULL,
    recommendations TEXT NOT NULL
  );

  CREATE TABLE agent_evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER NOT NULL,
    claim TEXT NOT NULL,
    source TEXT NOT NULL,
    confidence_factor REAL NOT NULL,
    reasoning TEXT NOT NULL
  );
`);

// ---- Seed data (Bay of Bengal area, ~18.4N 84.2E like the UI) ----

const seed = {
  vessels: [
    ['ORCA-01 (Vizag)', 18.4, 84.2, 45, 14, 'ACTIVE'],
    ['ORCA-02 (Kalingapatnam)', 18.1, 84.5, 120, 9, 'ACTIVE'],
    ['ORCA-03 (Gopalpur)', 18.7, 83.9, 300, 11, 'CRUISING'],
    ['Matsya-01 (Dwarka Safe PFZ)', 22.18, 68.62, 42, 8.4, 'ACTIVE'],
    ['Sagar Kanya (Gujarat Shelf)', 22.25, 68.42, 290, 7.2, 'ACTIVE'],
    ['Samudra Ratna (Gulf of Kutch)', 22.65, 69.2, 110, 10.1, 'RETURNING'],
    ['Malabar Queen (Kochi)', 10.15, 75.85, 180, 9.5, 'ACTIVE'],
    ['Sethu Samudram (Mannar)', 9.15, 79.12, 85, 6.8, 'CRUISING'],
  ],
  pfz: [
    ['Dwarka Shelf Safe PFZ (45km)', 22.2, 68.5, 12000, 26.85, 'High (1.85 mg/m³)', 'Pelagic (Mackerel/Pomfret)', 96.5, 45],
    ['PFZ Zone 01 (Visakhapatnam)', 18.5, 84.3, 10000, 27.4, 'High', 'Pelagic', 92, 12],
    ['PFZ Zone 02 (Kalingapatnam)', 18.1, 84.6, 8000, 26.8, 'High', 'Demersal', 87, 18],
    ['PFZ Zone 03 (Gopalpur)', 18.9, 83.7, 12000, 27.9, 'Medium', 'Pelagic', 74, 26],
    ['PFZ Zone 04 (Bheemunipatnam)', 17.9, 84.0, 7000, 25.6, 'Low', 'Mixed', 51, 34],
    ['Malabar Upwelling PFZ (Kochi)', 10.25, 75.75, 11000, 27.2, 'High (2.1 mg/m³)', 'Pelagic (Oil Sardine)', 91.0, 18],
    ['Mannar Biosphere Buffer PFZ', 8.95, 78.95, 9000, 28.1, 'High (1.65 mg/m³)', 'Demersal (Squid / Reef fish)', 85.5, 22],
  ],
  spills: [
    ['Seep Alpha (Vizag)', 18.6, 84.8, 9000, 'MODERATE'],
    ['Sheen Bravo (Gopalpur)', 18.0, 83.5, 5000, 'LOW'],
    ['Kandla Anchor Sheen (Gujarat)', 22.75, 69.8, 4000, 'LOW'],
  ],
  debris: [
    ['Debris Cluster (Vizag)', 18.3, 84.1, 'Large'],
    ['Driftwood Field (Kalingapatnam)', 18.55, 84.6, 'Medium'],
    ['Container Debris (Gopalpur)', 18.15, 83.9, 'Large'],
    ['Lost Trawl Net (Dwarka Shelf)', 22.35, 68.7, 'Medium'],
    ['Drifting Fish Trap (Kochi)', 10.3, 75.6, 'Medium'],
  ],
  boundaries: [
    ['EEZ Boundary (Bay of Bengal)', 'exclusive_economic_zone', [[18.9, 84.9], [18.6, 85.1], [18.2, 85.0], [17.9, 84.7], [17.8, 84.2]]],
    ['Territorial Waters (East Coast)', 'territorial', [[18.6, 84.6], [18.3, 84.8], [18.0, 84.5], [18.0, 84.0], [18.4, 83.8]]],
    ['Marine Reserve (Vizag)', 'protected', [[18.7, 84.0], [18.8, 84.3], [18.5, 84.4], [18.4, 84.1]]],
    ['Dwarka Marine Sanctuary Shelf', 'protected', [[22.15, 68.9], [22.35, 69.1], [22.45, 68.95], [22.25, 68.75]]],
    ['Gulf of Mannar Biosphere Core', 'protected', [[8.8, 78.6], [9.3, 79.2], [9.1, 79.4], [8.6, 78.8]]],
    ['Malabar Coastal Conservation Zone', 'protected', [[9.8, 76.0], [10.4, 75.8], [10.5, 76.1], [9.9, 76.3]]],
  ],
  corridors: [
    ['Visakhapatnam Corridor A', [[18.4, 84.2], [18.5, 84.5], [18.7, 84.7]]],
    ['Visakhapatnam Corridor B', [[18.4, 84.2], [18.3, 84.5], [18.5, 84.8], [18.8, 84.6]]],
    ['Dwarka Safe PFZ Corridor', [[22.10, 68.75], [22.20, 68.50], [22.35, 68.25]]],
    ['Malabar Transit Line (Kochi)', [[10.0, 75.9], [10.2, 75.7], [10.4, 75.5]]],
    ['Palk Strait Transit Line', [[9.2, 79.1], [9.4, 79.3], [9.6, 79.5]]],
  ],
  alerts: [
    ['CAUTION', 'Dinoflagellate Algal Bloom (HAB) Alert', 'Toxic bloom patch detected at 22.3°N, 68.52°E (10km North of Dwarka PFZ). Ocean current moving NE at 0.3 m/s is safely pushing bloom away from active fishing zone.', 22.3, 68.52, minutesAgo(8), 'isro_ocm3', 'Oceansat-3 OCM-3'],
    ['HIGH', 'Severe Weather Warning: Rapid Wind Shear', 'Gale-force winds up to 38 knots detected 15NM North-East. Small craft advised to seek shelter or alter heading immediately.', 18.9, 84.5, minutesAgo(2), 'random', null],
    ['CAUTION', 'Marine Debris & Driftwood Cluster', 'Floating container debris reported near coordinates 18.3°N, 84.1°E. Navigation hazard for surface hulls.', 18.3, 84.1, minutesAgo(18), 'hazard', 'Debris Cluster'],
    ['INFO', 'EEZ Boundary Patrol Active', 'Coast Guard patrol vessel operating near Sector 4. Maintain standard transponder frequency 156.8 MHz.', 18.6, 84.9, minutesAgo(45), 'random', null],
    ['CAUTION', 'Malabar Monsoon Upwelling Swell Advisory', 'Swell height reaching 1.8m off Kochi shelf. Small craft advised to operate inside 12 NM line.', 10.2, 75.8, minutesAgo(12), 'isro_scatsat', 'Oceansat-3 Altimeter'],
    ['INFO', 'Mannar Coral Reef Navigation Caution', 'Shallow bathymetry < 8m near Palk Strait reef crest. Draft restriction active for deep tonnage.', 9.1, 79.2, minutesAgo(30), 'bathymetry', 'Sentinel-2 Bathymetry'],
  ],
  weather: [
    [22.2, 68.5, 1.2, 21, 26.85, 'CALM & SAFE'],
    [18.4, 84.2, 1.8, 24, 27.4, 'MODERATE CAUTION'],
    [18.9, 84.5, 2.4, 38, 27.1, 'HIGH WAVE'],
    [18.1, 83.9, 1.2, 15, 26.9, 'CALM'],
    [18.5, 84.8, 2.0, 28, 27.6, 'CAUTION'],
    [10.2, 75.8, 1.8, 28, 27.2, 'MONSOON SWELL'],
    [9.0, 79.1, 0.9, 16, 28.1, 'CALM REEF'],
  ],
  agents: [
    ['🧠 ORCA Orchestrator Agent', 'ONLINE', 14, 'ISRO Mission Bus', 'Deconstructs multi-modal satellite objectives and coordinates cross-agent conflict resolution.'],
    ['🛰️ Geospatial Front Agent', 'VERIFIED', 10, 'INSAT-3D Thermal IR', 'Detects sharp thermal front (1.45°C/deg) 45 km off Dwarka; verified against NIOT buoy AD06.'],
    ['🌊 Physics & Wave Dynamics Agent', 'MONITORING', 12, 'Oceansat-3 Altimeter', 'Wave heights safe at 1.2m (<1.5m limit); currents stable at 0.3 m/s moving Northeast.'],
    ['🐟 Bio-Ecological & HAB Agent', 'VERIFIED', 15, 'Oceansat-3 OCM-3', 'High chlorophyll-a (1.85 mg/m³). Conflict resolved: toxic bloom 10km North is drifting away safely.'],
    ['Security & Border Agent', 'VERIFIED', 8, 'AIS Live Feed', 'Evaluating EEZ geofence. No unauthorized entry or AIS spoofing detected.'],
  ],
  habitat_zones: [
    ['Sundarbans Hilsa Spawning Ground', 'Hilsa (Tenualosa ilisha)', 'Monsoon', 'breeding', 24, 30, 28.2, [[18.5, 84.2], [18.7, 84.3], [18.6, 84.5], [18.4, 84.4]], 'Critical spawning habitat for Hilsa during monsoon freshet.'],
    ['Visakhapatnam Mackerel Bank', 'Indian Mackerel (Rastrelliger kanagurta)', 'Pre-Monsoon', 'active', 25, 29, 27.8, [[18.2, 84.7], [18.4, 84.9], [18.3, 85.0], [18.1, 84.8]], 'Seasonal feeding ground with high plankton productivity.'],
    ['Chennai Sardine Nursery', 'Oil Sardine (Sardinella longiceps)', 'Post-Monsoon', 'active', 26, 31, 28.5, [[17.9, 84.0], [18.1, 84.2], [18.0, 84.4], [17.8, 84.1]], 'Juvenile sardine nursery with optimal temperature-salinity window.'],
    ['Gopalpur Tiger Prawn Estuary', 'Tiger Prawn (Penaeus monodon)', 'Monsoon', 'breeding', 22, 28, 26.0, [[18.6, 83.7], [18.8, 83.8], [18.7, 84.0], [18.5, 83.9]], 'Brackish water estuary supporting larval prawn development.'],
    ['Paradip Tuna Riff', 'Yellowfin Tuna (Thunnus albacares)', 'Pre-Monsoon', 'inactive', 24, 30, 27.2, [[18.9, 84.0], [19.1, 84.2], [19.0, 84.4], [18.8, 84.3]], 'Pelagic tuna aggregation zone — currently outside seasonal window.'],
  ],
  spill_analysis: [
    [1, 12.4, [[18.6, 84.8], [18.62, 84.85], [18.65, 84.9], [18.68, 84.95], [18.7, 85.0]], ['Hilsa', 'Mackerel', 'Sardine'], 'ACTIVE', 'Deploy containment boom NE; establish 2km exclusion zone; monitor wind shift SSE.'],
    [2, 3.1, [[18.0, 83.5], [18.02, 83.45], [18.05, 83.4], [18.08, 83.35]], ['Sardine', 'Tiger Prawn'], 'MONITORING', 'Natural dispersion expected within 48h; no containment action required.'],
  ],
  agent_evidence: [
    [1, 'SST anomaly +0.4°C detected at 18.5N, 84.3E', 'Sentinel-3', 94, 'SLSTR L2P product shows persistent warm patch over 72h; correlates with chlorophyll-a increase.'],
    [1, 'Fish aggregation likelihood high in eastern sector', 'Sentinel-3', 88, 'OLCI chlorophyll front matches PFZ Zone 01 boundary; eddy-driven upwelling confirmed.'],
    [2, 'Squall front moving SSE at 18 knots', 'NOAA GFS', 91, '00Z GFS run: 850hPa wind vector 180°/18kt; MCS initiation probability >70% per HREF.'],
    [2, 'Wave height expected to peak at 2.4m within 3h', 'NOAA GFS', 85, 'WW3 wave model forced by GFS winds; Hs 2.4m at 18.9N, 84.5E at T+3h.'],
    [3, 'No unauthorized entry or AIS spoofing detected', 'AIS Live Feed', 97, 'All 147 tracked vessels in sector match registered MMSI; zero AIS gap events >5min.'],
    [3, 'EEZ geofence integrity maintained', 'AIS Live Feed', 93, 'Boundary proximity alerts: 0 breaches in last 6h; nearest vessel 12.3NM outside EEZ.'],
    [2, 'Thermal front 1.45°C/deg located 45 km off Dwarka (22.2N, 68.5E)', 'INSAT-3D Thermal IR', 96, 'Cold upwelling water meeting warm surface layer creates dense pelagic fish aggregation boundary.'],
    [3, 'Waves 1.2m (<1.5m limit); currents 0.3 m/s Northeast', 'Oceansat-3 Altimeter / SCATSAT-1', 95, 'Safe operating conditions for fishing craft. 0.3 m/s current pushes toxic bloom away to NE.'],
    [4, 'Chlorophyll 1.85 mg/m³; toxic bloom drifting NE safely', 'Oceansat-3 OCM-3', 94, 'High primary productivity feeding ground. Toxic Noctiluca bloom 10km North confirmed drifting away by current vector.'],
  ],
  reports: [],
  vessel_tracks: [],
};

function minutesAgo(n) {
  return new Date(Date.now() - n * 60_000).toISOString();
}

export function buildReportContent(type) {
  const vessels = db.prepare('SELECT * FROM vessels').all();
  const pfz = db.prepare('SELECT * FROM pfz_zones').all();
  const alerts = db.prepare('SELECT * FROM alerts').all();
  const weather = db.prepare('SELECT * FROM weather').all();
  const debris = db.prepare('SELECT * FROM debris').all();

  const activeVessels = vessels.filter((v) => v.status === 'ACTIVE').length;
  const topZone = pfz.find((z) => z.name.includes('Dwarka')) || pfz.reduce((a, b) => (a.yield_pct > b.yield_pct ? a : b), pfz[0]);
  const highAlerts = alerts.filter((a) => a.level === 'HIGH').length;
  const cautionAlerts = alerts.filter((a) => a.level === 'CAUTION').length;
  const infoAlerts = alerts.filter((a) => a.level === 'INFO').length;
  const wavePeak = Math.max(...weather.map((w) => w.wave_height_m));

  if (type === 'daily') {
    const period = 'Last 24 Hours (Today)';
    const summary = `Daily 24-Hour Tactical Brief: ${vessels.length} active vessels monitored across key coastal corridors. Primary focus is ${topZone?.name || 'Dwarka Shelf'} (${topZone?.yield_pct || 96.5}% yield index, SST ${topZone?.sst_c || 26.85}°C). Active tactical advisory: Toxic dinoflagellate bloom (HAB) detected 10 km north of Dwarka, drifting safely 0.3 m/s Northeast away from the fishing corridor under Oceansat-3 scatterometer validation. Zero maritime boundary violations logged today.`;

    const stats = {
      'Active Sorties Today': `${activeVessels || 3} Commercial Vessels`,
      '24h Catch Estimate': '4.8 Metric Tons',
      'Lead PFZ Yield': `${topZone ? topZone.yield_pct : 96.5}% (${topZone?.name.split(' ')[0] || 'Dwarka'})`,
      'Peak Wave (Hs)': `${wavePeak}m (Safe <1.5m)`,
      'Surface Wind': '18 km/h (Gentle)',
      'Active Algal Bloom': '1 HAB (Drifting NE)',
      'Fuel Conserved Today': '280 Liters',
      'EEZ Compliance': '100% Verified',
    };

    const sections = [
      {
        title: 'Daily Fleet Sortie & Telemetry Status',
        rows: [
          { label: 'Matsya-01 (Dwarka Inshore)', value: 'ACTIVE · 8.4 kn · In PFZ Buffer Corridor', severity: 'ok' },
          { label: 'Sagar Kanya (Dwarka Outer Shelf)', value: 'ACTIVE · 7.2 kn · Hauling Pelagic Longline', severity: 'ok' },
          { label: 'Samudra Ratna (Kandla Corridor)', value: 'RETURNING · 10.1 kn · En Route Fish Landing Center', severity: 'ok' },
          { label: 'Varuna-03 (Porbandar Offshore)', value: 'CRUISING · 6.8 kn · Heading 310° Towards Thermal Front', severity: 'ok' },
          { label: 'Artisanal Gillnetter Fleet (10 crafts)', value: 'ACTIVE · 4.5 kn · Within 12 NM Safe Line', severity: 'ok' },
        ],
      },
      {
        title: '24-Hour Oceanographic & Weather Telemetry (ISRO Live)',
        rows: [
          { label: 'Sea Surface Temperature (SST)', value: `${topZone?.sst_c || 26.85}°C (Frontal gradient 1.45°C/deg)`, severity: 'ok' },
          { label: 'Peak Significant Wave Height (Hs)', value: `${wavePeak}m (< 1.5m small-craft threshold)`, severity: 'ok' },
          { label: 'Surface Wind Speed (SCATSAT)', value: '18 km/h · Beaufort 3 (Gentle Breeze)', severity: 'ok' },
          { label: 'Chlorophyll-a Biomass Index', value: '1.85 mg/m³ (High primary productivity)', severity: 'ok' },
          { label: 'Ocean Current Velocity & Direction', value: '0.30 m/s moving Northeast (045°)', severity: 'ok' },
        ],
      },
      {
        title: 'Tactical Hazard & Conflict Deliberation',
        rows: [
          { label: 'Dwarka Toxic Algal Bloom (HAB)', value: 'CAUTION · 22.30°N, 68.52°E (10 km North)', severity: 'crit' },
          { label: 'Current Advection Drift', value: '0.3 m/s NE (Carrying bloom away from PFZ)', severity: 'ok' },
          { label: 'Multi-Agent Conflict Status', value: 'RESOLVED (Orchestrator cross-verified with Physics)', severity: 'ok' },
          { label: 'Marine Debris Cluster', value: 'Floating driftwood at 18.3°N, 84.1°E (Nav Alert)', severity: 'warn' },
          { label: 'Safe Fishing Corridor Corridor', value: 'Corridor A clear · 2 NM safety buffer enforced', severity: 'ok' },
        ],
      },
      {
        title: "Today's Fishery Harvest & Landing Estimates",
        rows: [
          { label: 'Indian Mackerel (Rastrelliger kanagurta)', value: '2.6 MT · 54% of daily landings (High)', severity: 'ok' },
          { label: 'Ribbonfish & Sciaenids', value: '1.3 MT · 27% of daily landings', severity: 'ok' },
          { label: 'Silver & Black Pomfret', value: '0.9 MT · 19% of daily landings', severity: 'ok' },
          { label: 'Mean Scouting Time Saved per Boat', value: '2.4 Hours (Direct thermal front guidance)', severity: 'ok' },
        ],
      },
    ];

    return { timeframe: 'daily', period, summary, stats, sections };
  } else {
    // Weekly Strategic Report
    const period = 'Last 7 Days (Strategic Cumulative)';
    const summary = `7-Day Cumulative Fleet Intelligence Review: 124 completed sorties with 38.6 metric tons total sustainable marine catch logged across Indian coastal sectors. ORCA multi-agent thermal front guidance achieved a 14.8% reduction in fleet diesel consumption (1,840 liters conserved). Zero safety breaches or maritime boundary violations across 168 hours of continuous ISRO satellite surveillance (Oceansat-3 & INSAT-3D). Longitudinal analysis indicates the Dwarka HAB bloom has drifted 32 km NE along the shelf break with 40% cell density dissipation.`;

    const stats = {
      '7-Day Total Landings': '38.6 Metric Tons',
      'Sorties Completed': '124 Missions',
      'Cumulative Fuel Saved': '1,840 Liters (14.8%)',
      'Mean 7-Day Sea State': '1.38m Average Hs',
      'PFZ Hit Rate Accuracy': '94.6% Reliability',
      'Fleet Distance Logged': '14,820 Nautical Miles',
      'EEZ Violations': '0 (100% Compliant)',
      'Satellite Data Uptime': '98.8% Available',
    };

    const sections = [
      {
        title: '7-Day Fleet Sortie & Fuel Economics',
        rows: [
          { label: 'Total Sorties Completed', value: '124 missions (100% safe return rate)', severity: 'ok' },
          { label: 'Cumulative Diesel Conserved', value: '1,840 Liters saved via thermal front routing', severity: 'ok' },
          { label: 'Average Trip Duration', value: '13.2 hours per sortie (-1.8h vs historical)', severity: 'ok' },
          { label: 'Engine Idling Reduction', value: '-22% due to direct waypoint navigation', severity: 'ok' },
          { label: 'Cooperative Fleet Participation', value: '48 artisanal + 16 trawler units participating', severity: 'ok' },
        ],
      },
      {
        title: 'Weekly Catch Biomass & PFZ Validation',
        rows: [
          { label: 'Cumulative Catch Volume', value: '38.6 Metric Tons (Pelagic & Demersal)', severity: 'ok' },
          { label: 'ISRO PFZ Hit Rate Correlation', value: '94.6% agreement with landing logs', severity: 'ok' },
          { label: 'Top Producing Sector', value: `${topZone?.name.split(' ')[0] || 'Dwarka'} Outer Shelf (avg 92.4% yield)`, severity: 'ok' },
          { label: 'Second Producing Sector', value: 'Visakhapatnam Mackerel Bank (87% yield)', severity: 'ok' },
          { label: 'Juvenile Bycatch Proportion', value: '< 1.4% (Well below 5.0% CMFRI sustainability cap)', severity: 'ok' },
        ],
      },
      {
        title: 'Longitudinal Hazard & Environmental Trends',
        rows: [
          { label: 'Dwarka HAB Bloom Evolution', value: 'Drifted 32 km NE along shelf break (40% cell decay)', severity: 'warn' },
          { label: '7-Day Maximum Wave Swell', value: '2.4m recorded on Day 3 (managed via safe corridors)', severity: 'warn' },
          { label: 'Debris Retrieval SAR Missions', value: '2 ghost nets tagged & recovered by Coast Guard', severity: 'ok' },
          { label: 'Oil Slick / Bilge Discharge Alerts', value: '0 critical incidents across all 4 monitored sectors', severity: 'ok' },
          { label: 'Boundary Proximity Violations', value: '0 geofence incursions into Marine Protected Areas', severity: 'ok' },
        ],
      },
      {
        title: 'ISRO Satellite Telemetry & Multi-Agent Swarm Reliability',
        rows: [
          { label: 'Oceansat-3 OCM-3 Passes Assimilated', value: '14 passes processed (100% cloud-free yield)', severity: 'ok' },
          { label: 'INSAT-3D Thermal Frames Assimilated', value: '168 hourly SST composites processed', severity: 'ok' },
          { label: 'Cross-Agent Deliberations Executed', value: '56 multi-agent conflict resolutions resolved', severity: 'ok' },
          { label: 'Mean Reasoning Latency', value: '1.42 seconds per cross-agent consensus', severity: 'ok' },
          { label: 'SMS & NAVTEX Broadcast Uptime', value: '99.9% delivery rate in English & Gujarati', severity: 'ok' },
        ],
      },
    ];

    return { timeframe: 'weekly', period, summary, stats, sections };
  }
}

for (const row of seed.vessels) db.prepare('INSERT INTO vessels (name,lat,lng,heading,speed,status) VALUES (?,?,?,?,?,?)').run(...row);

// ---- Seed vessel tracks: interpolate ~8 historical points per vessel backwards along heading ----
const DEG_PER_KM = 1 / 111.32;
const vesselsSeed = db.prepare('SELECT id, lat, lng, heading, speed FROM vessels').all();
for (const v of vesselsSeed) {
  const rad = (v.heading * Math.PI) / 180;
  const stepKm = (v.speed * (3 / 3600)) * 0.5; // 3s tick, half speed for history
  const stepDeg = stepKm * DEG_PER_KM;
  let lat = v.lat;
  let lng = v.lng;
  for (let i = 0; i < 8; i++) {
    lat -= Math.cos(rad) * stepDeg;
    lng -= Math.sin(rad) * stepDeg;
    const recorded = new Date(Date.now() - (8 - i) * 3000).toISOString();
    db.prepare('INSERT INTO vessel_tracks (vessel_id,lat,lng,heading,speed,recorded_at) VALUES (?,?,?,?,?,?)')
      .run(v.id, lat, lng, v.heading, v.speed, recorded);
  }
}
for (const row of seed.pfz) db.prepare('INSERT INTO pfz_zones (name,lat,lng,radius_m,sst_c,chlorophyll,density,yield_pct,distance_km) VALUES (?,?,?,?,?,?,?,?,?)').run(...row);
for (const row of seed.spills) db.prepare('INSERT INTO spills (name,lat,lng,radius_m,severity) VALUES (?,?,?,?,?)').run(...row);
for (const row of seed.debris) db.prepare('INSERT INTO debris (name,lat,lng,size) VALUES (?,?,?,?)').run(...row);
for (const row of seed.boundaries) db.prepare('INSERT INTO boundaries (name,type,coords) VALUES (?,?,?)').run(row[0], row[1], JSON.stringify(row[2]));
for (const row of seed.corridors) db.prepare('INSERT INTO corridors (name,points) VALUES (?,?)').run(row[0], JSON.stringify(row[1]));
for (const row of seed.alerts) db.prepare('INSERT INTO alerts (level,title,message,lat,lng,created_at,source_type,source_ref) VALUES (?,?,?,?,?,?,?,?)').run(...row);
for (const row of seed.weather) db.prepare('INSERT INTO weather (lat,lng,wave_height_m,wind_speed_kmh,sst_c,condition) VALUES (?,?,?,?,?,?)').run(...row);
for (const row of seed.agents) db.prepare('INSERT INTO agents (name,status,latency_ms,source,message) VALUES (?,?,?,?,?)').run(...row);
for (const row of seed.habitat_zones) db.prepare('INSERT INTO habitat_zones (name,species,season,status,temp_min_c,temp_max_c,sst_c,coords,description) VALUES (?,?,?,?,?,?,?,?,?)').run(row[0], row[1], row[2], row[3], row[4], row[5], row[6], JSON.stringify(row[7]), row[8]);
for (const row of seed.spill_analysis) db.prepare('INSERT INTO spill_analysis (spill_id,affected_area_km2,spread_points,affected_species,response_status,recommendations) VALUES (?,?,?,?,?,?)').run(row[0], row[1], JSON.stringify(row[2]), JSON.stringify(row[3]), row[4], row[5]);
for (const row of seed.agent_evidence) db.prepare('INSERT INTO agent_evidence (agent_id,claim,source,confidence_factor,reasoning) VALUES (?,?,?,?,?)').run(...row);

// ---- Seed initial reports (daily + weekly) — must run AFTER all other seed data so the summary is populated ----
const dailyContent = buildReportContent('daily');
const weeklyContent = buildReportContent('weekly');
db.prepare('INSERT INTO reports (type,title,generated_at,content) VALUES (?,?,?,?)')
  .run('daily', 'Daily Operations Summary (24h)', new Date().toISOString(), JSON.stringify(dailyContent));
db.prepare('INSERT INTO reports (type,title,generated_at,content) VALUES (?,?,?,?)')
  .run('weekly', 'Weekly Strategic Review (7d)', new Date(Date.now() - 3600_000 * 2).toISOString(), JSON.stringify(weeklyContent));

export const now = () => new Date().toISOString();
