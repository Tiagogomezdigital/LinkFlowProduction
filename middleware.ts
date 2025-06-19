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

    // Redirecionar se já logado e tentar acessar login
    if (isLoginRoute && session?.user?.id) {
      console.log("✅ Usuário já logado tentando acessar login, redirecionando para dashboard")

      // Evitar loops de redirecionamento
      if (!req.headers.get("referer")?.includes("/admin/dashboard")) {
        const redirectUrl = new URL("/admin/dashboard", req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Refresh da sessão se necessário
    if (session) {
      await supabase.auth.getUser()
    }

    // Em caso de erro, redirecionar para login se a rota não for pública
    const errorPath = req.nextUrl.pathname
    const isErrorPublicRoute =
      errorPath === "/login" ||
      errorPath === "/auth/callback" ||
      errorPath.startsWith("/l") ||
      errorPath.startsWith("/redirect") ||
      errorPath.startsWith("/api/redirect") ||
      errorPath === "/error"

    if (!isErrorPublicRoute) {
      console.log("⚠️ Erro no middleware, redirecionando para login por segurança")
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("❌ Erro no middleware:", error)

    // Em caso de erro, redirecionar para login se a rota não for pública
    const errorPath = req.nextUrl.pathname
    const isErrorPublicRoute =
      errorPath === "/login" ||
      errorPath === "/auth/callback" ||
      errorPath.startsWith("/l") ||
      errorPath.startsWith("/redirect") ||
      errorPath.startsWith("/api/redirect") ||
      errorPath === "/error"

    if (!isErrorPublicRoute) {
      console.log("⚠️ Erro no middleware, redirecionando para login por segurança")
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

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
