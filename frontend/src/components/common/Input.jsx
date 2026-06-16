import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    rightIcon: RightIcon,
    type = 'text',
    placeholder,
    helperText,
    className = '',
    disabled = false,
    ...rest
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <motion.input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.15 }}
          className={`
            w-full rounded-xl border bg-white dark:bg-dark-surface
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-600
            transition-all duration-200 text-sm
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-4'}
            ${RightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${
              error
                ? 'border-danger focus:ring-2 focus:ring-danger/40 focus:border-danger'
                : 'border-slate-200 dark:border-dark-border focus:ring-2 focus:ring-primary/40 focus:border-primary'
            }
            focus:outline-none
          `}
          {...rest}
        />
        {RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <RightIcon size={16} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-500">{helperText}</p>
      )}
    </div>
  )
})

export default Input
