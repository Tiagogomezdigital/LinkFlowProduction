"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Users,
  MousePointer,
  ChevronDown,
  ChevronUp,
  Plus,
  Phone,
  BarChart3,
  Loader2,
} from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getGroups, deleteGroup } from "@/lib/api/groups"
import { getGroupStats } from "@/lib/api/stats"
import { getNumbersByGroupId } from "@/lib/api/numbers"
import { AddNumberToGroupDialog } from "@/components/add-number-to-group-dialog"
import { ENV_CONFIG } from "@/lib/env-config"
import type { Group, GroupStats, WhatsAppNumber } from "@/lib/types"
import Link from "next/link"

interface GroupsCardsProps {
  searchTerm?: string
}

export function GroupsCards({ searchTerm = "" }: GroupsCardsProps) {
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
  const [groupStats, setGroupStats] = useState<GroupStats[]>([])
  const [groupNumbers, setGroupNumbers] = useState<Record<string, WhatsAppNumber[]>>({})
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [loadingNumbers, setLoadingNumbers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addNumberDialogOpen, setAddNumberDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [selectedGroupForNumber, setSelectedGroupForNumber] = useState<Group | null>(null)
  const [confirmSlug, setConfirmSlug] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  // Filtrar grupos quando o termo de pesquisa mudar
  useEffect(() => {
    if (!searchTerm) {
      setFilteredGroups(groups)
      return
    }

    const filtered = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredGroups(filtered)
  }, [searchTerm, groups])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [groupsData, statsData] = await Promise.all([getGroups(), getGroupStats()])
      setGroups(groupsData)
      setFilteredGroups(groupsData)
      setGroupStats(statsData)
    } catch (error) {
      console.error("Error loading groups:", error)
      setGroups([])
      setFilteredGroups([])
      setGroupStats([])
      toast({
        title: "Erro ao carregar grupos",
        description: "Não foi possível carregar a lista de grupos. Verifique sua conexão.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadGroupNumbers = async (groupId: string) => {
    if (groupNumbers[groupId] || loadingNumbers.has(groupId)) return

    try {
      setLoadingNumbers((prev) => new Set([...prev, groupId]))
      console.log("Loading numbers for group:", groupId)

      const numbers = await getNumbersByGroupId(groupId)
      console.log("Numbers loaded:", numbers)

      setGroupNumbers((prev) => ({ ...prev, [groupId]: numbers }))
    } catch (error) {
      console.error("Error loading group numbers:", error)
      toast({
        title: "Erro ao carregar números",
        description: "Não foi possível carregar os números do grupo.",
        variant: "destructive",
      })
    } finally {
      setLoadingNumbers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(groupId)
        return newSet
      })
    }
  }

  const toggleExpanded = async (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
      await loadGroupNumbers(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const handleDeleteClick = (group: Group) => {
    setGroupToDelete(group)
    setConfirmSlug("")
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return

    // Verificar se o slug digitado corresponde ao slug do grupo
    if (confirmSlug !== groupToDelete.slug) {
      toast({
        title: "Slug incorreto",
        description: "O slug digitado não corresponde ao slug do grupo.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeleting(true)
      await deleteGroup(groupToDelete.id)
      await loadData()
      toast({
        title: "Grupo excluído",
        description: `O grupo "${groupToDelete.name}" foi excluído com sucesso.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting group:", error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o grupo. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
      setConfirmSlug("")
    }
  }

  const handleAddNumberClick = (group: Group) => {
    setSelectedGroupForNumber(group)
    setAddNumberDialogOpen(true)
  }

  const handleNumberAdded = async () => {
    await loadData()

    if (selectedGroupForNumber && expandedGroups.has(selectedGroupForNumber.id)) {
      setGroupNumbers((prev) => {
        const newNumbers = { ...prev }
        delete newNumbers[selectedGroupForNumber.id]
        return newNumbers
      })
      await loadGroupNumbers(selectedGroupForNumber.id)
    }
  }

  const copyPublicLink = (slug: string) => {
    const publicUrl = `${ENV_CONFIG.SITE_URL}/l/${slug}`
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: "Link copiado!",
      description: "O link público foi copiado para a área de transferência.",
      variant: "default",
    })
  }

  const openPublicLink = (slug: string) => {
    const publicUrl = `${ENV_CONFIG.SITE_URL}/l/${slug}`
    window.open(publicUrl, "_blank", "noopener,noreferrer")
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "")

    // Se tem 13 dígitos (55 + DDD + número)
    if (cleaned.length === 13 && cleaned.startsWith("55")) {
      const ddd = cleaned.substring(2, 4)
      const number = cleaned.substring(4)
      const firstPart = number.substring(0, 5)
      const secondPart = number.substring(5)
      return `+55 (${ddd}) ${firstPart}-${secondPart}`
    }

    // Se tem 11 dígitos (DDD + número)
    if (cleaned.length === 11) {
      const ddd = cleaned.substring(0, 2)
      const number = cleaned.substring(2)
      const firstPart = number.substring(0, 5)
      const secondPart = number.substring(5)
      return `+55 (${ddd}) ${firstPart}-${secondPart}`
    }

    // Retorna o número original se não conseguir formatar
    return phone
  }

  const getStatsForGroup = (groupId: string) => {
    const stats = groupStats.find((stat) => stat.group_id === groupId)
    console.log(`[${new Date().toISOString()}] 📊 Stats para grupo ${groupId}:`, stats)
    return stats
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
            <CardHeader>
              <div className="h-6 bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (filteredGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Users className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {searchTerm ? "Nenhum grupo encontrado para esta pesquisa" : "Nenhum grupo encontrado"}
        </h3>
        <p className="text-slate-400 mb-6">
          {searchTerm ? "Tente outros termos de pesquisa." : "Comece criando seu primeiro grupo de WhatsApp."}
        </p>
        {!searchTerm && (
          <Link href="/admin/grupos/novo">
            <Button className="bg-lime-400 hover:bg-lime-500 text-black px-6 py-3 rounded-lg font-semibold">
              Criar Primeiro Grupo
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGroups.map((group) => {
          const stats = getStatsForGroup(group.id)
          const publicUrl = `${ENV_CONFIG.SITE_URL}/l/${group.slug}`
          const isExpanded = expandedGroups.has(group.id)
          const numbers = groupNumbers[group.id] || []
          const isLoadingNumbers = loadingNumbers.has(group.id)

          return (
            <Card
              key={group.id}
              className="bg-slate-800 border border-slate-700 rounded-xl hover:scale-105 transition-all duration-200"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-white mb-2">{group.name}</CardTitle>
                    <p className="text-sm text-slate-400">{group.description || "Sem descrição"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                      asChild
                    >
                      <Link href={`/admin/grupos/novo?id=${group.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                      onClick={() => handleDeleteClick(group)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Badges Info */}
                <div className="inline-flex gap-2 mb-4">
                  <Badge
                    variant={group.is_active ? "default" : "secondary"}
                    className={
                      group.is_active
                        ? "bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs"
                        : "bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs"
                    }
                  >
                    {group.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge className="bg-slate-600/50 text-slate-300 px-3 py-1 rounded-full text-xs">
                    {stats?.total_numbers || 0} números
                  </Badge>
                </div>

                {/* Slug Badge */}
                <div className="mb-4">
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs px-3 py-1">
                    Slug: {group.slug}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Links Section */}
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-300">Link Público</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-lime-400 hover:text-lime-500 hover:bg-slate-700"
                        onClick={() => copyPublicLink(group.slug)}
                        title="Copiar link"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-white"
                        onClick={() => openPublicLink(group.slug)}
                        title="Abrir link"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-mono break-all">{publicUrl}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Números Ativos</p>
                      <p className="text-sm font-medium text-white">{stats?.active_numbers || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Total Cliques</p>
                      <p className="text-sm font-medium text-white">{stats?.total_clicks || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-4">
                  <Button
                    size="sm"
                    className="bg-lime-400 text-black hover:bg-lime-500 flex-1"
                    onClick={() => handleAddNumberClick(group)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Número
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    asChild
                  >
                    <Link href={`/admin/grupos/${group.id}/analytics`} title="Ver Analytics">
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Expandable Numbers Section */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-400 hover:text-white hover:bg-slate-700 justify-between"
                    onClick={() => toggleExpanded(group.id)}
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Ver números ({stats?.total_numbers || 0})
                    </span>
                    {isLoadingNumbers ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                      {isLoadingNumbers ? (
                        <div className="text-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto text-slate-400" />
                          <p className="text-xs text-slate-500 mt-2">Carregando números...</p>
                        </div>
                      ) : numbers.length > 0 ? (
                        numbers.map((number) => (
                          <div
                            key={number.id}
                            className="flex items-center justify-between p-3 bg-slate-900 rounded text-sm"
                          >
                            <div className="flex-1">
                              <p className="text-white font-mono text-sm">{formatPhoneNumber(number.phone)}</p>
                              {number.name && <p className="text-xs text-slate-400 mt-1">{number.name}</p>}
                            </div>
                            <Badge
                              className={
                                number.is_active
                                  ? "bg-green-500/20 text-green-400 text-xs"
                                  : "bg-red-500/20 text-red-400 text-xs"
                              }
                            >
                              {number.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-4">Nenhum número cadastrado</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir grupo</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir o grupo "{groupToDelete?.name}"? Esta ação não pode ser desfeita e todos os
              números e estatísticas associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <p className="text-sm text-slate-300 mb-2">
              Para confirmar, digite o slug do grupo: <span className="font-mono font-bold">{groupToDelete?.slug}</span>
            </p>
            <Input
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              placeholder="Digite o slug do grupo"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={!groupToDelete || confirmSlug !== groupToDelete?.slug || isDeleting}
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

      {/* Add Number Dialog */}
      <AddNumberToGroupDialog
        groupId={selectedGroupForNumber?.id || ""}
        groupName={selectedGroupForNumber?.name || ""}
        isOpen={addNumberDialogOpen}
        onClose={() => {
          setAddNumberDialogOpen(false)
          setSelectedGroupForNumber(null)
        }}
        onNumberAdded={handleNumberAdded}
      />
    </>
  )
}
