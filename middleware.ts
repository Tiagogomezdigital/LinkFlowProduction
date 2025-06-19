import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Criar cliente middleware com auth-helpers
    const supabase = createMiddlewareClient({ req, res })

    // Verificar sessão atual
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const path = req.nextUrl.pathname
    const isLoginRoute = path === "/login"
    const isAuthCallback = path === "/auth/callback"

    // Rotas de redirecionamento público (acessíveis por qualquer pessoa)
    const isRedirectRoute = path.startsWith("/l") || path.startsWith("/redirect") || path.startsWith("/api/redirect")

    // Página de erro pública
    const isErrorRoute = path === "/error"

    // Lista consolidada de rotas que NÃO exigem autenticação
    const isPublicRoute = isLoginRoute || isAuthCallback || isRedirectRoute || isErrorRoute

    // Log detalhado para debug
    console.log("🛡️ Middleware Debug:", {
      path,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      isPublicRoute,
      isLoginRoute,
      isAuthCallback,
      userAgent: req.headers.get("user-agent")?.substring(0, 50),
      timestamp: new Date().toISOString(),
    })

    // Permitir callback de auth sem verificação
    if (isAuthCallback) {
      console.log("✅ Permitindo acesso ao callback de auth")
      return res
    }

    // Bloquear qualquer rota privada quando não houver sessão
    if (!isPublicRoute && !session?.user?.id) {
      console.log("❌ Acesso negado (rota privada), redirecionando para login")

      // Evitar loops de redirecionamento
      if (!req.headers.get("referer")?.includes("/login")) {
        const redirectUrl = new URL("/login", req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Se estiver na página de login, valide se o token ainda é realmente válido
    if (isLoginRoute && session?.user?.id) {
      const { data: userValidation, error: userValidationError } = await supabase.auth.getUser()

      if (userValidation?.user && !userValidationError) {
        console.log("✅ Sessão válida, redirecionando usuário logado para dashboard")

        // Evitar loops de redirecionamento
        if (!req.headers.get("referer")?.includes("/admin/dashboard")) {
          const redirectUrl = new URL("/admin/dashboard", req.url)
          return NextResponse.redirect(redirectUrl)
        }
      } else {
        console.log("ℹ️ Cookie de sessão inválido ou expirado, exibindo tela de login")
      }
    }

    // Refresh da sessão se necessário
    if (session) {
      await supabase.auth.getUser()
    }

    return res
  } catch (error) {
    console.error("❌ Erro no middleware:", error)

    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
