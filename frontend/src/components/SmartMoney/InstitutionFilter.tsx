import React from 'react';
import { COLORS } from '../../theme/tokens';

export interface Institution {
  id: string;
  name: string;
}

interface InstitutionFilterProps {
  institutions: Institution[];
  value: string | null;
  onChange: (id: string) => void;
}

export const InstitutionFilter: React.FC<InstitutionFilterProps> = ({
  institutions,
  value,
  onChange,
}) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
    {institutions.map((inst) => {
      const active = inst.id === value;
      return (
        <button
          key={inst.id}
          onClick={() => onChange(inst.id)}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
            fontFamily: 'inherit',
            background: active ? COLORS.accentSoft : 'transparent',
            color: active ? COLORS.accentText : COLORS.textSecondary,
          }}
        >
          {inst.name}
        </button>
      );
    })}
  </div>
);
