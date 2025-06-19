"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTopGroupsByClicks } from "@/lib/api/stats"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TopGroupsTableProps {
  dateFrom: Date
  dateTo: Date
  groupIds?: string[]
}

export function TopGroupsTable({ dateFrom, dateTo, groupIds }: TopGroupsTableProps) {
  const [data, setData] = useState<Array<{ group_name: string; clicks: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const stats = await getTopGroupsByClicks(dateFrom, dateTo, groupIds)
        setData(stats)
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError("Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [dateFrom, dateTo, groupIds])

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Erro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Top Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Top Grupos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-400">Grupo</TableHead>
              <TableHead className="text-slate-400 text-right">Cliques</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((group, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-white">{group.group_name}</TableCell>
                <TableCell className="text-right text-slate-400">{group.clicks.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-400">
                  Nenhum dado disponível
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
