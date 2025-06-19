"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { getSystemStatus, SystemStatus } from "@/lib/api/dashboard"

export function SystemStatusCards() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSystemStatus()
      .then(setStatus)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !status) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 p-6 h-24" />
        ))}
      </div>
    )
  }

  const items = [
    {
      label: "Sistema",
      value: "Online",
      icon: CheckCircle,
      color: "text-lime-400",
      description: "99.9% uptime",
    },
    {
      label: "Grupos Inativos",
      value: status.inactiveGroups,
      icon: AlertCircle,
      color: "text-yellow-400",
      description: status.inactiveGroups > 0 ? "Precisam atenção" : "Todos ativos",
    },
    {
      label: "Números sem uso 7d",
      value: status.numbersNoUse7d,
      icon: XCircle,
      color: "text-red-500",
      description: status.numbersNoUse7d > 0 ? "Verificar status" : "Ok",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card
          key={item.label}
          className="bg-slate-800 border-slate-700 p-6 flex flex-col gap-2 hover:scale-105 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm uppercase tracking-widest">{item.label}</span>
            <item.icon className={`h-6 w-6 ${item.color}`} />
          </div>
          <div className="text-white text-3xl font-light">{item.value}</div>
          <span className="text-xs text-slate-500">{item.description}</span>
        </Card>
      ))}
    </div>
  )
} 