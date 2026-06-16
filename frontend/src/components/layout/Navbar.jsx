import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMenu, FiSearch, FiBell } from 'react-icons/fi'
import ThemeToggle from '../common/ThemeToggle'
import NotificationPanel from '../common/NotificationPanel'
import { useAuth } from '../../hooks/useAuth'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/income': 'Income Tracker',
  '/expenses': 'Expense Tracker',
  '/tax-calculator': 'Tax Calculator',
  '/ai-insights': 'AI Insights',
  '/reports': 'Reports',
  '/profile': 'Profile',
}

function Navbar({ onMenuToggle }) {
  const { user } = useAuth()
  const location = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const pageTitle = pageTitles[location.pathname] || 'TaxTracker AI'
  const unreadCount = 2

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-border">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        {/* Hamburger (mobile) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
        >
          <FiMenu size={20} />
        </motion.button>

        {/* Page title */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{pageTitle}</h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-dark-card rounded-xl px-3 py-2 w-56 lg:w-72">
          <FiSearch size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none flex-1 min-w-0"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <NotificationPanel
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          {/* User avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm cursor-pointer">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
