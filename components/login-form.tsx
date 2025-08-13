"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Zap, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
      })
      return
    }

    setIsLoading(true)

    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log("🔐 Iniciando login com auth-helpers...")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (process.env.NODE_ENV !== 'production') {
        console.log("📊 Resultado do login:", {
          success: !error,
          hasUser: !!data?.user,
          hasSession: !!data?.session,
          userId: data?.user?.id,
          error: error?.message,
        })
      }

      if (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("❌ Erro de login:", error)
        }
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message === "Invalid login credentials" ? "Credenciais inválidas" : error.message,
        })
        return
      }

      if (data?.user && data?.session) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("✅ Login bem-sucedido! Sessão criada.")
        }

        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        })

        // Aguardar um pouco para garantir que a sessão foi salva
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Refresh do router para atualizar o estado de auth
        router.refresh()

        // Redirecionar para grupos
        router.push("/admin/grupos")

        return
      }

      // Se chegou aqui, algo deu errado
      if (process.env.NODE_ENV !== 'production') {
        console.error("❌ Login sem erro mas sem sessão válida")
      }
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Login realizado mas sessão não foi criada",
      })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("❌ Erro inesperado:", error)
      }
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-lime-400 rounded-2xl p-4 shadow-lg">
              <Zap className="h-12 w-12 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">LinkFlow</h1>
          <p className="text-slate-400 text-lg">Acesse o painel administrativo</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-lime-400" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 h-12 rounded-xl focus:border-lime-400 focus:ring-lime-400/20"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-lime-400" />
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 h-12 rounded-xl pr-12 focus:border-lime-400 focus:ring-lime-400/20"
                  disabled={isLoading}
                  required
                />
                {/* Show/Hide Password */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-lime-400 hover:bg-lime-500 text-black font-semibold rounded-xl transition-colors shadow-lg hover:shadow-lime-400/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">Sistema de gerenciamento de links</p>
        </div>
      </div>
    </div>
  )
}
