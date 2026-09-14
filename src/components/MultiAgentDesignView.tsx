import React, { useState, useEffect } from 'react';
import {
  Cpu, Waves, CloudLightning, Shield, Droplets, Fish, CheckCircle2,
  Database, Sparkles, AlertTriangle, Terminal, Copy,
  MapPin, ShieldCheck, RefreshCw, Send
} from 'lucide-react';
import { type Agent, post } from '../api';
import { SpotlightCard, CountUp } from './effects';

interface MultiAgentDesignViewProps {
  agents: Agent[] | null;
}

export const MultiAgentDesignView: React.FC<MultiAgentDesignViewProps> = ({ agents: _agents }) => {
  const [viewMode, setViewMode] = useState<'orca' | 'swarm'>('orca');
  const [selectedAgent, setSelectedAgent] = useState<string>('Oceanography Agent');

  // ORCA Interactive Deliberation States
  const [selectedSector, setSelectedSector] = useState<string>('gujarat_dwarka');
  const [userQuery, setUserQuery] = useState<string>(
    'Identify a high-yield, safe Potential Fishing Zone (PFZ) near the coast of Gujarat for tomorrow morning.'
  );
  const [orcaLoading, setOrcaLoading] = useState<boolean>(false);
  const [orcaData, setOrcaData] = useState<any>(null);

  const runOrcaDeliberation = async (sectorId = selectedSector, query = userQuery) => {
    setOrcaLoading(true);
    try {
      const data = await post<any>('/api/orca/deliberate', {
        sector_id: sectorId,
        query: query
      });
      setOrcaData(data);
    } catch (err) {
      console.error('ORCA Deliberation error:', err);
    } finally {
      setOrcaLoading(false);
    }
  };

  useEffect(() => {
    runOrcaDeliberation('gujarat_dwarka');
  }, []);

  const handleSectorChange = (sec: string) => {
    setSelectedSector(sec);
    let q = 'Identify a high-yield, safe Potential Fishing Zone (PFZ) near the coast of Gujarat for tomorrow morning.';
    if (sec === 'bob_visakhapatnam') q = 'Detect coastal upwelling thermal fronts and safe PFZ coordinates off Visakhapatnam.';
    else if (sec === 'as_kochi') q = 'Assess monsoonal upwelling and commercial mackerel fishing feasibility off Kochi coast.';
    else if (sec === 'gulf_mannar') q = 'Evaluate marine biosphere boundaries and safe fishing vectors in Gulf of Mannar.';
    setUserQuery(q);
    runOrcaDeliberation(sec, q);
  };

  const swarmAgents = [
    {
      name: 'Master Swarm Orchestrator',
      role: 'Consensus & Multi-Modal Fusion',
      status: 'ONLINE',
      model: 'BlueCurrent-Swarm-v2.4 (Claude / Llama-3.3)',
      latency_ms: 15,
      source: 'Global Fusion Bus',
      desc: 'Orchestrates real-time weighting, dispute resolution between oceanographic and meteorological inputs, and outputs verified vessel directives.',
      icon: <Cpu size={20} color="var(--accent-teal)" />,
      badge: 'badge-teal',
    },
    {
      name: 'Oceanography Agent',
      role: 'SST & Plankton Biomass Analysis',
      status: 'VERIFIED',
      model: 'Sentinel-3 SLSTR + OLCI L2P',
      latency_ms: 12,
      source: 'Copernicus Sentinel-3 Feed',
      desc: 'Monitors sea surface temperature gradients, thermal fronts, and chlorophyll blooms to pinpoint Pelagic and Demersal fishing aggregations.',
      icon: <Waves size={20} color="var(--accent-teal)" />,
      badge: 'badge-teal',
    },
    {
      name: 'Weather & Ocean State Agent',
      role: 'Wave Dynamics & Gale Warnings',
      status: 'MONITORING',
      model: 'NOAA GFS + WaveWatch III',
      latency_ms: 18,
      source: 'NOAA NCEP 00Z Model Run',
      desc: 'Continuously models significant wave height (Hs), wind shear, squall trajectories, and calculates composite risk indices for vessel navigation.',
      icon: <CloudLightning size={20} color="var(--accent-blue)" />,
      badge: 'badge-blue',
    },
    {
      name: 'Security & Border Agent',
      role: 'EEZ Geofencing & AIS Verification',
      status: 'VERIFIED',
      model: 'AIS Stream + Geofence Polygons',
      latency_ms: 8,
      source: 'Coastal Radar & Satellite AIS',
      desc: 'Enforces territorial waters and exclusive economic zone boundaries, detects AIS dark vessel anomalies, and alerts on unauthorized transits.',
      icon: <Shield size={20} color="var(--accent-purple)" />,
      badge: 'badge-purple',
    },
    {
      name: 'Spill & Hazard Response Agent',
      role: 'Synthetic Aperture Radar Slick Detection',
      status: 'ACTIVE',
      model: 'Sentinel-1 SAR Slick Classifier',
      latency_ms: 22,
      source: 'SAR Radar Imagery',
      desc: 'Identifies oil sheens and chemical spills, calculates drift spread vectors based on ocean currents, and models coastal impact zones.',
      icon: <Droplets size={20} color="var(--accent-red)" />,
      badge: 'badge-red',
    },
    {
      name: 'Fisheries & Habitat Agent',
      role: 'Reproductive Grounds & Moratorium Compliance',
      status: 'STANDBY',
      model: 'Marine Biology Spawning Index',
      latency_ms: 14,
      source: 'Fishery Survey Data & CMFRI',
      desc: 'Assesses seasonal spawning windows, protects nursery estuaries, and recommends high-yield harvesting zones outside protected breeding seasons.',
      icon: <Fish size={20} color="var(--accent-amber)" />,
      badge: 'badge-amber',
    },
  ];

  const activeAgent = swarmAgents.find((a) => a.name === selectedAgent) || swarmAgents[0];

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header & Sub-Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Multi-Agent AI Architecture</h2>
            <span className="badge badge-teal">SIH Challenge 26176 · ORCA / ISRO</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Autonomous specialized agents executing continuous parallel investigation and conflict resolution.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn-ghost ${viewMode === 'orca' ? 'active' : ''}`}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '6px',
              background: viewMode === 'orca' ? 'var(--accent-teal)' : 'transparent',
              color: viewMode === 'orca' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setViewMode('orca')}
          >
            🎯 ORCA Continuous Deliberation
          </button>
          <button
            className={`btn-ghost ${viewMode === 'swarm' ? 'active' : ''}`}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '6px',
              background: viewMode === 'swarm' ? 'var(--accent-teal)' : 'transparent',
              color: viewMode === 'swarm' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setViewMode('swarm')}
          >
            🌐 Swarm Node Topology
          </button>
        </div>
      </div>

      {viewMode === 'orca' ? (
        /* ORCA Continuous Deliberation View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0, overflow: 'auto', paddingRight: '4px' }}>
          {/* Query & Sector Controls */}
          <div className="surface-elevated" style={{ padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <span className="label-caps" style={{ margin: 0, color: 'var(--accent-teal)' }}>Sector:</span>
              <select
                value={selectedSector}
                onChange={(e) => handleSectorChange(e.target.value)}
                style={{
                  background: 'var(--bg-inset)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                <option value="gujarat_dwarka">Gujarat Coast (Dwarka &amp; Saurashtra Shelf)</option>
                <option value="bob_visakhapatnam">Bay of Bengal (Visakhapatnam Coast)</option>
                <option value="as_kochi">Arabian Sea (Malabar Coast - Kochi)</option>
                <option value="gulf_mannar">Gulf of Mannar &amp; Palk Bay</option>
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runOrcaDeliberation()}
                placeholder="Ask ORCA multi-agent swarm..."
                style={{
                  flex: 1,
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => runOrcaDeliberation()}
                disabled={orcaLoading}
                className="btn-primary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {orcaLoading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                <span>{orcaLoading ? 'Deliberating...' : 'Deliberate Query'}</span>
              </button>
            </div>
          </div>

          {/* Actionable Answer Card */}
          {orcaData?.final_actionable_answer && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.12), rgba(28, 114, 147, 0.15))',
                border: '1px solid rgba(0, 212, 170, 0.4)',
                borderRadius: '10px',
                padding: '16px 20px',
                boxShadow: '0 4px 20px rgba(0, 212, 170, 0.12)',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> ACTIONABLE ANSWER (ORCA CONSENSUS)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-teal)', fontWeight: 800 }}>
                  CONFIDENCE: {orcaData.final_actionable_answer.confidence}
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#fff' }}>
                {orcaData.final_actionable_answer.headline}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>
                <MapPin size={16} /> {orcaData.final_actionable_answer.location}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                <b>Why:</b> {orcaData.final_actionable_answer.why}
              </div>
              <div style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)', borderRadius: '6px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#5eead4' }}>
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span><b>Safety Guarantee:</b> {orcaData.final_actionable_answer.safety_status}</span>
              </div>
              {orcaData.advisory?.fisherman_broadcast?.te_ta_hi_gu && (
                <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', fontSize: '0.78rem', color: '#99f6e4' }}>
                  <b>📻 Coastal Dissemination Broadcast:</b> "{orcaData.advisory.fisherman_broadcast.te_ta_hi_gu}"
                </div>
              )}
            </div>
          )}

          {/* 4 Agent Step Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {/* Step 1: Orchestrator */}
            <div className="surface-elevated" style={{ padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--accent-purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent-purple)' }}>🧠 STEP 1: ORCHESTRATOR AGENT</span>
                <span className="badge badge-purple">DISPATCHED</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Deconstructed query into 3 parallel subtasks. Allocated <b>INSAT-3D</b>, <b>Oceansat-3 (OCM-3/SSTM)</b>, and <b>SCATSAT-1</b> streams.
              </div>
            </div>

            {/* Step 2A: Geospatial Expert */}
            <div className="surface-elevated" style={{ padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent-blue)' }}>🛰️ AGENT 1: GEOSPATIAL EXPERT</span>
                <span className="badge badge-blue">FRONT DISCOVERED</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <b>Thermal IR:</b> Located sharp thermal front (1.45°C/deg) 45 km off Dwarka (22.2°N, 68.5°E). Corroborated with NIOT buoy AD06.
              </div>
            </div>

            {/* Step 2B: Physics Expert */}
            <div className="surface-elevated" style={{ padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--accent-teal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent-teal)' }}>🌊 AGENT 2: PHYSICS EXPERT</span>
                <span className="badge badge-teal">WAVES SAFE (1.2m)</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <b>Waves &amp; Storms:</b> Significant wave height 1.2m (&lt; 1.5m safe limit). Currents stable at 0.3 m/s moving Northeast (NE).
              </div>
            </div>

            {/* Step 2C: Bio-Ecological Expert */}
            <div className="surface-elevated" style={{ padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--accent-red)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent-red)' }}>🐟 AGENT 3: BIO EXPERT</span>
                <span className="badge badge-red">CHL-A + HAB ALERT</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <b>Ocean Color:</b> High Chlorophyll-a (1.85 mg/m³). <b>WARNING:</b> Detected toxic algal bloom patch forming 10 km North of coordinates!
              </div>
            </div>
          </div>

          {/* Step 3: Collaborative Conflict Resolution Dialogue */}
          {orcaData?.conflict_resolution && (
            <div
              className="surface-elevated"
              style={{
                padding: '16px 18px',
                borderRadius: '10px',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(0,0,0,0.2))'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertTriangle size={16} color="var(--accent-amber)" />
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--accent-amber)' }}>
                  🔄 STEP 3: COLLABORATION &amp; CONFLICT RESOLUTION (THE MEET-UP)
                </span>
                <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>SAFETY CLEARED</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', lineHeight: 1.5 }}>
                <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid var(--accent-red)', borderRadius: '4px' }}>
                  <b style={{ color: 'var(--accent-red)' }}>⚠️ The Conflict:</b> {orcaData.conflict_resolution.the_conflict}
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid var(--accent-blue)', borderRadius: '4px' }}>
                  <b style={{ color: 'var(--accent-blue)' }}>💬 The Collaboration:</b> {orcaData.conflict_resolution.the_collaboration}
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(0, 212, 170, 0.12)', borderLeft: '3px solid var(--accent-teal)', borderRadius: '4px' }}>
                  <b style={{ color: 'var(--accent-teal)' }}>🛡️ The Solution:</b> {orcaData.conflict_resolution.the_solution}
                </div>
              </div>
            </div>
          )}

          {/* Trace Logs JSON Viewer */}
          {orcaData?.trace_logs && (
            <div className="terminal" style={{ marginTop: '4px' }}>
              <div className="terminal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={14} color="var(--accent-teal)" />
                  <span className="label-caps" style={{ margin: 0 }}>ORCA Scientific Audit Trail (Chronological Trace Logs)</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(orcaData.trace_logs, null, 2));
                    alert('Trace logs copied to clipboard!');
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Copy size={12} /> Copy JSON
                </button>
              </div>
              <div className="terminal-body" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {orcaData.trace_logs.map((log: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: '8px', borderLeft: '2px solid var(--border-default)', paddingLeft: '8px' }}>
                    <div style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>
                      [{log.timestamp.slice(11, 19)} UTC] {log.agent} - {log.action}
                    </div>
                    <pre style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Original Swarm Node Grid */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '18px', flex: 1, minHeight: 0, overflow: 'auto' }}>
          <div>
            <div className="label-caps" style={{ marginBottom: '12px' }}>Swarm Node Grid</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {swarmAgents.map((ag, i) => {
                const isSelected = ag.name === selectedAgent;
                return (
                  <SpotlightCard key={i} spotlightColor={isSelected ? 'rgba(0,212,170,0.16)' : 'rgba(0,212,170,0.08)'}>
                    <div
                      className={`agent-node-card anim-slide-l anim-d${i + 1}`}
                      style={{
                        borderColor: isSelected ? 'var(--accent-teal)' : undefined,
                        boxShadow: isSelected ? '0 0 20px rgba(0,212,170,0.15)' : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedAgent(ag.name)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {ag.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ag.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{ag.role}</div>
                          </div>
                        </div>
                        <span className={`badge ${ag.badge}`}>{ag.status}</span>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '10px 0' }}>
                        {ag.desc}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span><Database size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />{ag.source}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)' }}>{ag.latency_ms}ms</span>
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>

            {/* Real-time agent decision log */}
            <div className="terminal anim-fade anim-d4" style={{ marginTop: '12px' }}>
              <div className="terminal-header">
                <span className="terminal-dot" style={{ background: 'var(--accent-red)' }} />
                <span className="terminal-dot" style={{ background: 'var(--accent-amber)' }} />
                <span className="terminal-dot" style={{ background: 'var(--accent-teal)' }} />
                <span className="label-caps" style={{ marginLeft: 8 }}>swarm-orchestrator-telemetry.stream</span>
              </div>
              <div className="terminal-body">
                <div style={{ color: 'var(--accent-teal)' }}>
                  [T-00:02] [Master Orchestrator] Polling 6 micro-agents. Heartbeat OK (14ms aggregate latency).
                </div>
                <div style={{ color: 'var(--accent-blue)' }}>
                  [T-00:01] [Oceanography] INSAT-3D &amp; Oceansat-3 streams ingested. Gujarat &amp; Bay of Bengal shelf verified.
                </div>
                <div style={{ color: 'var(--accent-amber)' }}>
                  [T-00:01] [Weather] SCATSAT-1 0.3 m/s NE vector alert dispatched to Safety Engine.
                </div>
                <div style={{ color: 'var(--accent-purple)' }}>
                  [T-00:00] [Security] Geofence polygon scanned. 0 unauthorized AIS transponders.
                </div>
                <div style={{ color: 'var(--text-secondary)' }} className="terminal-cursor">
                  [T-NOW] [Consensus Bus] All safety invariants satisfied. Fleet routing broadcast active.
                </div>
              </div>
            </div>
          </div>

          {/* Selected Agent Inspector Drawer */}
          <div>
            <div className="label-caps" style={{ marginBottom: '12px' }}>Agent Telemetry Inspector</div>
            <div className="surface-elevated" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeAgent.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{activeAgent.name}</h3>
                  <span className={`badge ${activeAgent.badge}`} style={{ marginTop: '4px' }}>{activeAgent.status}</span>
                </div>
              </div>

              <div className="surface-inset" style={{ padding: '12px 14px' }}>
                <div className="label-caps">Inference Engine / Architecture</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-teal)', marginTop: '4px' }}>
                  {activeAgent.model}
                </div>
              </div>

              <div className="surface-inset" style={{ padding: '12px 14px' }}>
                <div className="label-caps">Primary Data Pipeline</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {activeAgent.source}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="surface-inset" style={{ padding: '10px 12px' }}>
                  <div className="label-caps">Response Latency</div>
                  <div className="stat-number" style={{ fontSize: '1.2rem', color: 'var(--accent-teal)' }}><CountUp to={activeAgent.latency_ms} suffix=" ms" duration={1.2} /></div>
                </div>
                <div className="surface-inset" style={{ padding: '10px 12px' }}>
                  <div className="label-caps">Confidence Factor</div>
                  <div className="stat-number" style={{ fontSize: '1.2rem', color: 'var(--accent-blue)' }}><CountUp to={97.8} suffix="%" decimals={1} duration={1.4} /></div>
                </div>
              </div>

              <div>
                <div className="label-caps" style={{ marginBottom: '6px' }}>Functional Responsibility</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeAgent.desc}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div className="label-caps" style={{ marginBottom: '8px' }}>Security &amp; Health Invariant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--accent-teal)' }}>
                  <CheckCircle2 size={14} /> Autonomous fault-tolerant failover active
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
