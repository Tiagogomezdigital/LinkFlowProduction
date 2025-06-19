"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getRecentClicks, RecentClick } from "@/lib/api/dashboard"
import { Clock } from "lucide-react"

export function RecentActivityList() {
  const [clicks, setClicks] = useState<RecentClick[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecentClicks(20)
      .then(setClicks)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Atividade Recente</h2>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          {clicks.map((c) => (
            <li key={c.id} className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
              <div className="flex items-center gap-3 text-white">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm">
                  {new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-slate-400 text-sm">{c.group_name}</span>
              </div>
              <span className="text-slate-400 text-sm font-mono">{c.phone}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
} 