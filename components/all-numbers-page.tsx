"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AllNumbersTable } from "@/components/all-numbers-table"

export function AllNumbersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Todos os Números</h2>
        </div>
        <Button className="bg-lime-400 text-black hover:bg-lime-500">+ Adicionar Número</Button>
      </div>

      {/* Barra de Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Buscar por número, nome, grupo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-slate-900 border-slate-600 text-white placeholder-slate-400 focus:border-lime-400"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Debug info - remover em produção */}
      {searchTerm && (
        <div className="text-xs text-slate-500 bg-slate-900 p-2 rounded">Buscando por: "{searchTerm}"</div>
      )}

      {/* Tabela de Números */}
      <AllNumbersTable searchTerm={searchTerm} />
    </div>
  )
}
