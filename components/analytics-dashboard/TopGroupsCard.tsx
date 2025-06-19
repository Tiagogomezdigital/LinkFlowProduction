'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { getTopGroups, GroupClicks } from '@/lib/api/dashboard'

export function TopGroupsCard() {
  const [groups, setGroups] = useState<GroupClicks[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTopGroups(5)
      .then((g) => setGroups(g))
      .finally(() => setLoading(false))
  }, [])

  const total = groups.reduce((s, g) => s + g.clicks, 0) || 1

  if (loading) {
    return <Card className="bg-slate-800 border-slate-700 p-4 animate-pulse h-64" />
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Top 5 Grupos por Cliques (Hoje)</h2>
      <ul className="flex flex-col gap-2">
        {groups.map((g, i) => (
          <li key={g.group_id} className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="bg-lime-400 text-black font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">
                {i + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-white text-sm">{g.group_name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-mono">{g.clicks}</div>
              <div className="text-slate-400 text-xs">{((g.clicks / total) * 100).toFixed(1)}%</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
} 