import React from 'react';
import { useApi } from '../../hooks/useApi';
import { Card } from '../UI/Card';
import { DataSourceTag } from '../UI/DataSourceTag';
import { COLORS, changeColor } from '../../theme/tokens';
import { DataSourceFilterValue, matchesDataSourceFilter } from '../../utils/dataSource';

interface ExchangeFlow {
  exchange: string;
  value_musd: number;
}

interface ExchangeFlowsCardProps {
  filter?: DataSourceFilterValue;
}

export const ExchangeFlowsCard: React.FC<ExchangeFlowsCardProps> = ({ filter = 'all' }) => {
  const { data, source } = useApi<ExchangeFlow[]>('/api/smart-money/exchange-flows');
  const maxAbs = data ? Math.max(...data.map((f) => Math.abs(f.value_musd))) : 1;

  if (!matchesDataSourceFilter(source, filter)) return null;

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 16 }}>
          Exchange in/outflow
        </div>
        <DataSourceTag source={source} />
      </div>
      {data?.map((f) => {
        const color = changeColor(f.value_musd);
        const width = `${Math.min(100, (Math.abs(f.value_musd) / maxAbs) * 100)}%`;
        return (
          <div key={f.exchange} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              <span>{f.exchange}</span>
              <span style={{ color, fontFamily: "'Manrope', sans-serif" }}>
                {(f.value_musd >= 0 ? '+$' : '-$') + Math.abs(f.value_musd) + 'M'}
              </span>
            </div>
            <div style={{ height: 6, background: COLORS.pillMutedBg, borderRadius: 99 }}>
              <div style={{ height: '100%', width, background: color, borderRadius: 99 }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
};
