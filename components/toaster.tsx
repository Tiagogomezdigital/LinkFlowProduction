"use client"

import type React from "react"

import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { useEffect, useRef } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    variant?: "default" | "destructive" | "success"
  }
  onDismiss: () => void
}) {
  // Usar useRef para rastrear o timer
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Limpar qualquer timer existente
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Configurar novo timer
    timerRef.current = setTimeout(() => {
      onDismiss()
    }, 5000)

    // Limpar o timer quando o componente for desmontado ou o toast mudar
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [onDismiss, toast.id])

  const variantStyles = {
    default: "border-slate-700 bg-slate-800 text-white",
    destructive: "border-red-900 bg-red-900 text-white",
    success: "border-green-900 bg-green-900 text-white",
  }

  return (
    <div
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
        variantStyles[toast.variant || "default"]
      }`}
    >
      <div className="grid gap-1">
        {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
        {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:text-slate-200 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
