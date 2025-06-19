"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Flag para prevenir re-execução
  const initialized = useRef(false)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    // Prevenir re-execução se já foi inicializado
    if (initialized.current) {
      return
    }

    initialized.current = true

    // Verificar sessão atual apenas uma vez
    const checkSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        console.log("🔍 AuthProvider - Sessão verificada (inicial):", {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id,
        })

        setSession(currentSession || null)
        setUser(currentSession?.user || null)
        setLoading(false)
      } catch (error) {
        console.error("❌ Erro ao verificar sessão:", error)
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }

    // Configurar listener de mudanças de auth apenas uma vez
    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log("🔄 AuthProvider - Mudança de estado:", {
          event,
          hasSession: !!newSession,
          hasUser: !!newSession?.user,
          userId: newSession?.user?.id,
        })

        // Atualizar estado apenas se realmente mudou
        setSession((prevSession) => {
          const sessionChanged = !!newSession !== !!prevSession || newSession?.user?.id !== prevSession?.user?.id

          if (sessionChanged) {
            console.log("📝 Atualizando sessão:", {
              from: prevSession?.user?.id,
              to: newSession?.user?.id,
            })
            return newSession || null
          }

          return prevSession
        })

        setUser((prevUser) => {
          const userChanged = !!newSession?.user !== !!prevUser || newSession?.user?.id !== prevUser?.id

          if (userChanged) {
            console.log("👤 Atualizando usuário:", {
              from: prevUser?.id,
              to: newSession?.user?.id,
            })
            return newSession?.user || null
          }

          return prevUser
        })

        setLoading(false)

        // Apenas recarregar em logout
        if (event === "SIGNED_OUT") {
          console.log("🚪 Usuário deslogado, recarregando página")
          window.location.reload()
        }
      })

      subscriptionRef.current = subscription
      return subscription
    }

    // Executar verificação inicial e configurar listener
    checkSession()
    setupAuthListener()

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        console.log("🧹 Limpando subscription do auth listener")
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [supabase.auth]) // Apenas supabase.auth como dependência

  return <AuthContext.Provider value={{ session, user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return context
}
