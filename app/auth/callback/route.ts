import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("🔄 Auth callback iniciado")

  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const next = requestUrl.searchParams.get("next") ?? "/admin/dashboard"

    console.log("📊 Callback params:", {
      code: code ? "Presente" : "Ausente",
      next,
      origin: requestUrl.origin,
    })

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      console.log("🔐 Trocando código por sessão...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("❌ Erro ao trocar código por sessão:", error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
      }

      console.log("✅ Sessão criada com sucesso:", {
        hasUser: !!data.user,
        hasSession: !!data.session,
        userId: data.user?.id,
      })

      // Aguardar um pouco para garantir que a sessão foi salva
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`🎯 Redirecionando para: ${requestUrl.origin}${next}`)
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  } catch (error) {
    console.error("❌ Erro inesperado no callback:", error)
    return NextResponse.redirect(`${request.url.split("/auth/callback")[0]}/login?error=callback_error`)
  }
}
