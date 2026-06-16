import { motion } from 'framer-motion'
import {
  FiAlertTriangle, FiCheckCircle, FiInfo, FiStar,
  FiArrowRight, FiTrendingDown, FiShield, FiTarget
} from 'react-icons/fi'
import Button from '../common/Button'

const variantConfig = {
  warning: {
    icon: FiAlertTriangle,
    bg: 'bg-warning/5 border-warning/20',
    iconBg: 'bg-warning/10 text-warning',
    badge: 'bg-warning/10 text-warning',
    badgeText: 'Warning',
  },
  success: {
    icon: FiCheckCircle,
    bg: 'bg-success/5 border-success/20',
    iconBg: 'bg-success/10 text-success',
    badge: 'bg-success/10 text-success',
    badgeText: 'Opportunity',
  },
  info: {
    icon: FiInfo,
    bg: 'bg-accent/5 border-accent/20',
    iconBg: 'bg-accent/10 text-accent',
    badge: 'bg-accent/10 text-accent',
    badgeText: 'Insight',
  },
  tip: {
    icon: FiStar,
    bg: 'bg-primary/5 border-primary/20',
    iconBg: 'bg-primary/10 text-primary',
    badge: 'bg-primary/10 text-primary',
    badgeText: 'Tip',
  },
  saving: {
    icon: FiTrendingDown,
    bg: 'bg-secondary/5 border-secondary/20',
    iconBg: 'bg-secondary/10 text-secondary',
    badge: 'bg-secondary/10 text-secondary',
    badgeText: 'Saving',
  },
  protection: {
    icon: FiShield,
    bg: 'bg-success/5 border-success/20',
    iconBg: 'bg-success/10 text-success',
    badge: 'bg-success/10 text-success',
    badgeText: 'Protection',
  },
  goal: {
    icon: FiTarget,
    bg: 'bg-accent/5 border-accent/20',
    iconBg: 'bg-accent/10 text-accent',
    badge: 'bg-accent/10 text-accent',
    badgeText: 'Goal',
  },
}

function AIInsightCard({ insight, index = 0 }) {
  const { title, description, variant = 'info', action, actionLabel = 'Take Action', impact } = insight
  const config = variantConfig[variant] || variantConfig.info
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      whileHover={{ y: -2 }}
      className={`rounded-2xl border p-5 transition-all duration-200 ${config.bg}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl shrink-0 ${config.iconBg}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
              {config.badgeText}
            </span>
            {impact && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Potential impact: <strong className="text-success">{impact}</strong>
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">{title}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
          {action && (
            <button
              onClick={action}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {actionLabel} <FiArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AIInsightCard
