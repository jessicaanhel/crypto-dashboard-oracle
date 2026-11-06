import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Card } from '../components/UI/Card';
import { thStyle, tdStyle } from '../components/UI/table';
import CurrencyTable, { CurrencyTableProps } from '../components/Graphs/CurrencyTable';
import { DataSourceTag } from '../components/UI/DataSourceTag';
import { DataSourceFilter } from '../components/UI/DataSourceFilter';
import { changeColor } from '../theme/tokens';
import { formatPercent } from '../utils/format';
import { DataSourceFilterValue, matchesDataSourceFilter } from '../utils/dataSource';

interface FiatPair {
  pair: string;
  rate: string;
  change_24h_pct: number;
}

export const FiatRates: React.FC = () => {
  const { data: pairs, source: pairsSource } = useApi<FiatPair[]>('/api/fiat/pairs');
  const { data: bankRates, source: bankSource } = useApi<CurrencyTableProps['data']>('/refresh');
  const [filter, setFilter] = useState<DataSourceFilterValue>('all');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <DataSourceFilter value={filter} onChange={setFilter} />
      </div>

      {matchesDataSourceFilter(pairsSource, filter) && (
        <Card style={{ maxWidth: 640, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <DataSourceTag source={pairsSource} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={thStyle}>Pair</th>
                <th style={thStyle}>Rate</th>
                <th style={thStyle}>24h</th>
              </tr>
            </thead>
            <tbody>
              {pairs?.map((f) => (
                <tr key={f.pair}>
                  <td style={tdStyle}>{f.pair}</td>
                  <td style={tdStyle}>{f.rate}</td>
                  <td style={tdStyle}>
                    <span style={{ color: changeColor(f.change_24h_pct) }}>
                      {formatPercent(f.change_24h_pct)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {matchesDataSourceFilter(bankSource, filter) && (
        <Card style={{ overflow: 'auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 16 }}>
              Bank exchange rates
            </div>
            <DataSourceTag source={bankSource} />
          </div>
          <CurrencyTable data={bankRates ?? {}} />
        </Card>
      )}
    </div>
  );
};

export default FiatRates;
