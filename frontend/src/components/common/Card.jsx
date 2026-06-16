import { motion } from 'framer-motion'

function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  hover = false,
  gradient = false,
  padding = true,
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' } : {}}
      transition={{ duration: 0.2 }}
      className={`
        rounded-2xl border
        bg-white dark:bg-dark-surface
        border-slate-200 dark:border-dark-border
        shadow-sm
        ${gradient ? 'overflow-hidden' : ''}
        ${className}
      `}
    >
      {(title || actions) && (
        <div className={`flex items-center justify-between ${padding ? 'px-6 py-4' : 'p-0'} border-b border-slate-100 dark:border-dark-border`}>
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </motion.div>
  )
}

export default Card
