import React from 'react';
import { COLORS } from '../../theme/tokens';
import { DataSourceFilterValue } from '../../utils/dataSource';

const OPTIONS: { id: DataSourceFilterValue; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'mock', label: 'Mocked' },
];

interface DataSourceFilterProps {
  value: DataSourceFilterValue;
  onChange: (value: DataSourceFilterValue) => void;
}

export const DataSourceFilter: React.FC<DataSourceFilterProps> = ({ value, onChange }) => (
  <div
    style={{ display: 'flex', background: COLORS.surface, borderRadius: 12, padding: 4, gap: 2 }}
  >
    {OPTIONS.map((opt) => {
      const active = opt.id === value;
      return (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: '7px 14px',
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'inherit',
            background: active ? COLORS.accent : 'transparent',
            color: active ? COLORS.background : COLORS.textSecondary,
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);
