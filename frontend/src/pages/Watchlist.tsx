import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiFetch } from '../utils/api';
import { Card } from '../components/UI/Card';
import { Pill } from '../components/UI/Pill';
import { DataSourceTag } from '../components/UI/DataSourceTag';
import { COLORS } from '../theme/tokens';

interface Alert {
  id: number;
  asset: string;
  condition: string;
  armed: boolean;
}

export const Watchlist: React.FC = () => {
  const { data, source } = useApi<Alert[]>('/api/watchlist');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (data) setAlerts(data);
  }, [data]);

  const toggleAlert = async (id: number) => {
    const res = await apiFetch(`/api/watchlist/${id}/toggle`, { method: 'POST' });
    if (!res.ok) return;
    const updated: Alert = await res.json();
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  return (
    <Card style={{ maxWidth: 680 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Alerts
          <DataSourceTag source={source} />
        </div>
        <button
          style={{
            background: COLORS.accent,
            color: COLORS.background,
            border: 'none',
            borderRadius: 12,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          + New alert
        </button>
      </div>
      {alerts.map((a) => (
        <div
          key={a.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 0',
            borderBottom: `1px solid ${COLORS.borderSubtle}`,
          }}
        >
          <Pill
            background={COLORS.pillMutedBg}
            color={COLORS.pillMutedText}
            style={{ width: 52, textAlign: 'center' }}
          >
            {a.asset}
          </Pill>
          <div style={{ flex: 1 }}>{a.condition}</div>
          <Pill
            background={a.armed ? 'rgba(52,209,161,0.16)' : COLORS.pillMutedBg}
            color={a.armed ? COLORS.positive : COLORS.textLabel}
          >
            {a.armed ? 'Armed' : 'Paused'}
          </Pill>
          <button
            onClick={() => toggleAlert(a.id)}
            style={{
              background: COLORS.pillMutedBg,
              color: COLORS.textPrimary,
              border: `1px solid ${COLORS.inputBorder}`,
              borderRadius: 10,
              padding: '7px 14px',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            {a.armed ? 'Pause' : 'Arm'}
          </button>
        </div>
      ))}
    </Card>
  );
};

export default Watchlist;
