import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiX, FiCheck, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { notificationService } from '../../services/api'
import { formatDate } from '../../utils/formatters'

const iconMap = {
  info: { icon: FiInfo, color: 'text-accent bg-accent/10' },
  warning: { icon: FiAlertTriangle, color: 'text-warning bg-warning/10' },
  success: { icon: FiCheckCircle, color: 'text-success bg-success/10' },
  alert: { icon: FiBell, color: 'text-danger bg-danger/10' },
}

// Demo notifications for when API is not connected
const DEMO_NOTIFICATIONS = [
  { _id: '1', type: 'warning', title: 'Tax Deadline Approaching', message: 'Q2 estimated tax payment due in 15 days.', createdAt: new Date().toISOString(), read: false },
  { _id: '2', type: 'info', title: 'AI Analysis Complete', message: 'New spending insights are available for you.', createdAt: new Date().toISOString(), read: false },
  { _id: '3', type: 'success', title: 'Income Added', message: 'Your salary income was successfully recorded.', createdAt: new Date().toISOString(), read: true },
]

function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const res = await notificationService.getAll()
        setNotifications(res.data.notifications || res.data || DEMO_NOTIFICATIONS)
      } catch {
        setNotifications(DEMO_NOTIFICATIONS)
      } finally {
        setLoading(false)
      }
    }
    if (isOpen) fetchNotifications()
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
    } catch { /* ignore */ }
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    )
  }

  const deleteNotification = async (id) => {
    try {
      await notificationService.delete(id)
    } catch { /* ignore */ }
    setNotifications((prev) => prev.filter((n) => n._id !== id))
  }

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
    } catch { /* ignore */ }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-border z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <FiCheck size={12} /> Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FiBell size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = iconMap[notif.type]?.icon || FiInfo
                const colorClass = iconMap[notif.type]?.color || 'text-primary bg-primary/10'
                return (
                  <div
                    key={notif._id}
                    className={`flex gap-3 px-4 py-3 border-b border-slate-50 dark:border-dark-border last:border-0 hover:bg-slate-50 dark:hover:bg-dark-card transition-colors ${
                      !notif.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 self-start ${colorClass}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{formatDate(notif.createdAt)}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif._id)}
                          className="p-1 text-primary hover:bg-primary/10 rounded"
                          title="Mark as read"
                        >
                          <FiCheck size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="p-1 text-slate-400 hover:text-danger hover:bg-danger/10 rounded"
                        title="Delete"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationPanel
