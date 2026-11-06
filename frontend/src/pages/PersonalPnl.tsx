import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Card } from '../components/UI/Card';
import { DataSourceTag } from '../components/UI/DataSourceTag';
import { COLORS, RADIUS, changeColor } from '../theme/tokens';
import { formatSignedUsd } from '../utils/format';

interface Platform {
  name: string;
  type: string;
  balance_label: string;
  pnl_24h: number;
  pnl_30d: number;
}

interface PersonalPnlResponse {
  platforms: Platform[];
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: COLORS.background,
  border: `1px solid ${COLORS.inputBorder}`,
  borderRadius: RADIUS.input,
  padding: '11px 14px',
  color: COLORS.textPrimary,
  fontSize: 14,
};

const primaryButtonStyle: React.CSSProperties = {
  background: COLORS.accent,
  color: COLORS.background,
  border: 'none',
  borderRadius: RADIUS.input,
  padding: '12px 18px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  width: '100%',
  fontFamily: "'Manrope', sans-serif",
};

export const PersonalPnl: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  const { data, source } = useApi<PersonalPnlResponse>('/api/personal-pnl', { enabled: loggedIn });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 2) {
      setLoginError('');
      setLoggedIn(true);
    } else {
      setLoginError('Enter a valid email to continue.');
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 20,
            padding: 32,
            width: 340,
          }}
        >
          <div
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 6,
            }}
          >
            Sign in to view Personal PnL
          </div>
          <div style={{ fontSize: 13, color: COLORS.textLabel, marginBottom: 20 }}>
            Your cross-platform PnL is private — verify to continue.
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: 'block', fontSize: 12, color: COLORS.textLabel, marginBottom: 6 }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          {loginError && (
            <div style={{ fontSize: 12, color: COLORS.negative, marginBottom: 12 }}>
              {loginError}
            </div>
          )}
          <button type="submit" style={primaryButtonStyle}>
            Continue
          </button>
        </form>
      </div>
    );
  }

  const platforms = data?.platforms ?? [];
  const totalPnl30d = platforms.reduce((sum, p) => sum + p.pnl_30d, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button
          onClick={() => {
            setLoggedIn(false);
            setEmail('');
          }}
          style={{
            background: 'transparent',
            color: '#8fa8ff',
            border: 'none',
            borderRadius: 10,
            padding: '7px 4px',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          Log out
        </button>
      </div>

      <Card style={{ marginBottom: 20, maxWidth: 340, padding: 22 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 12, color: COLORS.textLabel }}>
            Total PnL — 30D, all platforms
          </div>
          <DataSourceTag source={source} />
        </div>
        <div
          style={{
            fontSize: 32,
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            color: changeColor(totalPnl30d),
          }}
        >
          {formatSignedUsd(totalPnl30d)}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {platforms.map((p) => (
          <Card key={p.name} style={{ padding: 18 }}>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 16 }}>
              {p.name}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>{p.type}</div>
            <div style={{ fontSize: 20, fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}>
              {p.balance_label}
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: 12 }}>
              <div>
                24h{' '}
                <span
                  style={{ color: changeColor(p.pnl_24h), fontFamily: "'Manrope', sans-serif" }}
                >
                  {formatSignedUsd(p.pnl_24h)}
                </span>
              </div>
              <div>
                30d{' '}
                <span
                  style={{ color: changeColor(p.pnl_30d), fontFamily: "'Manrope', sans-serif" }}
                >
                  {formatSignedUsd(p.pnl_30d)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PersonalPnl;
