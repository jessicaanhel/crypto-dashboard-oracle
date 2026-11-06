import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Card } from '../components/UI/Card';
import { Pill } from '../components/UI/Pill';
import { DataSourceTag } from '../components/UI/DataSourceTag';
import { DataSourceFilter } from '../components/UI/DataSourceFilter';
import { thStyle, tdStyle } from '../components/UI/table';
import { COLORS, changeColor } from '../theme/tokens';
import { formatPercent } from '../utils/format';
import { DataSource, DataSourceFilterValue, matchesDataSourceFilter } from '../utils/dataSource';

interface CryptoMarket {
  symbol: string;
  name: string;
  price_label: string;
  change_24h_pct: number;
  volume_label: string;
  market_cap_label: string;
  smart_flow_score: number;
  _source: DataSource;
}

const scoreBand = (score: number) => {
  if (score >= 70) return { label: 'Bullish', color: COLORS.positive, bg: 'rgba(52,209,161,0.18)' };
  if (score >= 45) return { label: 'Neutral', color: COLORS.accent, bg: 'rgba(91,127,255,0.18)' };
  return { label: 'Bearish', color: COLORS.negative, bg: 'rgba(255,107,107,0.18)' };
};

export const CryptoMarkets: React.FC = () => {
  const { data } = useApi<CryptoMarket[]>('/api/crypto/markets');
  const [filter, setFilter] = useState<DataSourceFilterValue>('all');
  const visible = data?.filter((c) => matchesDataSourceFilter(c._source, filter));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <DataSourceFilter value={filter} onChange={setFilter} />
      </div>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={thStyle}>Asset</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>24h</th>
              <th style={thStyle}>Volume</th>
              <th style={thStyle}>Market cap</th>
              <th style={thStyle}>Smart flow score</th>
              <th style={thStyle}>Source</th>
            </tr>
          </thead>
          <tbody>
            {visible?.map((c) => {
              const band = scoreBand(c.smart_flow_score);
              return (
                <tr key={c.symbol}>
                  <td style={tdStyle}>
                    <strong>{c.symbol}</strong>{' '}
                    <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{c.name}</span>
                  </td>
                  <td style={tdStyle}>{c.price_label}</td>
                  <td style={tdStyle}>
                    <span style={{ color: changeColor(c.change_24h_pct) }}>
                      {formatPercent(c.change_24h_pct)}
                    </span>
                  </td>
                  <td style={tdStyle}>{c.volume_label}</td>
                  <td style={tdStyle}>{c.market_cap_label}</td>
                  <td style={tdStyle}>
                    <Pill color={band.color} background={band.bg}>
                      {c.smart_flow_score} · {band.label}
                    </Pill>
                  </td>
                  <td style={tdStyle}>
                    <DataSourceTag source={c._source} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default CryptoMarkets;
