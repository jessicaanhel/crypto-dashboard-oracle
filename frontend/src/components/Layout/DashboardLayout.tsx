import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { COLORS } from '../../theme/tokens';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { TimeRange } from '../UI/SegmentedControl';
import { OracleProvider } from '../../context/OracleContext';
import { OracleWidget } from '../Oracle/OracleWidget';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');

  return (
    <OracleProvider>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          background: COLORS.background,
          color: COLORS.textPrimary,
        }}
      >
        <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <TopBar timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <div style={{ flex: 1, overflow: 'auto', padding: '6px 36px 36px' }}>
            <Outlet />
          </div>
        </div>
        <OracleWidget />
      </div>
    </OracleProvider>
  );
};
