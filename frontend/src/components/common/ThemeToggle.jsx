import { motion } from 'framer-motion'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../hooks/useTheme'

function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={`
        relative w-10 h-10 flex items-center justify-center rounded-xl
        bg-slate-100 dark:bg-dark-card
        text-slate-600 dark:text-slate-300
        hover:bg-slate-200 dark:hover:bg-slate-600
        transition-colors duration-200
        ${className}
      `}
      aria-label="Toggle theme"
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <FiSun size={18} className="text-warning" /> : <FiMoon size={18} />}
      </motion.span>
    </motion.button>
  )
}

export default ThemeToggle
