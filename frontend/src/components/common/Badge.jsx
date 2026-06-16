const variantClasses = {
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  danger: 'bg-danger/10 text-danger border border-danger/20',
  info: 'bg-accent/10 text-accent border border-accent/20',
  primary: 'bg-primary/10 text-primary border border-primary/20',
  default: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 rounded-md',
  md: 'text-xs px-2.5 py-1 rounded-lg',
  lg: 'text-sm px-3 py-1.5 rounded-lg',
}

function Badge({ variant = 'default', children, size = 'md', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium
        ${variantClasses[variant] || variantClasses.default}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

export default Badge
