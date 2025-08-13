"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ExternalLink, Eye, Copy, RefreshCw } from "lucide-react"
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
import { getGroups, deleteGroup } from "@/lib/api/groups"
import { getGroupStats, debugGroupStats } from "@/lib/api/stats"
import { ENV_CONFIG } from "@/lib/env-config"
import type { Group, GroupStats } from "@/lib/types"
import Link from "next/link"

export function GroupsTable() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [groupStats, setGroupStats] = useState<GroupStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)

  useEffect(() => {
    loadData()
    // Debug inicial
    debugGroupStats()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      console.log("🔄 Carregando dados dos grupos...")

      const [groupsData, statsData] = await Promise.all([getGroups(), getGroupStats()])

      console.log("📋 Grupos carregados:", groupsData)
      console.log("📊 Stats carregadas:", statsData)

      setGroups(groupsData)
      setGroupStats(statsData)
    } catch (error) {
      console.error("❌ Erro ao carregar grupos:", error)
      setGroups([])
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

  const handleRefresh = async () => {
    console.log("🔄 Refresh manual iniciado...")
    await loadData()
    toast({
      title: "Dados atualizados",
      description: "As estatísticas foram recarregadas.",
      variant: "default",
    })
  }

  const handleDeleteClick = (group: Group) => {
    setGroupToDelete(group)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return

    try {
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
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
    }
  }

  const copyPublicLink = (slug: string) => {
    const publicUrl = `${ENV_CONFIG.SITE_URL}/l/${slug}`
    
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl)
      toast({
        title: "Link copiado!",
        description: "O link público foi copiado para a área de transferência.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const getStatsForGroup = (groupId: string) => {
    const stats = groupStats.find((stat) => stat.group_id === groupId)
    console.log(`📊 Stats para grupo ${groupId}:`, stats)
    return stats
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400 mx-auto"></div>
          <p className="text-slate-400 mt-2">Carregando grupos...</p>
        </div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">Nenhum grupo encontrado</h3>
          <p className="text-slate-400 mb-4">Comece criando seu primeiro grupo de WhatsApp.</p>
          <Link href="/admin/grupos/novo">
            <Button className="bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-500">
              Criar Primeiro Grupo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {/* Header com botão refresh */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Lista de Grupos</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-xs font-bold uppercase tracking-wide text-slate-400 text-left py-4 px-6">Nome</th>
                <th className="text-xs font-bold uppercase tracking-wide text-slate-400 text-left py-4 px-6">
                  Link Público
                </th>
                <th className="text-xs font-bold uppercase tracking-wide text-slate-400 text-left py-4 px-6">Status</th>
                <th className="text-xs font-bold uppercase tracking-wide text-slate-400 text-left py-4 px-6">
                  Números
                </th>
                <th className="text-xs font-bold uppercase tracking-wide text-slate-400 text-left py-4 px-6">
                  Cliques
                </th>
                <th className="text-xs font-bold uppercase tracking-wide text-slate-400 text-right py-4 px-6">Ações</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => {
                const stats = getStatsForGroup(group.id)
                const publicUrl = `${ENV_CONFIG.SITE_URL}/l/${group.slug}`
                return (
                  <tr key={group.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-4 px-6">
                      <span className="text-base font-semibold text-white">{group.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded">
                          /l/{group.slug}
                        </span>
                        <button
                          className="p-1 hover:bg-slate-700 rounded transition-colors"
                          onClick={() => copyPublicLink(group.slug)}
                        >
                          <Copy className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-medium uppercase tracking-wide px-3 py-1 rounded-full ${
                          group.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {group.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-slate-300">
                        {stats?.active_numbers || 0} / {stats?.total_numbers || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-white font-bold">{stats?.total_clicks || 0}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={publicUrl}
                          target="_blank"
                          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </Link>
                        <Link
                          href={`/admin/grupos/${group.id}/numeros`}
                          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Link>
                        <Link
                          href={`/admin/grupos/${group.id}/editar`}
                          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Edit className="h-4 w-4 text-slate-400" />
                        </Link>
                        <button
                          className="w-10 h-10 bg-slate-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                          onClick={() => handleDeleteClick(group)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border border-slate-700 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir grupo</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir o grupo "{groupToDelete?.name}"? Esta ação não pode ser desfeita e todos os
              números e estatísticas associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
