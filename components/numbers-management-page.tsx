"use client"

import { useState, useEffect } from "react"
import { Search, Plus, ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { NumbersTable } from "@/components/numbers-table"
import { AddNumberDialog } from "@/components/add-number-dialog"
import { getGroupStats } from "@/lib/api/stats"
import type { Group, GroupStats } from "@/lib/types"

interface NumbersManagementPageProps {
  group: Group
}

export function NumbersManagementPage({ group }: NumbersManagementPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [groupStats, setGroupStats] = useState<GroupStats | null>(null)

  useEffect(() => {
    loadGroupStats()
  }, [group.id])

  const loadGroupStats = async () => {
    try {
      const stats = await getGroupStats()
      const groupStat = stats.find((stat) => stat.group_id === group.id)
      setGroupStats(groupStat || null)
    } catch (error) {
      console.error("Error loading group stats:", error)
      // Definir stats padrão em caso de erro
      setGroupStats({
        group_id: group.id,
        group_name: group.name,
        group_slug: group.slug,
        total_numbers: 0,
        active_numbers: 0,
        total_clicks: 0,
        clicks_today: 0,
        clicks_this_week: 0,
        clicks_this_month: 0,
        last_click_at: null,
      })
    }
  }

  const handleNumbersChange = () => {
    loadGroupStats()
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/grupos"
                className="flex items-center gap-2 text-lime-400 hover:text-lime-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lime-400">
                  <Zap className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {groupStats?.total_numbers || 0} números
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {groupStats?.active_numbers || 0} ativos
                    </Badge>
                    <span className="text-sm text-slate-400">•</span>
                    <span className="text-sm text-slate-400">{groupStats?.total_clicks || 0} cliques</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-lime-400 hover:bg-lime-500 text-black font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Número
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Card className="bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Números do WhatsApp</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar números..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-lime-400"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <NumbersTable groupId={group.id} searchTerm={searchTerm} onNumbersChange={handleNumbersChange} />
          </CardContent>
        </Card>
      </main>

      <AddNumberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        groupId={group.id}
        onNumberAdded={handleNumbersChange}
      />
    </div>
  )
}
