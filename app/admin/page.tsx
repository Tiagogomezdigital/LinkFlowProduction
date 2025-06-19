"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar automaticamente para o dashboard
    router.replace("/admin/dashboard")
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400 mx-auto mb-4"></div>
        <p className="text-white">Redirecionando para o dashboard...</p>
      </div>
    </div>
  )
}
