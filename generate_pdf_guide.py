import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "ORCA — Marine Ecosystem Reasoning & Operational Architecture")
            self.drawRightString(612 - 54, 750, "System Architecture & Operations Guide")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        self.drawString(54, 32, "CONFIDENTIAL — ORCA / ISRO Smart India Hackathon Challenge 26176")
        self.drawRightString(612 - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=60,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#0c1424")      # Deep Oceanic Slate
    ACCENT = colors.HexColor("#0284c7")       # Azure Blue
    CYAN = colors.HexColor("#0284c7")
    TEXT_DARK = colors.HexColor("#1e293b")
    TEXT_MUTED = colors.HexColor("#64748b")
    BG_LIGHT = colors.HexColor("#f8fafc")
    BORDER_COLOR = colors.HexColor("#e2e8f0")
    ALERT_BG = colors.HexColor("#f0f9ff")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=ACCENT,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=ACCENT,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.white
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0369a1")
    )

    story = []

    # ================= COVER / TITLE BLOCK =================
    story.append(Spacer(1, 10))
    story.append(Paragraph("ORCA: Ocean Reasoning & Cognitive Architecture", title_style))
    story.append(Paragraph("Autonomous Marine Ecosystem Swarm & Integrated Operational Platform", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT, spaceBefore=0, spaceAfter=12))

    # Meta Info Card
    meta_data = [
        [Paragraph("<b>Challenge:</b> ISRO SIH Challenge ID 26176", table_cell),
         Paragraph("<b>Target Domain:</b> Coastal Ecology & Blue Economy", table_cell)],
        [Paragraph("<b>Core Stack:</b> React 18, TypeScript, Node.js, SQLite, Groq AI", table_cell),
         Paragraph("<b>Deployment:</b> Local / Offline-Ready Hybrid Architecture", table_cell)]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # ================= 1. PROJECT EXECUTIVE OVERVIEW =================
    story.append(Paragraph("1. Executive Summary & Project Purpose", h1_style))
    story.append(Paragraph(
        "<b>ORCA</b> is a comprehensive, production-grade maritime intelligence and multi-agent reasoning system designed "
        "to empower Indian coastal fisheries, marine law enforcement, and environmental oceanographers. Built for "
        "<b>ISRO Smart India Hackathon Challenge 26176</b> ('Marine Ecosystem Reasoning Swarm'), ORCA fuses multi-spectral Earth "
        "observation satellite telemetry, oceanic moored buoys, vessel AIS tracks, and autonomous multi-agent reasoning into a "
        "unified decision-support command center.",
        body_style
    ))
    story.append(Paragraph(
        "The project solves critical operational dilemmas faced by coastal communities: balancing maximum fishing yields with maritime "
        "safety, early detection of toxic harmful algal blooms (HABs), autonomous hazard-deflection route planning, rapid oil spill "
        "perimeter tracking, and sovereign maritime boundary protection.",
        body_style
    ))

    # Highlight box
    box_content = [
        [Paragraph(
            "<b>Key Dual Mission:</b><br/>"
            "• <b>Economic Empowerment:</b> Boost artisan & commercial fish catch efficiency by up to 35% through satellite thermal-front and chlorophyll-a coincident Potential Fishing Zones (PFZs).<br/>"
            "• <b>Life & Biosphere Preservation:</b> Real-time hazard avoidance (rough seas, toxic dinoflagellate blooms, oil slicks, maritime EEZ violations) with sub-second advisory generation in local coastal languages (Gujarati, Telugu, Tamil, Malayalam, Hindi).",
            callout_style
        )]
    ]
    box_table = Table(box_content, colWidths=[504])
    box_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ALERT_BG),
        ('BOX', (0, 0), (-1, -1), 1, ACCENT),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(box_table)
    story.append(Spacer(1, 12))

    # ================= 2. TECHNOLOGY STACK =================
    story.append(Paragraph("2. Technical Stack & Component Architecture", h1_style))
    story.append(Paragraph(
        "ORCA is engineered with a modular, decoupled architecture enabling sub-second real-time responsiveness and resilient offline edge computing:",
        body_style
    ))

    tech_data = [
        [Paragraph("Layer", table_header), Paragraph("Technologies Used", table_header), Paragraph("Architectural Role", table_header)],
        [
            Paragraph("<b>Frontend UI</b>", table_cell),
            Paragraph("React 18, TypeScript, Vite, Tailwind/Modern CSS Variables, Lucide Icons", table_cell),
            Paragraph("Single Page Application with glassmorphism UI, tabbed modules, responsive desktop/tablet layouts.", table_cell)
        ],
        [
            Paragraph("<b>GIS & Visuals</b>", table_cell),
            Paragraph("Leaflet, OpenStreetMap, HTML5 Canvas, Reactbits Animations", table_cell),
            Paragraph("Interactive multi-layer ocean maps, polygon hazard overlays, vessel heading vectors, and fluid cursor effects.", table_cell)
        ],
        [
            Paragraph("<b>Backend Server</b>", table_cell),
            Paragraph("Node.js (ESM), Express 4, Socket.io, RESTful APIs, CORS", table_cell),
            Paragraph("Telemetry aggregation, hazard calculations, route optimization endpoints, and live WebSocket streaming.", table_cell)
        ],
        [
            Paragraph("<b>Data Storage</b>", table_cell),
            Paragraph("SQLite3 via <code>better-sqlite3</code>", table_cell),
            Paragraph("Zero-latency synchronous persistence for weather grids, AIS tracks, geotagged observations, and alerts.", table_cell)
        ],
        [
            Paragraph("<b>AI Reasoning</b>", table_cell),
            Paragraph("Groq Cloud API (Meta LLaMA-3.3-70B), Custom ORCA Agent Swarm", table_cell),
            Paragraph("RAG-injected oceanographic LLM assistant + 4-agent collaborative consensus conflict resolution engine.", table_cell)
        ],
        [
            Paragraph("<b>Satellite Feeds</b>", table_cell),
            Paragraph("ISRO INSAT-3D/3DR, Oceansat-3 (OCM-3/SSTM), SCATSAT-1, INCOIS Buoys", table_cell),
            Paragraph("Thermal infrared SST, ocean color chlorophyll-a, scatterometer sea winds, and moored buoy calibration.", table_cell)
        ],
    ]

    t_tech = Table(tech_data, colWidths=[90, 194, 220])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 14))

    # ================= 3. COMPLETE FEATURE-BY-FEATURE EXPLANATION =================
    story.append(Paragraph("3. Exhaustive Feature & Module Catalog", h1_style))
    story.append(Paragraph(
        "ORCA provides 16 specialized modules divided into 4 primary operational suites:",
        body_style
    ))

    features = [
        ("Unified GIS Marine Map", "Interactive multi-layer maritime map plotting real-time vessel positions, PFZ hotspots, oil spill slicks, submerged debris, coastal boundary corridors, and sea-surface weather isolines.", "Leaflet, OpenStreetMap, GeoJSON rendering, Canvas"),
        ("PFZ Recommendations (Fisheries)", "Identifies high-yield pelagic zones by correlating Sea Surface Temperature (SST) thermal fronts with chlorophyll-a blooms. Displays target species (Mackerel, Pomfret, Tuna), depth, and direct route planning.", "Oceansat-3 OCM-3, INSAT-3D Thermal IR, SQLite, Math Algorithms"),
        ("Marine Safety Score Index", "Provides composite 0-10 safety scoring broken down into Sea State (waves), Wind/Gale warnings, and Active Hazard Proximity. Issues clear operational GO / CAUTION / NO-GO statuses.", "Real-time Buoy In-situ telemetry, Wave Height Threshold Models"),
        ("Hazard Alert & Early Warning", "Real-time alerting console tracking high-risk maritime emergencies including cyclones, toxic algal blooms, active oil slicks, and foreign vessel boundary breaches.", "WebSocket event emission, Priority Queue, Sound Alert hooks"),
        ("Safe Route Optimizer", "Automated corridor navigation engine that computes shortest path between ports and fishing zones while applying hydrodynamic deflection buffers around known hazards (spills, debris, blooms).", "Euclidean & Haversine hazard-deflection waypoints, Node.js API"),
        ("Oil Spill & SAR Workspace", "Calculates slick expansion perimeters, oil volume in cubic meters, drift trajectories based on current vectors, and suggests containment boom strategies and skimmer deployments.", "Hydrodynamic drift modeling, Satellite SAR imagery simulation"),
        ("Sonar Debris & Submerged Hazards", "Tracks subsurface navigational hazards, discarded ghost fishing gear, underwater wrecks, and bathymetric pinnacles with sonar frequency and depth categorization.", "High-frequency acoustic anomaly logs, SQLite relational store"),
        ("AIS Fleet Tracking & Correlation", "Real-time Automatic Identification System monitoring of commercial, fishing, and patrol vessels. Displays MMSI, speed over ground (SOG), heading, draft, and track history.", "AIS NMEA decode engine, WebSocket live broadcast"),
        ("Fish Habitat & Biodiversity Mapping", "Visualizes marine protected areas (MPAs), coral reefs, sea-turtle nesting grounds, and mangrove nurseries with strict fishing restriction alerts.", "Ecological GIS layers, Buffer proximity queries"),
        ("Smart Geofencing & Boundary Monitor", "Monitors International Maritime Boundary Lines (IMBL / EEZ). Triggers audio-visual boundary proximity warnings when craft approach territorial limits.", "Ray-casting point-in-polygon algorithm, Geo-coordinate boundary sets"),
        ("Marine AI Copilot (Chatbot)", "Conversational AI assistant backed by Meta LLaMA 3.3 70B (Groq) with real-time RAG context injection from local ocean telemetry and multilingual translation.", "Groq Cloud API, RAG prompt engineering, Stream filtering"),
        ("ORCA Multi-Agent Reasoning Swarm", "4 autonomous specialized agents (Orchestrator, Geospatial, Physics, Bio-Ecology) working in a consensus loop to resolve conflicting marine signals for ISRO Challenge 26176.", "Multi-Agent state machine, conflict-resolution consensus engine"),
        ("Explainable AI (XAI) Audit Ledger", "Inspectable reasoning traces detailing satellite inputs, confidence percentages, buoy calibration deltas, and multi-agent deliberation transcripts.", "XAI Transparency framework, Structured JSON schema audit logs"),
        ("Geotag Observation Logger", "Field logging interface for mariners and researchers to log in-situ observations with GPS coordinates, depth, salinity, fish sightings, and photo attachments.", "HTML5 Geolocation API, SQLite transactional inserts, Form validation"),
        ("Operational PDF/CSV Reports", "One-click generation and download of compliance reports, voyage safety certifications, patrol logs, and fleet catch summaries.", "Client-side PDF/CSV generation, Formatted printable exports"),
        ("Offline Resilience & Edge Sync", "Ensures all maps, cached telemetry, and emergency logs remain 100% accessible offshore without internet. Queues field logs and synchronizes when shore connectivity returns.", "LocalStorage, Service Workers, Background Sync queue")
    ]

    feat_table_data = [
        [Paragraph("Feature Module", table_header), Paragraph("Operational Functionality", table_header), Paragraph("Technology Used", table_header)]
    ]

    for title, desc, tech in features:
        feat_table_data.append([
            Paragraph(f"<b>{title}</b>", table_cell),
            Paragraph(desc, table_cell),
            Paragraph(f"<i>{tech}</i>", table_cell)
        ])

    t_feat = Table(feat_table_data, colWidths=[120, 244, 140])
    t_feat.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_feat)
    story.append(Spacer(1, 14))

    # ================= 4. STEP-BY-STEP OPERATOR GUIDELINES =================
    story.append(Paragraph("4. Step-by-Step Operator Guide (How to Use ORCA)", h1_style))
    story.append(Paragraph(
        "Follow these workflows to operate the ORCA platform during pre-voyage briefing, underway navigation, and post-mission reporting:",
        body_style
    ))

    story.append(Paragraph("Step 1: System Boot & Verification", h2_style))
    story.append(Paragraph("• Double-click <code>install.bat</code> (first time only) to install dependencies for both server and UI.", bullet_style))
    story.append(Paragraph("• Double-click <code>start.bat</code> to launch both the Node.js backend (Port 4000) and the React frontend (Port 5173).", bullet_style))
    story.append(Paragraph("• Open your browser to <code>http://localhost:5173</code> to access the ORCA Command Bridge.", bullet_style))

    story.append(Paragraph("Step 2: Pre-Voyage Safety & Weather Check", h2_style))
    story.append(Paragraph("• Navigate to <b>Safety → Safety Score</b>. Review the overall 0-10 index. If the index is below 5.0 (NO-GO), delay departure.", bullet_style))
    story.append(Paragraph("• Check <b>Safety → Hazard Alerts</b> for active high-risk alerts such as cyclone warnings or toxic algal blooms.", bullet_style))

    story.append(Paragraph("Step 3: Potential Fishing Zone (PFZ) Selection & Route Planning", h2_style))
    story.append(Paragraph("• Go to <b>Discover → PFZ Fisheries</b>. Review target species, estimated catch yield percentage, and SST front data.", bullet_style))
    story.append(Paragraph("• Click <b>'Plan Safe Route'</b> on the desired zone (e.g., Gujarat Dwarka Shelf or Visakhapatnam Outer Corridor).", bullet_style))
    story.append(Paragraph("• The system automatically shifts to <b>Fleet → Safe Routes</b>, calculating the optimal navigation path that steers clear of active oil spills and debris.", bullet_style))

    story.append(Paragraph("Step 4: Underway Fleet & Boundary Monitoring", h2_style))
    story.append(Paragraph("• Open <b>Discover → Unified GIS Map</b> to track your vessel live alongside maritime corridors and marine sanctuaries.", bullet_style))
    story.append(Paragraph("• In <b>Fleet → Geofencing</b>, ensure proximity alerts are active so the audible siren triggers if your vessel approaches international boundary lines.", bullet_style))

    story.append(Paragraph("Step 5: Logging In-Situ Geotagged Observations", h2_style))
    story.append(Paragraph("• Click the <b>'+ Geotag Observation'</b> button in the top navigation bar at any time.", bullet_style))
    story.append(Paragraph("• Select observation type (Fish Catch, Oil Spill, Debris, Animal Sighting, Marine Hazard).", bullet_style))
    story.append(Paragraph("• Fill in title and detailed notes (e.g., fish school depth, water color, net condition).", bullet_style))
    story.append(Paragraph("• Submit observation. It instantly syncs to the central database and appears on all operational maps.", bullet_style))

    story.append(Paragraph("Step 6: Post-Mission Auditing & Operational Reports", h2_style))
    story.append(Paragraph("• Go to <b>AI Insights → Ops Reports</b>.", bullet_style))
    story.append(Paragraph("• Select your report timeframe and click <b>'Export PDF Report'</b> or <b>'Export CSV Data'</b> to generate official logs for port authorities or research teams.", bullet_style))

    story.append(Spacer(1, 14))

    # ================= 5. ISRO MULTI-AGENT SWARM SPECIFICATION =================
    story.append(Paragraph("5. ISRO Challenge 26176: Multi-Agent Deliberation Engine", h1_style))
    story.append(Paragraph(
        "ORCA's flagship algorithmic innovation is its 4-agent collaborative consensus loop implemented in <code>server/src/orcaEngine.js</code>:",
        body_style
    ))

    agent_data = [
        [Paragraph("Agent Name", table_header), Paragraph("Satellite / Sensor Inputs", table_header), Paragraph("Decision Domain", table_header)],
        [
            Paragraph("<b>🧠 Orchestrator Agent</b>", table_cell),
            Paragraph("User Query, Sector Bounds", table_cell),
            Paragraph("Dispatches queries, manages state, coordinates consensus between domain specialists.", table_cell)
        ],
        [
            Paragraph("<b>🛰️ Geospatial Expert</b>", table_cell),
            Paragraph("INSAT-3D Thermal IR, Oceansat-3 SSTM", table_cell),
            Paragraph("Pinpoints thermal fronts ($>1.2^{\circ}C/\text{deg}$ gradient) where nutrient upwelling concentrates pelagic fish.", table_cell)
        ],
        [
            Paragraph("<b>🌊 Physics Expert</b>", table_cell),
            Paragraph("SCATSAT-1, Oceansat Altimeter, Buoys", table_cell),
            Paragraph("Validates wave heights ($<1.5\text{ m}$ safety envelope) and computes drift current vectors ($m/s$).", table_cell)
        ],
        [
            Paragraph("<b>🐟 Bio-Ecological Expert</b>", table_cell),
            Paragraph("Oceansat-3 OCM-3 Ocean Color Monitor", table_cell),
            Paragraph("Calculates chlorophyll-a concentration ($mg/m^3$) and flags harmful dinoflagellate algal blooms (HABs).", table_cell)
        ],
    ]

    t_agent = Table(agent_data, colWidths=[130, 164, 210])
    t_agent.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_agent)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "<b>The Consensus Loop in Action:</b> When Agent 3 (Bio) flags a toxic algal bloom 10 km north of an optimal fishing zone, "
        "the Orchestrator queries Agent 2 (Physics) to compute hydrodynamic current drift vectors. Agent 2 demonstrates that the "
        "current ($0.3\text{ m/s NE}$) is moving the bloom away from the fishing zone. The Swarm reaches consensus that the zone is "
        "safe to harvest and broadcasts the advisory in regional coastal dialects.",
        body_style
    ))

    story.append(Spacer(1, 14))

    # ================= 6. SUMMARY & CONCLUSION =================
    story.append(Paragraph("6. Summary & Readiness", h1_style))
    story.append(Paragraph(
        "ORCA delivers a complete, self-contained, enterprise-grade marine ecosystem intelligence platform. "
        "With full Git source control at <b>github.com/kalya-22/ORCA</b>, modular components, integrated SQLite storage, "
        "offline edge resilience, and ISRO-compliant multi-agent cognitive architecture, ORCA stands ready for operational deployment, "
        "academic evaluation, and live demonstration.",
        body_style
    ))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {filename}")

if __name__ == "__main__":
    out_path = os.path.abspath("ORCA_Project_Comprehensive_Guide.pdf")
    build_pdf(out_path)
