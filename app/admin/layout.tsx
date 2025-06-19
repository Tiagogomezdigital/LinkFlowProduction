'use client'

import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { ChevronRight } from "lucide-react"
import { useState } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0d0f12] relative">
        {!collapsed && <AppSidebar onClose={() => setCollapsed(true)} />}
        <SidebarInset className="flex-1 pl-4 sm:pl-5 md:pl-6 pr-6 md:pr-10 py-8">{children}</SidebarInset>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute top-4 left-2 z-50 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded"
            title="Mostrar menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </SidebarProvider>
  )
}
