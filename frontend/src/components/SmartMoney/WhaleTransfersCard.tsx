import React from 'react';
import { useApi } from '../../hooks/useApi';
import { Card } from '../UI/Card';
import { Pill } from '../UI/Pill';
import { DataSourceTag } from '../UI/DataSourceTag';
import { COLORS } from '../../theme/tokens';
import { formatUsdMillions } from '../../utils/format';
import { DataSourceFilterValue, matchesDataSourceFilter } from '../../utils/dataSource';

interface WhaleTransfer {
  asset: string;
  qty_label: string;
  usd: number;
  direction: 'Inflow' | 'Outflow';
  route: string;
  time_label: string;
}

interface WhaleTransfersResponse {
  threshold_usd: number;
  transfers: WhaleTransfer[];
}

interface WhaleTransfersCardProps {
  filter?: DataSourceFilterValue;
}

export const WhaleTransfersCard: React.FC<WhaleTransfersCardProps> = ({ filter = 'all' }) => {
  const { data, source } = useApi<WhaleTransfersResponse>('/api/smart-money/whale-transfers');

  if (!matchesDataSourceFilter(source, filter)) return null;

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 16 }}>
          Whale wallet transfers
        </div>
        <DataSourceTag source={source} />
      </div>
      {data?.transfers.map((w, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderBottom: `1px solid ${COLORS.borderSubtle}`,
          }}
        >
          <Pill
            background={COLORS.pillMutedBg}
            color={COLORS.pillMutedText}
            style={{ width: 54, textAlign: 'center' }}
          >
            {w.asset}
          </Pill>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13 }}>{w.route}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              {w.qty_label} · {w.time_label}
            </div>
          </div>
          {w.usd >= data.threshold_usd && (
            <Pill background={COLORS.largeBg} color={COLORS.large} style={{ fontSize: 10 }}>
              LARGE
            </Pill>
          )}
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 600,
              color: w.direction === 'Inflow' ? COLORS.positive : COLORS.negative,
              width: 80,
              textAlign: 'right',
            }}
          >
            {formatUsdMillions(w.direction === 'Inflow' ? w.usd : -w.usd)}
          </span>
        </div>
      ))}
    </Card>
  );
};
