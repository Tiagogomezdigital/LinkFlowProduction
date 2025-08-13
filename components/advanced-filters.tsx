"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Filter, Search } from "lucide-react"
import { getFilteredStats } from "@/lib/api/stats"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
// Imports removidos - não carregamos mais estatísticas

interface Group {
  id: string
  name: string
  slug: string
  clicks_count?: number
}

interface AdvancedFiltersProps {
  groups: Group[]
  onFiltersChange: (filters: {
    dateFrom: Date
    dateTo: Date
    groupIds?: string[]
    stats?: {
      dailyClicks: Array<{
        date: string
        clicks: number
      }>
      groupClicks: Array<{
        group_id: string
        group_name: string
        group_slug: string
        clicks: number
      }>
    }
  }) => void
  onExport: (format: "csv" | "json", type: "summary" | "detailed" | "both") => void
  isLoading?: boolean
}

export function AdvancedFilters({ groups, onFiltersChange, onExport, isLoading }: AdvancedFiltersProps) {
  // Inicializar com últimos 7 dias por padrão
  const now = new Date()
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfDay(subDays(todayLocal, 6)), // Últimos 7 dias
    to: endOfDay(todayLocal),
  })
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [quickSelect, setQuickSelect] = useState<string>("yesterday")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isGroupFilterOpen, setIsGroupFilterOpen] = useState(false)
  const [groupSearch, setGroupSearch] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(false)

  const quickOptions = [
    { value: "today", label: "Hoje", days: 0 },
    { value: "yesterday", label: "Ontem", days: 1 },
    { value: "last7days", label: "Últimos 7 Dias", days: 7 },
    { value: "specific_date", label: "Escolher Dia", days: -2 },
    { value: "custom", label: "Escolher Período", days: -1 },
  ]

  // Função para buscar dados filtrados com integridade
  const loadFilteredStats = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Por favor, selecione um período válido')
      return
    }

    setIsLoadingData(true)
    try {
      const result = await getFilteredStats(
        dateRange.from,
        dateRange.to,
        selectedGroups.length > 0 ? selectedGroups : undefined
      )

      // Verificar se os dados foram carregados com sucesso
      if (result && (result.dailyClicks.length > 0 || result.groupClicks.length > 0)) {
        onFiltersChange({
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          groupIds: selectedGroups.length > 0 ? selectedGroups : undefined,
          stats: result
        })
        toast.success('Dados carregados com sucesso!')
      } else {
        // Mesmo sem dados, notificar os filtros para limpar resultados anteriores
        onFiltersChange({
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          groupIds: selectedGroups.length > 0 ? selectedGroups : undefined,
          stats: result
        })
        toast.info('Nenhum dado encontrado para o período selecionado')
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar dados do servidor')
    } finally {
      setIsLoadingData(false)
    }
  }

  // Notificar mudanças nos filtros sem carregar estatísticas automaticamente
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      onFiltersChange({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        groupIds: selectedGroups.length > 0 ? selectedGroups : undefined,
        stats: undefined, // Não carregar estatísticas automaticamente
      })
    }
  }, [dateRange, selectedGroups, onFiltersChange])

  const handleQuickSelectChange = (value: string) => {
    setQuickSelect(value)
    const option = quickOptions.find((opt) => opt.value === value)
    if (!option || value === "custom" || value === "specific_date") return

    // Garantir que a data de hoje seja sempre local
    const now = new Date()
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (value === "today") {
      setDateRange({
        from: startOfDay(todayLocal),
        to: endOfDay(todayLocal),
      })
    } else if (value === "yesterday") {
      const yesterdayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      setDateRange({
        from: startOfDay(yesterdayLocal),
        to: endOfDay(yesterdayLocal),
      })
    } else {
      setDateRange({
        from: startOfDay(subDays(todayLocal, option.days - 1)),
        to: endOfDay(todayLocal),
      })
    }
  }

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const clearGroupFilters = () => {
    setSelectedGroups([])
  }

  const selectAllGroups = () => {
    setSelectedGroups(groups.map((g) => g.id))
  }

  return (
    <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2 text-white text-xl font-semibold mb-2">
        <Filter className="h-5 w-5" />
        Filtros Avançados
      </div>
      <div className="w-full">
        {/* Mensagem informativa quando nenhum grupo está selecionado */}
        {selectedGroups.length === 0 && (
          <div className="mb-4 p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
            <p className="text-amber-300 text-sm">
              💡 <strong>Dica:</strong> Selecione pelo menos um grupo para visualizar os relatórios de cliques.
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Filtros de Data e Grupos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Filtro de Data */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período
              </label>
              <Select value={quickSelect} onValueChange={handleQuickSelectChange}>
                <SelectTrigger className="w-full border-slate-600 bg-slate-700/50 text-slate-300 focus:ring-2 focus:ring-lime-400 transition-all hover:bg-slate-700">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {quickOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-slate-200 focus:bg-slate-600 hover:bg-slate-600">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(quickSelect === 'custom' || quickSelect === 'specific_date') && (
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700 focus:ring-2 focus:ring-lime-400 transition-all",
                        !dateRange.from && "text-slate-500",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        quickSelect === 'specific_date' ? (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        ) : dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        <span>{quickSelect === 'specific_date' ? 'Selecione uma data' : 'Selecione as datas'}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600" align="start">
                    {quickSelect === 'specific_date' ? (
                      <CalendarComponent
                        initialFocus
                        mode="single"
                        defaultMonth={dateRange.from}
                        selected={dateRange.from}
                        onSelect={(selected: Date | undefined) => {
                          if (selected) {
                            setDateRange({
                              from: startOfDay(selected),
                              to: endOfDay(selected),
                            })
                          }
                          setIsDatePickerOpen(false)
                        }}
                      />
                    ) : (
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(selected) => {
                          setDateRange({
                            from: selected?.from,
                            to: selected?.to,
                          })
                          setIsDatePickerOpen(false)
                        }}
                      />
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Filtro de Grupos */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Grupos
                {selectedGroups.length > 0 && (
                  <Badge variant="secondary" className="bg-lime-500/20 text-lime-400 border-lime-500/30">
                    {selectedGroups.length}
                  </Badge>
                )}
              </label>
              <div className="relative w-full">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 bg-slate-700/50 text-slate-300 flex justify-between items-center focus:ring-2 focus:ring-lime-400 transition-all hover:bg-slate-700"
                  onClick={() => setIsGroupFilterOpen((open) => !open)}
                  type="button"
                >
                  <span>
                    {selectedGroups.length === 0
                      ? "Todos os grupos"
                      : `${selectedGroups.length} grupo${selectedGroups.length > 1 ? 's' : ''} selecionado${selectedGroups.length > 1 ? 's' : ''}`}
                  </span>
                  <Filter className="h-4 w-4" />
                </Button>
                
                {isGroupFilterOpen && (
                  <div
                    className="absolute z-20 mt-2 w-full max-h-80 overflow-hidden bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
                    tabIndex={0}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsGroupFilterOpen(false)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header do dropdown */}
                    <div className="p-4 border-b border-slate-600">
                      <input
                        type="text"
                        placeholder="Buscar grupos..."
                        className="w-full px-3 py-2 rounded-md bg-slate-700 text-slate-200 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                        value={groupSearch}
                        onChange={e => setGroupSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={selectAllGroups} 
                          type="button"
                          className="bg-slate-600 hover:bg-slate-500 text-white"
                        >
                          Selecionar Todos
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={clearGroupFilters} 
                          type="button"
                          className="text-slate-300 hover:bg-slate-700"
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                    
                    {/* Lista de grupos */}
                    <div className="max-h-60 overflow-y-auto p-2">
                      <div className="space-y-1">
                        {groups
                          .filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
                          .map(g => (
                            <label 
                              key={g.id} 
                              className="flex items-center gap-3 p-3 cursor-pointer text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
                            >
                              <Checkbox
                                checked={selectedGroups.includes(g.id)}
                                onCheckedChange={() => handleGroupToggle(g.id)}
                                className="border-slate-500 data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">{g.name}</div>
                                <div className="text-xs text-slate-400 font-mono">/{g.slug}</div>
                              </div>
                            </label>
                          ))}
                      </div>
                      
                      {groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase())).length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum grupo encontrado</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Botão de Busca */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={loadFilteredStats}
              disabled={isLoadingData || !dateRange.from || !dateRange.to}
              size="lg"
              className="bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="h-5 w-5" />
              {isLoadingData ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  Carregando...
                </>
              ) : (
                'Buscar Dados'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}