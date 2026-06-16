import { motion } from 'framer-motion'

const sizeMap = {
  sm: { container: 'w-5 h-5', border: 'border-2' },
  md: { container: 'w-8 h-8', border: 'border-2' },
  lg: { container: 'w-12 h-12', border: 'border-3' },
  xl: { container: 'w-16 h-16', border: 'border-4' },
}

function Spinner({ size = 'md', color = 'primary' }) {
  const s = sizeMap[size] || sizeMap.md
  const colorClass = color === 'white' ? 'border-white/30 border-t-white' : 'border-primary/20 border-t-primary'
  return (
    <div
      className={`${s.container} ${s.border} ${colorClass} rounded-full animate-spin`}
    />
  )
}

function LoadingSpinner({ size = 'md', fullPage = false, text }) {
  if (fullPage || size === 'full') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-secondary/20 border-b-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          {text && <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>}
        </motion.div>
      </div>
    )
  }

  return <Spinner size={size} />
}

export { Spinner }
export default LoadingSpinner
