"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Users, Phone, BarChart2, CalendarDays, Activity, LogOut, ChevronLeft } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface AppSidebarProps {
  onClose?: () => void
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const isActive = (path: string) => {
    return pathname === path
  }

  const sections = [
    {
      label: "NAVEGAÇÃO",
      items: [
        { name: "Grupos", href: "/admin/grupos", icon: Users, description: "Gerenciar grupos de WhatsApp" },
        { name: "Números", href: "/admin/numeros", icon: Phone, description: "Gerenciar números globais" },
      ],
    },
    {
      label: "RELATÓRIOS",
      items: [
        { name: "Relatório Geral", href: "/admin/relatorios", icon: BarChart2, description: "Análise geral por período" },
      ],
    },
  ]

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <div className="w-72 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-lime-400 w-10 h-10 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-black"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">LinkFlow</h1>
            <p className="text-slate-400 text-xs">WhatsApp Manager</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {sections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-3">
              {section.label}
            </p>
            <nav className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex gap-3 px-3 py-3 rounded-lg transition-colors border-r-2 ${
                    isActive(item.href)
                      ? "bg-slate-800 text-lime-400 border-r-2 border-lime-400"
                      : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 mt-0.5" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium leading-none">{item.name}</span>
                    {item.description && (
                      <span className="text-xs text-slate-500 leading-tight">{item.description}</span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        ))}

        {/* Sistema Section */}
        <div className="mt-8 px-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Sistema</p>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg text-sm text-slate-300">
            <Activity className="w-4 h-4 text-lime-400 animate-pulse" />
            Online e funcionando
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium">
            A
          </div>
          <div>
            <p className="text-white text-sm font-medium">Admin</p>
            <p className="text-slate-500 text-xs">admin@linkflow.com</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  )
}
