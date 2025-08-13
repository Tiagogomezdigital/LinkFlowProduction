import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabasePublic } from "@/lib/supabase"

const supabase = supabaseAdmin ?? supabasePublic

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug
    const userAgent = request.headers.get("user-agent") || ""
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-nf-client-connection-ip") ||
      request.headers.get("client-ip") ||
      "unknown"
    const referrer = request.headers.get("referer") || ""

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Redirecionamento via API para slug: ${slug}`)
    }

    // Detectar tipo de dispositivo
    const deviceType = userAgent.toLowerCase().includes("mobile") ? "mobile" : "desktop"

    // Buscar próximo número disponível
    const { data: numberData, error: numberError } = await supabase.rpc("get_next_number", {
      group_slug: slug,
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log("📊 Resultado da função get_next_number:", { numberData, numberError })
    }

    if (numberError || !numberData || numberData.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("❌ Erro ao buscar número:", numberError)
      }
      return NextResponse.redirect(
        new URL("/error", process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_LINK_BASE_URL || request.url),
      )
    }

    const { number_id, phone, final_message } = numberData[0]

    if (process.env.NODE_ENV !== 'production') {
      console.log("✅ Dados obtidos:", {
        number_id,
        phone,
        final_message,
        slug,
      })
    }

    // Registrar clique usando a função padronizada register_click
    const { error: clickError } = await supabase.rpc("register_click", {
      group_slug: slug,
      number_phone: phone,
      ip_address: ip,
      user_agent: userAgent,
      device_type: deviceType,
      referrer: referrer,
    })

    if (clickError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("⚠️ Erro ao registrar clique:", clickError)
      }
      // Não bloquear o redirecionamento por erro de clique
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log("✅ Clique registrado com sucesso!")
      }
    }

    // Construir URL do WhatsApp
    const message = encodeURIComponent(final_message || "Olá! Vim através do link.")
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`

    if (process.env.NODE_ENV !== 'production') {
      console.log("🚀 Redirecionando para:", whatsappUrl)
      console.log("💬 Mensagem final:", final_message)
    }

    return NextResponse.redirect(whatsappUrl)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("💥 Erro no redirecionamento:", error)
    }
    return NextResponse.redirect(
      new URL("/error", process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_LINK_BASE_URL || request.url),
    )
  }
}
