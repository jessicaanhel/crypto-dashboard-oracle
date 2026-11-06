import React, { useMemo, useRef, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Card } from '../UI/Card';
import { DataSourceTag } from '../UI/DataSourceTag';
import { COLORS } from '../../theme/tokens';
import { formatCompactNumber } from '../../utils/format';
import { DataSourceFilterValue, matchesDataSourceFilter } from '../../utils/dataSource';

type Period = 'mtd' | '3m' | '1y';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'mtd', label: 'MTD' },
  { id: '3m', label: '3M' },
  { id: '1y', label: '1Y' },
];

interface Point {
  date: string;
  btc_value_usd: number;
  eth_value_usd: number;
}

interface HistoryResponse {
  institution: string;
  period: Period;
  points: Point[];
}

const BTC_COLOR = COLORS.accent;
const ETH_COLOR = '#d95926';

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

const formatUsdCompact = (value: number) => `$${formatCompactNumber(value)}`;

const formatDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

interface HoldingsHistoryChartProps {
  institutionId: string;
  filter?: DataSourceFilterValue;
}

export const HoldingsHistoryChart: React.FC<HoldingsHistoryChartProps> = ({
  institutionId,
  filter = 'all',
}) => {
  const [period, setPeriod] = useState<Period>('mtd');
  const { data, source } = useApi<HistoryResponse>(
    `/api/institutions/${institutionId}/holdings-history?period=${period}`,
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, btcPath, ethPath, yTicks, xForIndex, yForValue } = useMemo(() => {
    const points = data?.points ?? [];
    if (points.length === 0) {
      return {
        points,
        btcPath: '',
        ethPath: '',
        yTicks: [] as number[],
        xForIndex: () => 0,
        yForValue: () => 0,
      };
    }
    const maxValue = Math.max(...points.flatMap((p) => [p.btc_value_usd, p.eth_value_usd]));

    const xForIndex = (i: number) =>
      PADDING.left + (points.length === 1 ? 0 : (i / (points.length - 1)) * PLOT_WIDTH);
    const yForValue = (v: number) =>
      PADDING.top + PLOT_HEIGHT - (v / (maxValue || 1)) * PLOT_HEIGHT;

    const pathFor = (key: 'btc_value_usd' | 'eth_value_usd') =>
      points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xForIndex(i)} ${yForValue(p[key])}`).join(' ');

    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => (maxValue / tickCount) * i);

    return {
      points,
      btcPath: pathFor('btc_value_usd'),
      ethPath: pathFor('eth_value_usd'),
      yTicks,
      xForIndex,
      yForValue,
    };
  }, [data]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const relative = (svgX - PADDING.left) / PLOT_WIDTH;
    const index = Math.round(relative * (points.length - 1));
    setHoverIndex(Math.max(0, Math.min(points.length - 1, index)));
  };

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const xTickIndexes =
    points.length > 0
      ? Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]))
      : [];

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 16 }}>
            BTC &amp; ETH holdings value
          </div>
          <DataSourceTag source={source} />
        </div>
        <div
          style={{
            display: 'flex',
            background: COLORS.background,
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}
        >
          {PERIODS.map((p) => {
            const active = p.id === period;
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  fontFamily: 'inherit',
                  background: active ? COLORS.accent : 'transparent',
                  color: active ? COLORS.background : COLORS.textSecondary,
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <LegendItem color={BTC_COLOR} label="BTC" />
        <LegendItem color={ETH_COLOR} label="ETH" />
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={yForValue(tick)}
                y2={yForValue(tick)}
                stroke={COLORS.borderSubtle}
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={yForValue(tick) + 4}
                textAnchor="end"
                fontSize={10}
                fill={COLORS.textMuted}
              >
                {formatUsdCompact(tick)}
              </text>
            </g>
          ))}

          {xTickIndexes.map((i) => (
            <text
              key={i}
              x={xForIndex(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize={10}
              fill={COLORS.textMuted}
            >
              {formatDateShort(points[i].date)}
            </text>
          ))}

          <path
            d={btcPath}
            fill="none"
            stroke={BTC_COLOR}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={ethPath}
            fill="none"
            stroke={ETH_COLOR}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.length > 0 && (
            <>
              <circle
                cx={xForIndex(points.length - 1)}
                cy={yForValue(points[points.length - 1].btc_value_usd)}
                r={4}
                fill={BTC_COLOR}
                stroke={COLORS.surface}
                strokeWidth={2}
              />
              <circle
                cx={xForIndex(points.length - 1)}
                cy={yForValue(points[points.length - 1].eth_value_usd)}
                r={4}
                fill={ETH_COLOR}
                stroke={COLORS.surface}
                strokeWidth={2}
              />
            </>
          )}

          {hovered && hoverIndex !== null && (
            <line
              x1={xForIndex(hoverIndex)}
              x2={xForIndex(hoverIndex)}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              stroke={COLORS.textMuted}
              strokeWidth={1}
            />
          )}
        </svg>

        {hovered && hoverIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: `${(xForIndex(hoverIndex) / WIDTH) * 100}%`,
              transform:
                xForIndex(hoverIndex) > WIDTH * 0.7 ? 'translateX(-105%)' : 'translateX(12px)',
              background: COLORS.background,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '8px 10px',
              fontSize: 12,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ color: COLORS.textMuted, marginBottom: 4 }}>
              {formatDateShort(hovered.date)}
            </div>
            <TooltipRow
              color={BTC_COLOR}
              label="BTC"
              value={formatUsdCompact(hovered.btc_value_usd)}
            />
            <TooltipRow
              color={ETH_COLOR}
              label="ETH"
              value={formatUsdCompact(hovered.eth_value_usd)}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: COLORS.textSecondary,
    }}
  >
    <span
      style={{ width: 10, height: 2, background: color, display: 'inline-block', borderRadius: 1 }}
    />
    {label}
  </div>
);

const TooltipRow: React.FC<{ color: string; label: string; value: string }> = ({
  color,
  label,
  value,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span
      style={{ width: 10, height: 2, background: color, display: 'inline-block', borderRadius: 1 }}
    />
    <span style={{ color: COLORS.textSecondary }}>{label}</span>
    <strong style={{ color: COLORS.textPrimary, marginLeft: 12 }}>{value}</strong>
  </div>
);
