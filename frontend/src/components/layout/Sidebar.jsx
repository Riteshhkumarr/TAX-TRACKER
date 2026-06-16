import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiTrendingUp, FiShoppingCart, FiCpu,
  FiFileText, FiUser, FiLogOut, FiX, FiZap
} from 'react-icons/fi'
import { MdCalculate } from 'react-icons/md'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/income', icon: FiTrendingUp, label: 'Income' },
  { to: '/expenses', icon: FiShoppingCart, label: 'Expenses' },
  { to: '/tax-calculator', icon: MdCalculate, label: 'Tax Calculator' },
  { to: '/ai-insights', icon: FiCpu, label: 'AI Insights' },
  { to: '/reports', icon: FiFileText, label: 'Reports' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
]

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200 dark:border-dark-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
          <FiZap size={18} className="text-white" />
        </div>
        <div>
          <span className="text-gradient font-bold text-lg leading-none">TaxTracker</span>
          <span className="block text-xs text-slate-400 font-medium">AI-Powered Finance</span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="ml-auto lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-3 mb-2">
          Main Menu
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-white' : ''} />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-dark-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-dark-card mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-danger/10 hover:text-danger transition-all duration-200 text-sm font-medium"
        >
          <FiLogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-dark-surface z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
