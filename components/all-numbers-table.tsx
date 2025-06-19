"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Trash2, MoreHorizontal, Phone, Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { formatPhoneNumber, formatTimeAgo } from "@/lib/utils"
import { getAllNumbers, updateNumber, deleteNumber } from "@/lib/api/numbers"
import type { WhatsAppNumber } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AllNumbersTableProps {
  searchTerm: string
}

export function AllNumbersTable({ searchTerm }: AllNumbersTableProps) {
  const { toast } = useToast()
  const [numbers, setNumbers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [numberToDelete, setNumberToDelete] = useState<WhatsAppNumber | null>(null)
  const [updatingNumbers, setUpdatingNumbers] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados para edição de número
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [numberToEdit, setNumberToEdit] = useState<WhatsAppNumber | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    is_active: true,
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadNumbers()
  }, [])

  const loadNumbers = async () => {
    try {
      setIsLoading(true)
      const data = await getAllNumbers()
      console.log("Números carregados:", data)
      setNumbers(data)
    } catch (error) {
      console.error("Error loading numbers:", error)
      toast({
        title: "Erro ao carregar números",
        description: "Não foi possível carregar a lista de números.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função de busca simplificada e robusta
  const filteredNumbers = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      return numbers
    }

    const searchLower = searchTerm.toLowerCase().trim()
    console.log("Filtrando com termo:", searchLower)

    const filtered = numbers.filter((number) => {
      // Campos para buscar
      const phoneClean = number.phone?.replace(/\D/g, "") || ""
      const phoneFormatted = formatPhoneNumber(number.phone) || ""
      const numberName = number.name?.toLowerCase() || ""
      const groupName = number.groups?.name?.toLowerCase() || ""
      const groupDescription = number.groups?.description?.toLowerCase() || ""
      const groupSlug = number.groups?.slug?.toLowerCase() || ""

      // Verificar se o termo de busca está em algum dos campos
      const matches =
        phoneClean.includes(searchLower.replace(/\D/g, "")) ||
        phoneFormatted.toLowerCase().includes(searchLower) ||
        numberName.includes(searchLower) ||
        groupName.includes(searchLower) ||
        groupDescription.includes(searchLower) ||
        groupSlug.includes(searchLower)

      if (matches) {
        console.log("Match encontrado:", {
          id: number.id,
          phone: number.phone,
          name: number.name,
          group: number.groups?.name,
        })
      }

      return matches
    })

    console.log(`Filtrados: ${filtered.length} de ${numbers.length} números`)
    return filtered
  }, [numbers, searchTerm])

  const handleToggleActive = async (numberId: string, isActive: boolean) => {
    setUpdatingNumbers((prev) => new Set(prev).add(numberId))

    try {
      await updateNumber(numberId, { is_active: isActive })
      setNumbers((prev) => prev.map((number) => (number.id === numberId ? { ...number, is_active: isActive } : number)))

      toast({
        title: isActive ? "Número ativado" : "Número desativado",
        description: `O número foi ${isActive ? "ativado" : "desativado"} com sucesso.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error updating number:", error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do número.",
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

  const handleDeleteClick = (number: WhatsAppNumber) => {
    setNumberToDelete(number)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!numberToDelete) return

    try {
      setIsDeleting(true)
      await deleteNumber(numberToDelete.id)
      setNumbers((prev) => prev.filter((number) => number.id !== numberToDelete.id))

      toast({
        title: "Número excluído",
        description: "O número foi removido com sucesso.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting number:", error)
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

  // Funções para edição de número
  const handleEditClick = (number: WhatsAppNumber) => {
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
      await updateNumber(numberToEdit.id, {
        name: editForm.name,
        phone: editForm.phone,
        is_active: editForm.is_active,
      })

      // Atualizar a lista local
      setNumbers((prev) =>
        prev.map((number) =>
          number.id === numberToEdit.id
            ? {
                ...number,
                name: editForm.name,
                phone: editForm.phone,
                is_active: editForm.is_active,
              }
            : number,
        ),
      )

      toast({
        title: "Número atualizado",
        description: "O número foi atualizado com sucesso.",
        variant: "success",
      })
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating number:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o número.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="ds-table-container">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400 mx-auto"></div>
          <p className="text-slate-400 mt-2">Carregando números...</p>
        </div>
      </div>
    )
  }

  if (filteredNumbers.length === 0 && !searchTerm) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <Phone className="mx-auto h-12 w-12 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Nenhum número cadastrado</h3>
        <p className="text-slate-400 mb-4">Comece adicionando números de WhatsApp nos grupos.</p>
      </div>
    )
  }

  if (filteredNumbers.length === 0 && searchTerm) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Nenhum número encontrado para "{searchTerm}"</p>
        <p className="text-slate-500 text-sm mt-2">Tente buscar por: número, nome, grupo ou descrição</p>
      </div>
    )
  }

  return (
    <>
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
              {filteredNumbers.map((number) => (
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
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="ds-modal-container max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir número</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir o número {numberToDelete && formatPhoneNumber(numberToDelete.phone)}? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="ds-button-outline" disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
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

      {/* Edit Dialog */}
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
                  placeholder="Nome para identificação"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+55 (11) 99999-9999"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={editForm.is_active}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                  className="data-[state=checked]:bg-lime-400"
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                disabled={isEditing}
              >
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
    </>
  )
}
