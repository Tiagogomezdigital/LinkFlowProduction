"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react"

interface WebhookEvent {
  id: string
  event: string
  status: "success" | "failed"
  timestamp: string
}

export function WebhookSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [saveStatus, setSaveStatus] = useState(false)

  const [settings, setSettings] = useState({
    webhookUrl: "",
    webhooksEnabled: false,
  })

  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettings({
        webhookUrl: "https://api.example.com/webhooks/linkflow",
        webhooksEnabled: true,
      })

      setWebhookEvents([
        {
          id: "1",
          event: "click.created",
          status: "success",
          timestamp: "2023-12-01 14:32:45",
        },
        {
          id: "2",
          event: "group.updated",
          status: "success",
          timestamp: "2023-12-01 13:15:22",
        },
        {
          id: "3",
          event: "number.created",
          status: "failed",
          timestamp: "2023-12-01 11:05:17",
        },
        {
          id: "4",
          event: "click.created",
          status: "success",
          timestamp: "2023-12-01 10:42:33",
        },
      ])

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleUrlChange = (value: string) => {
    setSettings((prev) => ({ ...prev, webhookUrl: value }))
  }

  const handleToggleWebhooks = async (enabled: boolean) => {
    setIsSaving(true)

    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSettings((prev) => ({ ...prev, webhooksEnabled: enabled }))

      toast({
        title: enabled ? "Webhooks ativados" : "Webhooks desativados",
        description: enabled
          ? "Os webhooks estão agora ativos e recebendo eventos."
          : "Os webhooks foram desativados com sucesso.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status dos webhooks.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveWebhook = async () => {
    setIsSaving(true)
    setSaveStatus(false)

    try {
      // Validar URL
      if (!isValidUrl(settings.webhookUrl)) {
        toast({
          title: "URL inválida",
          description: "Por favor, insira uma URL válida para o webhook.",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSaveStatus(true)

      // Limpar status após alguns segundos
      setTimeout(() => {
        setSaveStatus(false)
      }, 2000)

      toast({
        title: "Webhook salvo",
        description: "A URL do webhook foi salva com sucesso.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a URL do webhook.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestWebhook = async () => {
    setIsTesting(true)

    try {
      // Validar URL
      if (!isValidUrl(settings.webhookUrl)) {
        toast({
          title: "URL inválida",
          description: "Por favor, insira uma URL válida para testar o webhook.",
          variant: "destructive",
        })
        setIsTesting(false)
        return
      }

      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Adicionar evento de teste ao log
      const newEvent: WebhookEvent = {
        id: Date.now().toString(),
        event: "webhook.test",
        status: Math.random() > 0.3 ? "success" : "failed",
        timestamp: new Date().toLocaleString(),
      }

      setWebhookEvents((prev) => [newEvent, ...prev])

      if (newEvent.status === "success") {
        toast({
          title: "Teste bem-sucedido",
          description: "O webhook foi testado com sucesso.",
          variant: "success",
        })
      } else {
        toast({
          title: "Teste falhou",
          description: "O teste do webhook falhou. Verifique a URL e tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível testar o webhook.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Configurações de Webhook</CardTitle>
          <CardDescription className="text-slate-400">
            Configure webhooks para integrar com outros sistemas
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
        <CardTitle className="text-white">Configurações de Webhook</CardTitle>
        <CardDescription className="text-slate-400">
          Configure webhooks para integrar com outros sistemas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="webhooksEnabled" className="text-white">
              Ativar Webhooks
            </Label>
            <p className="text-xs text-slate-400">Habilita o envio de eventos para sistemas externos</p>
          </div>
          <Switch
            id="webhooksEnabled"
            checked={settings.webhooksEnabled}
            onCheckedChange={handleToggleWebhooks}
            disabled={isSaving}
            className="data-[state=checked]:bg-lime-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhookUrl" className="text-white">
            URL do Webhook Global
          </Label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                id="webhookUrl"
                value={settings.webhookUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://api.example.com/webhooks"
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-lime-400"
                disabled={!settings.webhooksEnabled}
              />
            </div>
            <Button
              onClick={handleSaveWebhook}
              disabled={isSaving || !settings.webhooksEnabled}
              className="bg-lime-400 hover:bg-lime-500 text-black"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveStatus ? <CheckCircle2 /> : "Salvar"}
            </Button>
          </div>
          <p className="text-xs text-slate-400">URL para onde todos os eventos serão enviados</p>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleTestWebhook}
            disabled={isTesting || !settings.webhooksEnabled || !settings.webhookUrl}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isTesting ? "Testando..." : "Testar Webhook"}
          </Button>
        </div>

        <div className="space-y-2 pt-4">
          <h3 className="text-white font-medium">Log de Eventos Recentes</h3>
          <div className="rounded-md border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="hover:bg-slate-900 border-slate-700">
                  <TableHead className="text-slate-300 font-medium">Evento</TableHead>
                  <TableHead className="text-slate-300 font-medium">Status</TableHead>
                  <TableHead className="text-slate-300 font-medium">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookEvents.length > 0 ? (
                  webhookEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-slate-800 border-slate-700">
                      <TableCell className="font-medium text-white">{event.event}</TableCell>
                      <TableCell>
                        {event.status === "success" ? (
                          <div className="flex items-center text-green-400">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Sucesso
                          </div>
                        ) : (
                          <div className="flex items-center text-red-400">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Falha
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400">{event.timestamp}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-slate-400">
                      Nenhum evento registrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
