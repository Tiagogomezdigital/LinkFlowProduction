'use client'

import { Card } from '@/components/ui/card'

export function TopGroupsTableDaily() {
  const groups = Array.from({ length: 10 }, (_, i) => ({ name: `Grupo ${i + 1}`, clicks: Math.floor(Math.random() * 200) }))
  const total = groups.reduce((s, g) => s + g.clicks, 0)

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Top 10 Grupos</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400">
            <th className="text-left py-1">Grupo</th>
            <th className="text-right py-1">Cliques</th>
            <th className="text-right py-1 w-32">% do total</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.name} className="border-t border-slate-700">
              <td className="py-1 text-white">{g.name}</td>
              <td className="py-1 text-right text-white font-mono">{g.clicks}</td>
              <td className="py-1 text-right text-slate-300 font-mono">
                {((g.clicks / total) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
} 