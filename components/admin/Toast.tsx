'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration }])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => toast(message, 'success', duration), [toast])
  const error = useCallback((message: string, duration?: number) => toast(message, 'error', duration), [toast])
  const warning = useCallback((message: string, duration?: number) => toast(message, 'warning', duration), [toast])
  const info = useCallback((message: string, duration?: number) => toast(message, 'info', duration), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[9999] flex flex-col space-y-3 max-w-sm w-[calc(100%-2.5rem)] sm:w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let Icon = Info
            let bgClass = 'bg-[#0A192F]/95 border-blue-500/30 text-blue-100'
            let iconColor = 'text-blue-400'

            if (t.type === 'success') {
              Icon = CheckCircle
              bgClass = 'bg-slate-900/95 border-emerald-500/30 text-emerald-100'
              iconColor = 'text-emerald-400'
            } else if (t.type === 'error') {
              Icon = XCircle
              bgClass = 'bg-slate-900/95 border-rose-500/30 text-rose-100'
              iconColor = 'text-rose-400'
            } else if (t.type === 'warning') {
              Icon = AlertCircle
              bgClass = 'bg-slate-900/95 border-amber-500/30 text-amber-100'
              iconColor = 'text-amber-400'
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`flex items-start p-4 rounded-xl border backdrop-blur-md shadow-2xl pointer-events-auto select-none font-sans ${bgClass}`}
              >
                <Icon className={`w-5 h-5 shrink-0 mr-3 mt-0.5 ${iconColor}`} />
                <p className="text-xs font-medium flex-1 leading-relaxed">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-white/40 hover:text-white transition-colors ml-3 cursor-pointer shrink-0 mt-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
