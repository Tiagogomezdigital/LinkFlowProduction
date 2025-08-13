"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Grid3X3, List } from "lucide-react"
import Link from "next/link"
import { GroupsTable } from "@/components/groups-table"
import { GroupsCards } from "@/components/groups-cards"
import { Breadcrumb } from "@/components/breadcrumb"
import { AddGroupDialog } from "@/components/add-group-dialog"

export default function GroupsPage() {
  // Alterado de "table" para "cards" como padrão
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards")
  const [searchTerm, setSearchTerm] = useState("")
  const [addGroupOpen, setAddGroupOpen] = useState(false)

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Grupos", href: "/admin/grupos", active: true },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800">
        <nav className="text-sm text-slate-500 mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </nav>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Grupos</h1>
            <p className="text-base text-slate-400 font-normal leading-relaxed">Gerencie seus grupos de WhatsApp</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-500" onClick={() => setAddGroupOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Lista de Grupos</h2>
              <p className="text-sm text-slate-400">Todos os grupos cadastrados no sistema</p>
            </div>

            {/* Toggle View Mode */}
            <div className="flex gap-2 bg-slate-900 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-2 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-lime-400 text-black hover:bg-lime-500"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4 mr-2" />
                Tabela
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-2 rounded-md transition-colors ${
                  viewMode === "cards"
                    ? "bg-lime-400 text-black hover:bg-lime-500"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => setViewMode("cards")}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Cards
              </Button>
            </div>
          </div>

          {/* Adicionando campo de pesquisa */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Pesquisar grupos..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Conditional Rendering */}
          {viewMode === "table" ? <GroupsTable /> : <GroupsCards searchTerm={searchTerm} />}
        </div>

        <AddGroupDialog 
          open={addGroupOpen} 
          onOpenChange={setAddGroupOpen} 
          onGroupAdded={() => {
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }} 
        />
      </div>
    </div>
  )
}
