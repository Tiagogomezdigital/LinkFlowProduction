"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Loader2 } from "lucide-react"

export function NotificationSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<Record<string, boolean>>({})

  const [settings, setSettings] = useState({
    reportEmail: "",
    reportFrequency: "weekly",
    failureAlerts: true,
  })

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettings({
        reportEmail: "admin@linkflow.com.br",
        reportFrequency: "weekly",
        failureAlerts: true,
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    handleAutoSave(field, value)
  }

  const handleAutoSave = async (field: string, value: string | boolean) => {
    setIsSaving((prev) => ({ ...prev, [field]: true }))
    setSaveStatus((prev) => ({ ...prev, [field]: false }))

    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 800))

      console.log(`Salvando ${field}:`, value)

      setSaveStatus((prev) => ({ ...prev, [field]: true }))

      // Limpar status após alguns segundos
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [field]: false }))
      }, 2000)

      toast({
        title: "Configuração salva",
        description: "Suas alterações foram salvas com sucesso.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas alterações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving((prev) => ({ ...prev, [field]: false }))
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Configurações de Notificações</CardTitle>
          <CardDescription className="text-slate-400">
            Configure como você deseja receber notificações e relatórios
          </CardDescription>
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
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Configurações de Notificações</CardTitle>
        <CardDescription className="text-slate-400">
          Configure como você deseja receber notificações e relatórios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="reportEmail" className="text-white">
              Email para Relatórios
            </Label>
            {isSaving.reportEmail && <Loader2 className="h-4 w-4 animate-spin text-lime-400" />}
            {saveStatus.reportEmail && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
          <Input
            id="reportEmail"
            type="email"
            value={settings.reportEmail}
            onChange={(e) => handleInputChange("reportEmail", e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-lime-400"
          />
          <p className="text-xs text-slate-400">Email onde os relatórios periódicos serão enviados</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="reportFrequency" className="text-white">
              Frequência de Relatórios
            </Label>
            {isSaving.reportFrequency && <Loader2 className="h-4 w-4 animate-spin text-lime-400" />}
            {saveStatus.reportFrequency && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
          <Select
            value={settings.reportFrequency}
            onValueChange={(value) => handleInputChange("reportFrequency", value)}
          >
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white focus:ring-lime-400">
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="never">Nunca</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">Com que frequência você deseja receber relatórios</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <Label htmlFor="failureAlerts" className="text-white">
              Enviar Alertas de Falhas
            </Label>
            <p className="text-xs text-slate-400">Receba notificações quando ocorrerem falhas no sistema</p>
          </div>
          <div className="flex items-center gap-2">
            {isSaving.failureAlerts && <Loader2 className="h-4 w-4 animate-spin text-lime-400" />}
            {saveStatus.failureAlerts && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            <Switch
              id="failureAlerts"
              checked={settings.failureAlerts}
              onCheckedChange={(checked) => handleInputChange("failureAlerts", checked)}
              className="data-[state=checked]:bg-lime-400"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
