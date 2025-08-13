"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getFilteredStats } from "@/lib/api/stats"
import { toast } from "sonner"

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
  const [quickSelect, setQuickSelect] = useState<string>("last7days")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isGroupFilterOpen, setIsGroupFilterOpen] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [groupSearch, setGroupSearch] = useState("")

  const quickOptions = [
    { value: "today", label: "Hoje", days: 0 },
    { value: "yesterday", label: "Ontem", days: 1 },
    { value: "specific_date", label: "Data específica", days: -2 },
    { value: "last7days", label: "Últimos 7 dias", days: 7 },
    { value: "last30days", label: "Últimos 30 dias", days: 30 },
    { value: "last90days", label: "Últimos 90 dias", days: 90 },
    { value: "custom", label: "Período personalizado", days: -1 },
  ]

  const loadFilteredStats = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return
    
    // Exigir que pelo menos um grupo seja selecionado
    if (selectedGroups.length === 0) {
      // Limpar stats se não há grupos selecionados
      onFiltersChange({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        groupIds: undefined,
        stats: undefined,
      })
      return
    }

    setIsLoadingStats(true)
    try {
      const stats = await getFilteredStats(
        dateRange.from,
        dateRange.to,
        selectedGroups
      )

      onFiltersChange({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        groupIds: selectedGroups,
        stats,
      })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Erro ao carregar estatísticas:", error)
      }
      toast.error("Erro ao carregar estatísticas")
    } finally {
      setIsLoadingStats(false)
    }
  }, [dateRange.from, dateRange.to, selectedGroups])

  // Carregar dados automaticamente quando o componente for montado
  useEffect(() => {
    if (dateRange.from && dateRange.to && selectedGroups.length > 0) {
      loadFilteredStats()
    }
  }, []) // Executar apenas uma vez na montagem

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      loadFilteredStats()
    } else {
      // Se não houver datas válidas, limpar stats
      onFiltersChange({
        dateFrom: dateRange.from || new Date(),
        dateTo: dateRange.to || new Date(),
        groupIds: undefined,
        stats: undefined,
      })
    }
  }, [dateRange, selectedGroups])

  const handleQuickSelect = (value: string) => {
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
        {isLoadingStats && (
          <span className="text-sm text-slate-400 ml-2">(Atualizando...)</span>
        )}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Período */}
          <div className="flex flex-col w-full gap-2">
            <label className="text-base font-medium text-slate-300">Período</label>
            <Select value={quickSelect} onValueChange={handleQuickSelect}>
              <SelectTrigger className="w-full border-slate-600 bg-[#111729] text-slate-300 focus:ring-2 focus:ring-lime-400 transition-all">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent className="bg-[#111729] border-slate-600">
                {quickOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-slate-300 focus:bg-slate-600">
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
                      "w-full justify-start text-left font-normal border-slate-600 bg-[#111729] text-slate-300 hover:bg-slate-600 mt-2 focus:ring-2 focus:ring-lime-400 transition-all",
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
          {/* Grupos */}
          <div className="flex flex-col w-full gap-2">
            <label className="text-base font-medium text-slate-300">Grupos</label>
            <div className="relative w-full">
              <Button
                variant="outline"
                className="w-full border-slate-600 bg-[#111729] text-slate-300 flex justify-between items-center focus:ring-2 focus:ring-lime-400 transition-all"
                onClick={() => setIsGroupFilterOpen((open) => !open)}
                type="button"
              >
                {selectedGroups.length === 0
                  ? "Selecione"
                  : `${selectedGroups.length} grupo${selectedGroups.length > 1 ? 's' : ''} selecionado${selectedGroups.length > 1 ? 's' : ''}`}
              </Button>
              {isGroupFilterOpen && (
                <div
                  className="absolute z-20 mt-2 w-full max-h-72 overflow-y-auto bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-4"
                  tabIndex={0}
                  onBlur={(e) => {
                    // Fecha o modal se o foco sair do container
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setIsGroupFilterOpen(false)
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    placeholder="Buscar grupo..."
                    className="w-full mb-2 px-2 py-1 rounded bg-[#111729] text-slate-200 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2 mb-2">
                    <Button size="sm" variant="secondary" onClick={selectAllGroups} type="button">Todos</Button>
                    <Button size="sm" variant="ghost" onClick={clearGroupFilters} type="button">Limpar</Button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {groups
                      .filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
                      .map(g => (
                        <label key={g.id} className="flex items-center gap-2 cursor-pointer text-slate-200">
                          <Checkbox
                            checked={selectedGroups.includes(g.id)}
                            onCheckedChange={() => handleGroupToggle(g.id)}
                          />
                          {g.name}
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}