"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/settings/general-settings"
import { WebhookSettings } from "@/components/settings/webhook-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { DataSettings } from "@/components/settings/data-settings"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Zap } from "lucide-react"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-2">
            <SidebarTrigger className="text-white hover:bg-slate-800" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lime-400">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-sm text-slate-400">Gerencie as configurações do sistema</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700 p-1">
            <TabsTrigger value="general" className="data-[state=active]:bg-lime-400 data-[state=active]:text-black">
              Geral
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-lime-400 data-[state=active]:text-black">
              Webhooks
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black"
            >
              Notificações
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-lime-400 data-[state=active]:text-black">
              Dados e Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <WebhookSettings />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <DataSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
