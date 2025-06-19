"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, X, Phone, Edit, Trash2, MoreHorizontal, Loader2, Filter } from "lucide-react"
import Link from "next/link"
import { Breadcrumb } from "@/components/breadcrumb"
import { useToast } from "@/hooks/use-toast"
import { formatPhoneNumber, formatTimeAgo } from "@/lib/utils"
import { getAllNumbers, updateNumber, deleteNumber } from "@/lib/api/numbers"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getGroups } from "@/lib/api/groups"
import type { Group } from "@/lib/types"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command"
import { ChevronsUpDown, Check } from "lucide-react"
import { AddGlobalNumberDialog } from "@/components/add-global-number-dialog"

export default function NumbersPageClient() {
  const { toast } = useToast()

  // Estados principais
  const [numbers, setNumbers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [groups, setGroups] = useState<Group[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [isLoading, setIsLoading] = useState(true)
  const [openGroups, setOpenGroups] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Estados para ações
  const [updatingNumbers, setUpdatingNumbers] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [numberToDelete, setNumberToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados para edição
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [numberToEdit, setNumberToEdit] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "", is_active: true })
  const [isEditing, setIsEditing] = useState(false)

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Números", href: "/admin/numeros", active: true },
  ]

  // Carregar números
  useEffect(() => {
    loadNumbers()
  }, [])

  // Carregar grupos para filtro
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await getGroups()
        setGroups(data)
      } catch (error) {
        console.error("Erro ao carregar grupos:", error)
      }
    }
    loadGroups()
  }, [])

  const loadNumbers = async () => {
    try {
      setIsLoading(true)
      const data = await getAllNumbers()
      setNumbers(data)
    } catch (error) {
      console.error("Erro ao carregar números:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os números.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar números - FUNÇÃO SIMPLES E DIRETA
  const filteredNumbers = numbers.filter((number) => {
    if (!searchTerm.trim() && selectedGroups.length === 0 && statusFilter === "all") return true

    const search = searchTerm.toLowerCase()
    const phone = number.phone?.toLowerCase() || ""
    const name = number.name?.toLowerCase() || ""
    const groupName = number.groups?.name?.toLowerCase() || ""

    const matchesSearch = phone.includes(search) || name.includes(search) || groupName.includes(search)

    const matchesGroup =
      selectedGroups.length === 0 || selectedGroups.includes(number.group_id)

    const matchesStatus =
      statusFilter === "all" || (statusFilter === "active" ? number.is_active : !number.is_active)

    return matchesSearch && matchesGroup && matchesStatus
  })

  // Calcular paginação
  const totalPages = Math.max(1, Math.ceil(filteredNumbers.length / pageSize))
  const currentPageNumbers = filteredNumbers.slice((page - 1) * pageSize, page * pageSize)

  // Se termo de busca muda, resetar página para 1
  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedGroups, statusFilter])

  // Ações
  const handleToggleActive = async (numberId: string, isActive: boolean) => {
    setUpdatingNumbers((prev) => new Set(prev).add(numberId))
    try {
      await updateNumber(numberId, { is_active: isActive })
      setNumbers((prev) => prev.map((num) => (num.id === numberId ? { ...num, is_active: isActive } : num)))
      toast({
        title: isActive ? "Número ativado" : "Número desativado",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingNumbers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(numberId)
        return newSet
      })
    }
  }

  const handleDeleteClick = (number: any) => {
    setNumberToDelete(number)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!numberToDelete) return
    try {
      setIsDeleting(true)
      await deleteNumber(numberToDelete.id)
      setNumbers((prev) => prev.filter((num) => num.id !== numberToDelete.id))
      toast({
        title: "Número excluído",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o número.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setNumberToDelete(null)
    }
  }

  const handleEditClick = (number: any) => {
    setNumberToEdit(number)
    setEditForm({
      name: number.name || "",
      phone: number.phone,
      is_active: number.is_active,
    })
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numberToEdit) return
    try {
      setIsEditing(true)
      await updateNumber(numberToEdit.id, editForm)
      setNumbers((prev) => prev.map((num) => (num.id === numberToEdit.id ? { ...num, ...editForm } : num)))
      toast({
        title: "Número atualizado",
        variant: "default",
      })
      setEditDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o número.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800">
        <nav className="text-sm text-slate-500 mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </nav>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Números</h1>
            <p className="text-base text-slate-400 font-normal leading-relaxed">Gestão de números de WhatsApp</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600" asChild>
              <Link href="/admin/grupos">Gerenciar por Grupo</Link>
            </Button>
            <Button className="bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-500" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Número
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 lg:p-8">
          {/* Cabeçalho e Filtros */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-lime-400" />
                <h2 className="text-2xl font-semibold text-white">
                  Números WhatsApp ({numbers.length})
                </h2>
              </div>
              <Button className="bg-lime-400 text-black hover:bg-lime-500" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Número
              </Button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar número, nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-white placeholder-slate-400"
                />
              </div>

              {/* Grupo Combobox com multi-seleção */}
              <Popover open={openGroups} onOpenChange={setOpenGroups}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openGroups}
                    className="w-full justify-between bg-slate-900 border-slate-700 text-slate-300"
                  >
                    {selectedGroups.length === 0
                      ? "Todos os grupos"
                      : selectedGroups.length === 1
                      ? groups.find((g) => g.id === selectedGroups[0])?.name ?? "Grupo"
                      : `${selectedGroups.length} grupos`}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-slate-800 border-slate-700 w-[300px]">
                  <Command>
                    <CommandInput placeholder="Procurar grupo..." className="text-sm bg-slate-900" />
                    <CommandEmpty className="py-2 text-center text-sm">Nenhum grupo encontrado.</CommandEmpty>
                    <CommandList>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedGroups([])
                          setOpenGroups(false)
                        }}
                        className="flex gap-2 text-sm"
                      >
                        {selectedGroups.length === 0 && <Check className="h-4 w-4 text-lime-400" />}
                        <span>Todos os grupos</span>
                      </CommandItem>
                      {groups.map((g) => (
                        <CommandItem
                          key={g.id}
                          value={g.name}
                          onSelect={() => {
                            setSelectedGroups((prev) => {
                              if (prev.includes(g.id)) {
                                return prev.filter((id) => id !== g.id)
                              }
                              return [...prev, g.id]
                            })
                          }}
                          className="flex gap-2 text-sm"
                        >
                          {selectedGroups.includes(g.id) && <Check className="h-4 w-4 text-lime-400" />}
                          <span>{g.name}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Status */}
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                <SelectTrigger className="w-full bg-slate-900 border-slate-700 text-slate-300">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>

              {/* Limpar Filtros */}
              <Button
                variant="ghost"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedGroups([])
                  setStatusFilter("all")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Tabela */}
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400 mx-auto"></div>
              <p className="text-slate-400 mt-2">Carregando números...</p>
            </div>
          ) : filteredNumbers.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {searchTerm ? "Nenhum número encontrado" : "Nenhum número cadastrado"}
              </h3>
              <p className="text-slate-400">
                {searchTerm
                  ? `Nenhum resultado para "${searchTerm}"`
                  : "Comece adicionando números de WhatsApp nos grupos."}
              </p>
            </div>
          ) : (
            <div className="ds-table-container">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="ds-table-header-sticky">
                    <tr>
                      <th className="ds-table-header text-left py-4 px-6">Número</th>
                      <th className="ds-table-header text-left py-4 px-6">Grupo</th>
                      <th className="ds-table-header text-left py-4 px-6">Status</th>
                      <th className="ds-table-header text-left py-4 px-6">Último Uso</th>
                      <th className="ds-table-header text-right py-4 px-6">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageNumbers.map((number) => (
                      <tr key={number.id} className="ds-table-row">
                        <td className="ds-table-cell">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-lime-400" />
                            <div>
                              <div className="ds-phone-number">{formatPhoneNumber(number.phone)}</div>
                              {number.name && <div className="text-sm text-slate-400">{number.name}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="ds-table-cell">
                          <span className="ds-group-associated">{number.groups?.name || "Grupo não encontrado"}</span>
                        </td>
                        <td className="ds-table-cell">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={number.is_active}
                              onCheckedChange={(checked) => handleToggleActive(number.id, checked)}
                              disabled={updatingNumbers.has(number.id)}
                              className="data-[state=checked]:bg-lime-400 scale-110"
                            />
                            <span
                              className={
                                number.is_active
                                  ? "ds-status-active ds-status-badge px-2 py-1 rounded"
                                  : "ds-status-inactive ds-status-badge px-2 py-1 rounded"
                              }
                            >
                              {number.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </td>
                        <td className="ds-table-cell">
                          <span className="ds-last-used">
                            {number.last_used_at ? formatTimeAgo(new Date(number.last_used_at)) : "Nunca usado"}
                          </span>
                        </td>
                        <td className="ds-table-cell text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="ds-button-icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem
                                className="text-slate-300 focus:bg-slate-700 focus:text-white"
                                onClick={() => handleEditClick(number)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 focus:bg-red-900 focus:text-red-300"
                                onClick={() => handleDeleteClick(number)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Controles de Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 px-4 py-2 border-t border-slate-700 text-slate-400">
                    <span className="text-sm">
                      Página {page} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diálogos */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="ds-modal-container max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir número</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir o número {numberToDelete && formatPhoneNumber(numberToDelete.phone)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="ds-button-outline" disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Número</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome (opcional)</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Número</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editForm.is_active}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                  className="data-[state=checked]:bg-lime-400"
                />
                <Label>Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isEditing}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-lime-400 text-black hover:bg-lime-500" disabled={isEditing}>
                {isEditing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AddGlobalNumberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onNumberAdded={loadNumbers}
      />
    </div>
  )
}
