import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { formatCurrency, formatPercentage } from '../../utils/formatters'

const RADIAN = Math.PI / 180

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-dark-surface border border-dark-border rounded-xl p-3 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full" style={{ background: item.payload.color }} />
          <span className="text-sm text-white font-medium">{item.name}</span>
        </div>
        <p className="text-sm text-slate-300">{formatCurrency(item.value)}</p>
        <p className="text-xs text-slate-400">{formatPercentage(item.payload.percent * 100)}</p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
    {payload?.map((entry, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
        <span className="text-xs text-slate-500 dark:text-slate-400">{entry.value}</span>
      </div>
    ))}
  </div>
)

function PieChartComponent({
  data = [],
  title,
  height = 280,
  innerRadius = 0,
  showLegend = true,
}) {
  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="70%"
            dataKey="value"
            labelLine={false}
            label={innerRadius === 0 ? renderCustomLabel : undefined}
            strokeWidth={2}
            stroke="transparent"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PieChartComponent
