"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download, Database, Trash2, Loader2 } from "lucide-react"
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

export function DataSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)

  const [lastBackup, setLastBackup] = useState<string | null>(null)

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLastBackup("2023-12-01 14:32:45")
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleBackupNow = async () => {
    setIsBackingUp(true)

    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const now = new Date().toLocaleString()
      setLastBackup(now)

      toast({
        title: "Backup concluído",
        description: "O backup foi realizado com sucesso.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: "Não foi possível realizar o backup. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)

    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Exportação iniciada",
        description: "Os dados estão sendo exportados. Você receberá um email quando estiver pronto.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearLogs = async () => {
    setIsClearing(true)

    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Logs limpos",
        description: "Os logs antigos foram removidos com sucesso.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Erro ao limpar logs",
        description: "Não foi possível limpar os logs. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
      setShowClearDialog(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "há poucos segundos"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `há ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    return `há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Dados e Backup</CardTitle>
          <CardDescription className="text-slate-400">Gerencie seus dados e backups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Dados e Backup</CardTitle>
          <CardDescription className="text-slate-400">Gerencie seus dados e backups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Último Backup</h3>
                <p className="text-slate-400 text-sm">
                  {lastBackup ? formatTimeAgo(lastBackup) : "Nenhum backup realizado"}
                </p>
              </div>
              <Button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                className="bg-lime-400 hover:bg-lime-500 text-black"
              >
                {isBackingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                {isBackingUp ? "Realizando Backup..." : "Fazer Backup Agora"}
              </Button>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? "Exportando..." : "Exportar Dados (CSV)"}
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-white font-medium mb-4">Ações de Manutenção</h3>
            <Button
              onClick={() => setShowClearDialog(true)}
              variant="destructive"
              className="bg-red-900 hover:bg-red-800 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Logs Antigos
            </Button>
            <p className="text-xs text-slate-400 mt-2">
              Esta ação removerá logs com mais de 30 dias. Não afeta dados de cliques ou estatísticas.
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Limpar logs antigos</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação removerá permanentemente todos os logs com mais de 30 dias. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLogs}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isClearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isClearing ? "Limpando..." : "Sim, limpar logs"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
