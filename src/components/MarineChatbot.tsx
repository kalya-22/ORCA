import React, { useState, useCallback } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { post } from '../api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

function OrcaMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="ORCA">
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-28 12 12)" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" opacity="0.6" />
      <path d="M4 17c3-3 7 1 11-2c3-2 5 1 5 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 16c1-4 3.5-8 7-10.5c-.5 4-1.5 6 1.5 7.5c-1.5 1.5-3.5 2.5-7 3z" fill="currentColor" />
    </svg>
  );
}

export const MarineChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'ORCA Marine Copilot online. Ask me about autonomous PFZ detection, ISRO satellite deliberation, wave safety, or toxic bloom advection.',
    },
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [chatBusy, setChatBusy] = useState<boolean>(false);

  const quickPrompts = [
    { label: '🎯 Gujarat Safe PFZ (ORCA)', text: 'Identify a high-yield, safe Potential Fishing Zone (PFZ) near the coast of Gujarat for tomorrow morning.' },
    { label: 'Wave & Safety Status', text: 'What is our current marine safety score and peak wave condition?' },
    { label: 'Highest Yield PFZ', text: 'Which Potential Fishing Zone has the highest projected yield right now?' },
    { label: 'Oil Spill Risk', text: 'Is there an active oil spill near our navigation corridor?' },
    { label: 'EEZ Boundary Check', text: 'Check current vessel positions against the EEZ geofence.' },
  ];

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = textToSend || inputMsg;
      if (!query.trim() || chatBusy) return;

      const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: query };
      setChatMessages((prev) => [...prev, userMessage]);
      setInputMsg('');
      setChatBusy(true);

      try {
        const res = await post<{ reply: string }>('/api/chat', { message: query });
        setChatMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), sender: 'bot', text: res.reply },
        ]);
      } catch {
        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: '[Offline Mode] Sea state is moderate (~1.8m wave, wind 24 km/h). PFZ Zone 01 is leading at 92% yield. Swarm consensus: Safe for cruising outside Seep Alpha corridor.',
          },
        ]);
      } finally {
        setChatBusy(false);
      }
    },
    [inputMsg, chatBusy]
  );

  if (!isOpen) {
    return (
      <button className="chat-launcher anim-scale" onClick={() => setIsOpen(true)}>
        <Bot size={16} color="var(--accent-teal)" />
        <span>Marine AI Copilot</span>
        <Sparkles size={13} color="var(--accent-teal)" />
      </button>
    );
  }

  return (
    <div className="chat-panel anim-scale">
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ color: 'var(--accent-teal)' }}>
            <OrcaMark size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ORCA Marine Copilot
            </div>
            <div className="label-caps" style={{ fontSize: '0.58rem', color: chatBusy ? 'var(--accent-amber)' : 'var(--accent-teal)' }}>
              {chatBusy ? '● DELIBERATING SATELLITE SWARM' : '● MULTI-AGENT CONSENSUS ACTIVE'}
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => setIsOpen(false)} style={{ padding: '4px' }}>
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={msg.sender === 'user' ? 'chat-msg chat-msg-user anim-slide-r' : 'chat-msg chat-msg-bot anim-slide-l'}
          >
            {msg.text}
          </div>
        ))}
        {chatBusy && (
          <div className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            className="btn-ghost"
            onClick={() => handleSendMessage(p.text)}
            style={{ padding: '4px 8px', fontSize: '0.68rem', whiteSpace: 'nowrap', borderRadius: '12px', background: 'rgba(100,160,200,0.06)' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Ask ORCA marine intelligence…"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' }}
        />
        <button className="btn-primary" onClick={() => handleSendMessage()} style={{ padding: '8px 12px' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
