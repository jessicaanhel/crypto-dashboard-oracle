import React from 'react';
import { useLocation } from 'react-router-dom';
import { useOracle } from '../../context/OracleContext';
import { COLORS, RADIUS } from '../../theme/tokens';
import { OracleAvatar } from './OracleAvatar';
import { OracleChat } from './OracleChat';

// Floating Oracle in the corner of every page; opens a small chat panel
export const OracleWidget: React.FC = () => {
  const { widgetOpen, setWidgetOpen, streaming } = useOracle();
  const { pathname } = useLocation();

  // The Oracle page already shows the full chat
  if (pathname === '/oracle') return null;

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000 }}>
      {widgetOpen && (
        <div
          role="dialog"
          aria-label="Chat with the Market Oracle"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 80,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.card,
            boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <OracleAvatar size={36} talking={streaming} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Market Oracle</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                {streaming ? 'typing…' : 'Crypto assistant'}
              </div>
            </div>
            <button
              onClick={() => setWidgetOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.textSecondary,
                fontSize: 20,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <OracleChat compact />
          </div>
        </div>
      )}

      <button
        onClick={() => setWidgetOpen(!widgetOpen)}
        aria-label={widgetOpen ? 'Close the Oracle' : 'Ask the Oracle'}
        title="Ask the Oracle"
        style={{
          padding: 0,
          border: `2px solid ${COLORS.surface}`,
          borderRadius: '50%',
          background: COLORS.surface,
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          cursor: 'pointer',
        }}
      >
        <OracleAvatar size={60} talking={streaming} />
      </button>
    </div>
  );
};
