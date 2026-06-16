import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatChange } from '../../utils/formatters'

function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = '#6366F1',
  sparklineData = [],
  sparklineKey = 'value',
  isCurrency = true,
  index = 0,
}) {
  const isPositive = change >= 0
  const displayValue = isCurrency ? formatCurrency(value) : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border p-5 shadow-sm hover:shadow-card-hover transition-all duration-300 cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: `${color}15` }}
        >
          {Icon && <Icon size={20} style={{ color }} />}
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
            isPositive
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}
        >
          {isPositive ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
          {formatChange(change)}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {displayValue}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
      </div>

      {sparklineData.length > 0 && (
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`kpi-grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={sparklineKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#kpi-grad-${title})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {changeLabel && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{changeLabel}</p>
      )}
    </motion.div>
  )
}

export default KPICard
