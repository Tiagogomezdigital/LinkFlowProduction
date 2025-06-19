"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Loader2 } from "lucide-react"

export function GeneralSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<Record<string, boolean>>({})

  const [settings, setSettings] = useState({
    companyName: "",
    baseUrl: "",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
  })

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettings({
        companyName: "LinkFlow Tecnologia",
        baseUrl: "linkflow.com.br",
        timezone: "America/Sao_Paulo",
        language: "pt-BR",
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    handleAutoSave(field, value)
  }

  const handleAutoSave = async (field: string, value: string) => {
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
          <CardTitle className="text-white">Configurações Gerais</CardTitle>
          <CardDescription className="text-slate-400">Configure as informações básicas do sistema</CardDescription>
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
        <CardTitle className="text-white">Configurações Gerais</CardTitle>
        <CardDescription className="text-slate-400">Configure as informações básicas do sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="companyName" className="text-white">
              Nome da Empresa
            </Label>
            {isSaving.companyName && <Loader2 className="h-4 w-4 animate-spin text-lime-400" />}
            {saveStatus.companyName && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
          <Input
            id="companyName"
            value={settings.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-lime-400"
          />
          <p className="text-xs text-slate-400">Nome que aparecerá nos relatórios e emails</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="baseUrl" className="text-white">
              URL Base Personalizada
            </Label>
            {isSaving.baseUrl && <Loader2 className="h-4 w-4 animate-spin text-lime-400" />}
            {saveStatus.baseUrl && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
          <Input
            id="baseUrl"
            value={settings.baseUrl}
            onChange={(e) => handleInputChange("baseUrl", e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-lime-400"
          />
          <p className="text-xs text-slate-400">
            URL base para seus links: https://<span className="text-lime-400">{settings.baseUrl || "seu-dominio"}</span>
            /grupo-slug
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="timezone" className="text-white">
              Fuso Horário
            </Label>
            {isSaving.timezone && <Loader2 className="h-4 w-4 animate-spin text-lime-400" />}
            {saveStatus.timezone && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
          <Select value={settings.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white focus:ring-lime-400">
              <SelectValue placeholder="Selecione o fuso horário" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
              <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
              <SelectItem value="America/Belem">Belém (GMT-3)</SelectItem>
              <SelectItem value="America/Bahia">Salvador (GMT-3)</SelectItem>
              <SelectItem value="America/Noronha">Fernando de Noronha (GMT-2)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">Fuso horário usado para relatórios e logs</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="language" className="text-white">
              Idioma (Em breve)
            </Label>
          </div>
          <Select value={settings.language} disabled>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white focus:ring-lime-400">
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">Idioma da interface (em desenvolvimento)</p>
        </div>
      </CardContent>
    </Card>
  )
}
