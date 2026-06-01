// @refresh reset
// Required for Vite HMR when exporting both components and a hook from one module.

import { createContext, useContext, useState, useCallback, useRef } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, leaving: true } : t))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300)
  }, [])

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type, leaving: false }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

const icons = {
  success: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="#10B981"/>
      <path d="M3.5 7l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="#EF4444"/>
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="white" strokeWidth="1.8"
        strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="#6246EA"/>
      <path d="M7 6.5v4M7 4.5v.5" stroke="white" strokeWidth="1.8"
        strokeLinecap="round"/>
    </svg>
  ),
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  return (
    <div
      className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5
        bg-gray-900 text-white rounded-xl border border-white/10
        shadow-[0_8px_28px_-4px_rgba(0,0,0,0.4)]
        text-[13px] font-medium whitespace-nowrap transition-all duration-300"
      style={{
        animation: toast.leaving
          ? "toastItemOut 0.3s cubic-bezier(0.4,0,1,1) forwards"
          : "toastItemIn 0.25s cubic-bezier(0.34,1.4,0.64,1) forwards",
      }}
    >
      <span className="shrink-0">{icons[toast.type]}</span>
      <span>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-1 text-white/30 hover:text-white/70 transition-colors text-base leading-none"
      >
        ×
      </button>
    </div>
  )
}