import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { InstitutionFilter, Institution } from '../components/SmartMoney/InstitutionFilter';
import { HoldingsHistoryChart } from '../components/SmartMoney/HoldingsHistoryChart';
import { WhaleTransfersCard } from '../components/SmartMoney/WhaleTransfersCard';
import { ExchangeFlowsCard } from '../components/SmartMoney/ExchangeFlowsCard';
import { BlackRockHoldings } from '../components/Crypto/BlackRockHoldings';
import { DataSourceFilter } from '../components/UI/DataSourceFilter';
import { DataSourceFilterValue } from '../utils/dataSource';

export const SmartMoney: React.FC = () => {
  const { data: institutions } = useApi<Institution[]>('/api/institutions');
  const [selected, setSelected] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<DataSourceFilterValue>('all');

  useEffect(() => {
    if (!selected && institutions && institutions.length > 0) {
      setSelected(institutions[0].id);
    }
  }, [institutions, selected]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >
        <InstitutionFilter
          institutions={institutions ?? []}
          value={selected}
          onChange={setSelected}
        />
        <DataSourceFilter value={sourceFilter} onChange={setSourceFilter} />
      </div>

      {selected === 'blackrock' && (
        <div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
          >
            <BlackRockHoldings title="BlackRock crypto holdings — today" filter={sourceFilter} />
            <HoldingsHistoryChart institutionId="blackrock" filter={sourceFilter} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
            <WhaleTransfersCard filter={sourceFilter} />
            <ExchangeFlowsCard filter={sourceFilter} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMoney;
