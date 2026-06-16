import { motion } from 'framer-motion'
import { FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import Badge from '../common/Badge'

const CATEGORY_ICONS = {
  salary: '💼', freelance: '💻', business: '🏢', investment: '📈',
  office: '🖊️', travel: '✈️', meals: '🍽️', software: '💾',
  hardware: '🖥️', marketing: '📣', healthcare: '🏥', other: '📌',
}

function RecentTransactions({ transactions = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-32 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <span className="text-4xl mb-3">📊</span>
        <p className="text-sm font-medium">No transactions yet</p>
        <p className="text-xs mt-1 text-slate-500">Start by adding your income or expenses</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {transactions.map((tx, i) => {
        const isIncome = tx.type === 'income'
        const emoji = CATEGORY_ICONS[tx.category] || '📌'
        return (
          <motion.div
            key={tx._id || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-card transition-colors cursor-default"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              isIncome ? 'bg-success/10' : 'bg-danger/10'
            }`}>
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {tx.source || tx.title || tx.description || 'Transaction'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={isIncome ? 'success' : 'danger'} size="sm">
                  {tx.category || 'other'}
                </Badge>
                <span className="text-xs text-slate-400">{formatDate(tx.date || tx.createdAt)}</span>
              </div>
            </div>
            <div className={`flex items-center gap-1 font-semibold text-sm ${
              isIncome ? 'text-success' : 'text-danger'
            }`}>
              {isIncome ? <FiArrowDownLeft size={14} /> : <FiArrowUpRight size={14} />}
              {formatCurrency(tx.amount)}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default RecentTransactions
