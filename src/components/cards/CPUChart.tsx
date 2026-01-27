import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DataPoint {
  time: string;
  cpu: number;
}

interface CPUChartProps {
  data: DataPoint[];
  currentCpu: number;
  load: string;
}

export function CPUChart({ data, currentCpu, load }: CPUChartProps) {
  // Determine color based on current CPU
  const getColor = (cpu: number) => {
    if (cpu > 90) return '#ef4444'; // red
    if (cpu > 70) return '#f59e0b'; // amber
    return '#22c55e'; // green
  };

  const color = getColor(currentCpu);

  return (
    <div style={{ width: '100%' }}>
      {/* Header with current value */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'baseline',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            color,
            lineHeight: 1
          }}>
            {currentCpu}%
          </span>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>CPU</span>
        </div>
        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
          Load: {load}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 120 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              ticks={[25, 50, 75, 100]}
            />
            <ReferenceLine y={50} stroke="#374151" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke={color}
              strokeWidth={2}
              fill="url(#cpuGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
