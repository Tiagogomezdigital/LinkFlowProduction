"use client"

import { Plus, Zap, Grid, List } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GroupsTable } from "@/components/groups-table"
import { useState } from "react"
import { GroupsCards } from "@/components/groups-cards"

export function GroupsListPage() {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lime-400">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Grupos</h1>
                <p className="text-sm text-slate-400">Gerencie seus grupos de WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild className="bg-lime-400 hover:bg-lime-500 text-black font-medium">
              <Link href="/admin/grupos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Grupo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Card className="bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Lista de Grupos</CardTitle>
          </CardHeader>
          <CardContent>{viewMode === "table" ? <GroupsTable /> : <GroupsCards />}</CardContent>
        </Card>
      </main>
    </div>
  )
}
