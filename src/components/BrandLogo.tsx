import React from 'react';

interface BrandLogoProps {
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '2px 0',
      }}
    >
      {/* Sleek Geometric ORCA Emblem SVG */}
      <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 2px 8px rgba(14, 165, 233, 0.4))' }}
        >
          <defs>
            <linearGradient id="orcaGrad1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="orcaGrad2" x1="0" y1="24" x2="48" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="finGrad" x1="16" y1="10" x2="36" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Satellite Orbit Telemetry Ring */}
          <ellipse
            cx="24"
            cy="24"
            rx="21"
            ry="9"
            transform="rotate(-28 24 24)"
            stroke="url(#orcaGrad2)"
            strokeWidth="1.75"
            strokeDasharray="4 3"
            opacity="0.85"
          />

          {/* Orbital Satellite Node */}
          <circle cx="40" cy="15" r="2.2" fill="#38bdf8" />
          <circle cx="40" cy="15" r="4.5" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />

          {/* Oceanic Hydrofoil Wave Base */}
          <path
            d="M6 34C12 28 19 36 26 31C33 26 40 33 44 32"
            stroke="url(#orcaGrad1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Stylized Orca Dorsal Fin & Breach Form */}
          <path
            d="M17 33C19 25 24 16 31 11C30 19 28 23 34 26C31 29 27 31 20 33Z"
            fill="url(#finGrad)"
          />

          {/* Internal Aerodynamic Flow Line */}
          <path
            d="M20 31C22 24 25 18 29 14"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Brand Logotype & Tag */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.28rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 75%, #0ea5e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}
          >
            ORCA
          </span>
          <span
            style={{
              fontSize: '0.55rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '4px',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ISRO 26176
          </span>
        </div>
        <span
          style={{
            fontSize: '0.58rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginTop: '2px',
          }}
        >
          Marine Ecosystem Reasoning Swarm
        </span>
      </div>
    </div>
  );
};

