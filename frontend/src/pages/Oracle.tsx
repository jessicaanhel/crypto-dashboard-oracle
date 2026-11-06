import React from 'react';
import { Card } from '../components/UI/Card';
import { OracleAvatar } from '../components/Oracle/OracleAvatar';
import { OracleChat } from '../components/Oracle/OracleChat';
import { useOracle } from '../context/OracleContext';
import { COLORS } from '../theme/tokens';

export const Oracle: React.FC = () => {
  const { streaming } = useOracle();

  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 20, maxWidth: 1000, alignItems: 'start' }}
    >
      <Card style={{ textAlign: 'center', padding: 28, flex: '1 1 240px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <OracleAvatar size={150} talking={streaming} />
        </div>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 20 }}>
          Market Oracle
        </div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.6 }}>
          The app's crypto assistant. It reads the live market data behind this dashboard, so ask it
          about price moves, flows, futures or any crypto term. It's also in the corner of every
          page.
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 14 }}>
          Runs on Claude. Not financial advice.
        </div>
      </Card>

      <Card style={{ height: 'min(640px, calc(100vh - 160px))', flex: '2 1 380px', minWidth: 0 }}>
        <OracleChat />
      </Card>
    </div>
  );
};

export default Oracle;
