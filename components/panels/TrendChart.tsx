'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface TrendChartProps {
  trend30Day: number[];
  climatologyMonthly: number[];
  unit: string;
  range?: '30d' | '12m' | '5y';
  baseline?: number;
}

export function TrendChart({
  trend30Day,
  climatologyMonthly,
  unit,
  range = '30d',
  baseline,
}: TrendChartProps) {
  let chartData: { name: string; value: number }[];

  if (range === '12m') {
    chartData = climatologyMonthly.map((val, idx) => ({
      name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx],
      value: val,
    }));
  } else if (range === '5y') {
    // 5-year cyclical representation from monthly baseline
    chartData = [];
    const years = ['22', '23', '24', '25', '26'];
    for (let y = 0; y < 5; y++) {
      for (let m = 0; m < 12; m += 3) {
        chartData.push({
          name: `${['Q1', 'Q2', 'Q3', 'Q4'][m / 3]}'${years[y]}`,
          value: parseFloat((climatologyMonthly[m] + (y - 2) * 0.12).toFixed(2)),
        });
      }
    }
  } else {
    chartData = trend30Day.map((val, idx) => ({
      name: idx % 5 === 0 ? `D-${30 - idx}` : '',
      value: val,
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ width: '100%', height: '140px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--series-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--series-1)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke="var(--text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-hairline)' }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-hairline)' }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
              }}
              formatter={(value) => [
                `${typeof value === 'number' ? value.toFixed(1) : String(value ?? '')} ${unit}`,
                'Value',
              ]}
            />
            {baseline !== undefined && (
              <ReferenceLine
                y={baseline}
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                label={{
                  value: 'BASELINE',
                  fill: 'var(--text-muted)',
                  fontSize: 8,
                  position: 'insideTopLeft',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--series-1)"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
