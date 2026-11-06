import React from 'react';
import { COLORS } from '../../theme/tokens';

const OPTIONS = ['24H', '7D', '30D', '1Y'] as const;
export type TimeRange = typeof OPTIONS[number];

interface SegmentedControlProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ value, onChange }) => (
  <div
    style={{ display: 'flex', background: COLORS.surface, borderRadius: 12, padding: 4, gap: 2 }}
  >
    {OPTIONS.map((opt) => {
      const active = opt === value;
      return (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '7px 16px',
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'inherit',
            background: active ? COLORS.accent : 'transparent',
            color: active ? COLORS.background : COLORS.textSecondary,
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);
