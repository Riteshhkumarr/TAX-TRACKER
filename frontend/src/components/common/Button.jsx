import { motion } from 'framer-motion'
import { FiLoader } from 'react-icons/fi'

const variants = {
  primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow hover:shadow-primary/40 active:scale-[0.98]',
  secondary: 'bg-dark-surface text-white hover:bg-dark-card border border-dark-border active:scale-[0.98]',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white active:scale-[0.98]',
  ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-[0.98]',
  danger: 'bg-danger text-white hover:bg-danger/90 hover:shadow-lg active:scale-[0.98]',
  success: 'bg-success text-white hover:bg-success/90 hover:shadow-lg active:scale-[0.98]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <FiLoader className="animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}

export default Button
