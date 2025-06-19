"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { formatPhoneNumber, formatTimeAgo } from "@/lib/utils"
import { getNumbersByGroupId, updateNumber, deleteNumber } from "@/lib/api/numbers"
import type { WhatsAppNumber } from "@/lib/types"

interface NumbersTableProps {
  groupId: string
  searchTerm: string
  onNumbersChange?: () => void
}

export function NumbersTable({ groupId, searchTerm, onNumbersChange }: NumbersTableProps) {
  const { toast } = useToast()
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([])
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
  }, [groupId])

  const loadNumbers = async () => {
    try {
      setIsLoading(true)
      const data = await getNumbersByGroupId(groupId)
      console.log("Números carregados para o grupo:", data)
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

  // Filtrar números baseado no termo de busca
  const filteredNumbers = numbers.filter(
    (number) =>
      number.phone.includes(searchTerm.replace(/\D/g, "")) ||
      (number.name && number.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

      onNumbersChange?.()
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

      onNumbersChange?.()
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

      onNumbersChange?.()
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
      <div className="rounded-md border border-slate-700 overflow-hidden">
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
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Nenhum número cadastrado</h3>
        <p className="text-slate-400 mb-4">Comece adicionando o primeiro número do WhatsApp para este grupo.</p>
      </div>
    )
  }

  if (filteredNumbers.length === 0 && searchTerm) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Nenhum número encontrado para "{searchTerm}"</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="hover:bg-slate-900 border-slate-700">
                <TableHead className="text-slate-300 font-medium">Número</TableHead>
                <TableHead className="text-slate-300 font-medium">Status</TableHead>
                <TableHead className="text-slate-300 font-medium">Último Uso</TableHead>
                <TableHead className="text-slate-300 font-medium text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNumbers.map((number) => (
                <TableRow key={number.id} className="hover:bg-slate-800 border-slate-700">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{formatPhoneNumber(number.phone)}</div>
                      {number.name && <div className="text-sm text-slate-400">{number.name}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={number.is_active}
                        onCheckedChange={(checked) => handleToggleActive(number.id, checked)}
                        disabled={updatingNumbers.has(number.id)}
                        className="data-[state=checked]:bg-lime-400"
                      />
                      <Badge
                        variant={number.is_active ? "default" : "secondary"}
                        className={
                          number.is_active
                            ? "bg-green-900 text-green-300 border-green-800"
                            : "bg-red-900 text-red-300 border-red-800"
                        }
                      >
                        {number.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {number.last_used_at ? formatTimeAgo(new Date(number.last_used_at)) : "Nunca usado"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                        >
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir número</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir o número {numberToDelete && formatPhoneNumber(numberToDelete.phone)}? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
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
