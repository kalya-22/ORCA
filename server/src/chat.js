import { db } from './db.js';
import { runOrcaPipeline } from './orcaEngine.js';

// Real AI chat via ORCA Multi-Agent Pipeline (ISRO Challenge 26176) with Groq integration.
export async function handleChat(query) {
  const qLower = (query || '').toLowerCase();
  
  // Check if query is targeting PFZ, Gujarat, Dwarka, fishing zones, or marine biology
  const isOrcaQuery = qLower.includes('gujarat') || 
                      qLower.includes('dwarka') || 
                      qLower.includes('fishing') || 
                      qLower.includes('pfz') || 
                      qLower.includes('fish') || 
                      qLower.includes('algal') || 
                      qLower.includes('bloom') || 
                      qLower.includes('thermal front');

  if (isOrcaQuery) {
    const sectorId = qLower.includes('visakhapatnam') ? 'bob_visakhapatnam' 
                   : qLower.includes('kochi') || qLower.includes('malabar') ? 'as_kochi'
                   : qLower.includes('mannar') ? 'gulf_mannar'
                   : 'gujarat_dwarka';

    const orcaRes = runOrcaPipeline(sectorId, query);
    const ans = orcaRes.final_actionable_answer;
    const cr = orcaRes.conflict_resolution;
    const bCast = orcaRes.advisory.fisherman_broadcast.te_ta_hi_gu;

    const formattedReply = [
      `[ORCA Multi-Agent Swarm] ${ans.headline}`,
      `📍 Location: ${ans.location}`,
      `🔍 Ecological Reason: ${ans.why}`,
      `🌊 Dynamics & Safety: ${ans.safety_status}`,
      `🔄 Consensus & Conflict Resolution: ${cr.the_solution}`,
      `🐟 Species: ${ans.target_species}`,
      `📻 Regional Broadcast: "${bCast}"`
    ].join('\n\n');

    return { source: 'orca_multi_agent', reply: formattedReply };
  }

  if (!process.env.GROQ_API_KEY) {
    return { 
      source: 'fallback', 
      reply: `[BlueCurrent Swarm Engine] Request analyzed: "${query}". Live conditions show wave height ~1.8m, wind ~24 km/h → MODERATE CAUTION. For deep ISRO fishing zone reasoning, ask: "Identify a high-yield, safe Potential Fishing Zone (PFZ) near the coast of Gujarat".` 
    };
  }

  // Pull a compact live context snapshot so the model answers from real data.
  const weather = db.prepare('SELECT condition, wave_height_m, wind_speed_kmh FROM weather LIMIT 4').all();
  const alerts = db.prepare('SELECT level, title FROM alerts ORDER BY created_at DESC LIMIT 5').all();
  const pfz = db.prepare('SELECT name, yield_pct FROM pfz_zones ORDER BY yield_pct DESC LIMIT 4').all();

  const system = [
    'You are BlueCurrent, an ocean safety and marine intelligence assistant.',
    'Answer concisely (2-4 sentences). Be specific and safety-focused.',
    'Use this live data context and reference it where relevant:',
    `Weather: ${JSON.stringify(weather)}`,
    `Active alerts: ${JSON.stringify(alerts)}`,
    `Best fishing zones: ${JSON.stringify(pfz)}`,
  ].join('\n');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: query },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[chat] Groq error:', res.status, data.error?.message || JSON.stringify(data));
      return { source: 'error', reply: 'BlueCurrent is temporarily offline. Please try again shortly.' };
    }

    let reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { source: 'error', reply: 'BlueCurrent received an empty response. Please try again.' };
    }
    // Strip <think>...</think> blocks (Qwen models include reasoning traces)
    // Handle both complete and incomplete/missing closing tags
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (reply.startsWith('<think>')) {
      // Closing tag missing — strip everything from <think> onward
      reply = reply.replace(/<think>[\s\S]*/i, '').trim();
    }
    return { source: 'groq', reply };
  } catch (err) {
    console.error('[chat] Groq error:', err.message);
    return { source: 'error', reply: 'BlueCurrent is temporarily offline. Please try again shortly.' };
  }
}
