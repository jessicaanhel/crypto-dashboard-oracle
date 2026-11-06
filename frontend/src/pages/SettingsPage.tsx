import React from 'react';
import { useApi } from '../hooks/useApi';
import { Card } from '../components/UI/Card';
import { Pill } from '../components/UI/Pill';
import { DataSourceTag } from '../components/UI/DataSourceTag';
import { COLORS } from '../theme/tokens';

interface Connection {
  name: string;
  type: string;
  status: 'connected' | 'not_connected';
}

export const SettingsPage: React.FC = () => {
  const { data, source } = useApi<Connection[]>('/api/settings/connections');

  return (
    <div style={{ maxWidth: 680 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 14,
        }}
      >
        Connected sources
        <DataSourceTag source={source} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {data?.map((c) => {
          const connected = c.status === 'connected';
          return (
            <Card
              key={c.name}
              style={{
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 15 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{c.type}</div>
              </div>
              <Pill
                background={connected ? 'rgba(52,209,161,0.16)' : COLORS.accentSoft}
                color={connected ? COLORS.positive : '#8fa8ff'}
                style={connected ? undefined : { cursor: 'pointer' }}
              >
                {connected ? 'Connected' : 'Connect'}
              </Pill>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsPage;
