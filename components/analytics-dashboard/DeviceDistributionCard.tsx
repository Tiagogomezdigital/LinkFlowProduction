"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Smartphone, Monitor, Tablet } from "lucide-react"
import { getDeviceStats, DeviceStat } from "@/lib/api/dashboard"

const ICONS: Record<string, any> = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
}

export function DeviceDistributionCard() {
  const [stats, setStats] = useState<DeviceStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDeviceStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Card className="bg-slate-800 border-slate-700 p-4 animate-pulse h-64" />
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Distribuição por Dispositivo</h2>
      <ul className="flex flex-col gap-2">
        {stats.map((d) => {
          const Icon = ICONS[d.device_type.toLowerCase()] || Smartphone
          return (
            <li key={d.device_type} className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
              <div className="flex items-center gap-3 text-white">
                <Icon className="h-4 w-4" />
                {d.device_type.charAt(0).toUpperCase() + d.device_type.slice(1)}
              </div>
              <div className="flex items-center gap-3 w-2/3">
                <div className="flex-1 h-2 bg-slate-700 rounded">
                  <div className="h-2 bg-lime-400 rounded" style={{ width: `${d.percent}%` }} />
                </div>
                <span className="text-white font-mono w-12 text-right">{d.count}</span>
                <span className="text-slate-400 text-xs w-10 text-right">{d.percent}%</span>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
} 