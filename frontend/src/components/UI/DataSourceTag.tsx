import React from 'react';
import { Pill } from './Pill';
import { COLORS } from '../../theme/tokens';
import { DataSource } from '../../utils/dataSource';

const CONFIG: Record<DataSource, { label: string; color: string; background: string }> = {
  live: { label: 'Live', color: COLORS.positive, background: 'rgba(52,209,161,0.16)' },
  partial: { label: 'Partial', color: COLORS.accent, background: COLORS.accentSoft },
  mock: { label: 'Mocked', color: COLORS.textLabel, background: COLORS.pillMutedBg },
};

interface DataSourceTagProps {
  source: DataSource | null | undefined;
  style?: React.CSSProperties;
}

export const DataSourceTag: React.FC<DataSourceTagProps> = ({ source, style }) => {
  if (!source) return null;
  const cfg = CONFIG[source];
  return (
    <Pill color={cfg.color} background={cfg.background} style={{ fontSize: 10, ...style }}>
      {cfg.label}
    </Pill>
  );
};
