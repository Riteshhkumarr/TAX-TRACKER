import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-xl p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span style={{ color: p.fill }}>
              {p.name}: {formatCurrency(p.value)}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

function BarChartComponent({
  data = [],
  bars = [{ dataKey: 'value', color: '#6366F1', name: 'Value' }],
  xKey = 'name',
  title,
  height = 250,
  showLegend = false,
  radius = 4,
}) {
  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
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
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              radius={[radius, radius, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChartComponent
