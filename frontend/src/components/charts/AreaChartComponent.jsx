import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, defs, linearGradient, stop
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label, valuePrefix = '$' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-xl p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {valuePrefix === '$' ? formatCurrency(p.value) : `${p.value}${valuePrefix}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function AreaChartComponent({
  data = [],
  dataKey = 'value',
  xKey = 'name',
  title,
  color = '#6366F1',
  height = 250,
  gradient = true,
  isCurrency = true,
}) {
  const gradientId = `gradient-${dataKey}-${color.replace('#', '')}`

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => isCurrency ? `$${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fill={gradient ? `url(#${gradientId})` : 'none'}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: color, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AreaChartComponent
