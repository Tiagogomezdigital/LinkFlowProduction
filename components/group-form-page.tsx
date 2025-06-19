"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { GroupForm } from "@/components/group-form"
import { getGroupById } from "@/lib/api/groups"
import { Breadcrumb } from "@/components/breadcrumb"
import type { Group } from "@/lib/types"

interface GroupFormPageProps {
  groupId?: string
  mode?: "create" | "edit"
}

export function GroupFormPage({ groupId, mode = "edit" }: GroupFormPageProps) {
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const queryGroupId = searchParams.get("id")
  const effectiveGroupId = groupId || queryGroupId || undefined

  const isCreateMode = mode === "create" && !effectiveGroupId

  useEffect(() => {
    async function loadGroup() {
      if (!effectiveGroupId) return

      setIsLoading(true)
      try {
        const groupData = await getGroupById(effectiveGroupId)
        setGroup(groupData)
      } catch (error) {
        console.error("Error loading group:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGroup()
  }, [effectiveGroupId])

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Grupos", href: "/admin/grupos" },
    {
      label: isCreateMode ? "Novo Grupo" : "Editar Grupo",
      href: isCreateMode ? "/admin/grupos/novo" : `/admin/grupos/${effectiveGroupId}/editar`,
      active: true,
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <nav className="text-sm text-slate-500 mb-4">
            <Breadcrumb items={breadcrumbItems} />
          </nav>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {isCreateMode ? "Criar Novo Grupo" : "Editar Grupo"}
          </h1>
          <p className="text-base text-slate-400 font-normal leading-relaxed">
            {isCreateMode
              ? "Crie um novo grupo para gerenciar seus números de WhatsApp"
              : "Edite as informações do grupo e suas configurações"}
          </p>
        </div>

        {/* Conteúdo */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 lg:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
            </div>
          ) : (
            <GroupForm defaultValues={group || undefined} />
          )}
        </div>
      </div>
    </div>
  )
}
