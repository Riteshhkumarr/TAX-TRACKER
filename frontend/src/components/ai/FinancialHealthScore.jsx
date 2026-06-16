import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

function getScoreColor(score) {
  if (score >= 70) return { color: '#10B981', label: 'Excellent', bg: 'bg-success/10 text-success' }
  if (score >= 40) return { color: '#F59E0B', label: 'Fair', bg: 'bg-warning/10 text-warning' }
  return { color: '#EF4444', label: 'Needs Work', bg: 'bg-danger/10 text-danger' }
}

const SCORE_FACTORS = [
  { label: 'Tax Compliance', weight: 30 },
  { label: 'Expense Tracking', weight: 25 },
  { label: 'Income Diversity', weight: 20 },
  { label: 'Deduction Optimization', weight: 15 },
  { label: 'Record Completeness', weight: 10 },
]

function CircularProgress({ score, color, size = 180 }) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(148,163,184,0.15)"
        strokeWidth="10"
      />
      {/* Dashed track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(148,163,184,0.05)"
        strokeWidth="10"
        strokeDasharray="4 8"
      />
      {/* Progress */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        filter={`drop-shadow(0 0 8px ${color}60)`}
      />
    </svg>
  )
}

function FinancialHealthScore({ score = 72, breakdown = null, loading = false }) {
  const [displayScore, setDisplayScore] = useState(0)
  const { color, label, bg } = getScoreColor(score)

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0
      const step = score / 60
      const interval = setInterval(() => {
        current += step
        if (current >= score) {
          setDisplayScore(score)
          clearInterval(interval)
        } else {
          setDisplayScore(Math.floor(current))
        }
      }, 16)
      return () => clearInterval(interval)
    }, 400)
    return () => clearTimeout(timer)
  }, [score])

  const factorScores = breakdown || SCORE_FACTORS.map((f) => ({
    ...f,
    score: Math.round(score * (0.7 + Math.random() * 0.6)),
  }))

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="skeleton w-44 h-44 rounded-full" />
        <div className="w-full space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-3 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative">
        <CircularProgress score={score} color={color} size={180} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-black text-slate-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {displayScore}
          </motion.span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${bg}`}>
            {label}
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Financial Health Score</p>

      {/* Factor breakdown */}
      <div className="w-full space-y-3">
        {factorScores.map((factor, i) => {
          const pct = Math.min(100, Math.round((factor.score / factor.weight) * factor.weight))
          const factorColor = getScoreColor(factor.score).color
          return (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">{factor.label}</span>
                <span className="font-medium" style={{ color: factorColor }}>{factor.score}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-dark-card rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: factorColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FinancialHealthScore
