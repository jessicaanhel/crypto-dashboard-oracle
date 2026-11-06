import React from 'react';
import { useApi } from '../../hooks/useApi';
import { Card } from '../UI/Card';
import { DataSourceTag } from '../UI/DataSourceTag';
import { COLORS } from '../../theme/tokens';
import { DataSourceFilterValue, matchesDataSourceFilter } from '../../utils/dataSource';

interface BlackRockData {
  btc_value_usd: number;
  eth_value_usd: number;
}

const MAX_BAR_HEIGHT = 96;
const MIN_BAR_HEIGHT = 18;

const formatBillions = (value: number) => `$${(value / 1e9).toFixed(2)}B`;

interface BlackRockHoldingsProps {
  title?: string;
  filter?: DataSourceFilterValue;
}

export const BlackRockHoldings: React.FC<BlackRockHoldingsProps> = ({
  title = 'BlackRock crypto holdings',
  filter = 'all',
}) => {
  const { data, source, loading, error } = useApi<BlackRockData>('/api/blackrock');

  if (!matchesDataSourceFilter(source, filter)) return null;

  const bars = data
    ? [
        { label: 'Bitcoin (IBIT)', value: data.btc_value_usd, color: COLORS.accent },
        { label: 'Ethereum (ETHA)', value: data.eth_value_usd, color: '#3a4050' },
      ]
    : [];
  const maxValue = bars.length ? Math.max(...bars.map((b) => b.value)) : 1;

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 16 }}>
          {title}
        </div>
        <DataSourceTag source={source} />
      </div>

      {loading && <p style={{ color: COLORS.textMuted, fontSize: 13 }}>Loading...</p>}
      {!loading && (error || !data) && (
        <p style={{ color: COLORS.negative, fontSize: 13 }}>{error}</p>
      )}

      {!loading && data && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 8 }}>
          {bars.map((bar) => (
            <div
              key={bar.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flex: 1,
              }}
            >
              <span style={{ fontSize: 11, color: COLORS.textLabel }}>
                {formatBillions(bar.value)}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: 56,
                  height: Math.max(MIN_BAR_HEIGHT, (bar.value / maxValue) * MAX_BAR_HEIGHT),
                  background: bar.color,
                  borderRadius: '10px 10px 0 0',
                }}
              />
              <span style={{ fontSize: 11, color: COLORS.textMuted, textAlign: 'center' }}>
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
