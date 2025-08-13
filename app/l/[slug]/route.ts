import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabasePublic } from "@/lib/supabase"

// Se service role estiver configurado, utilizamos o client admin (somente no servidor)
const supabase = supabaseAdmin ?? supabasePublic

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug
    const userAgent = request.headers.get("user-agent") || ""
    // Netlify pode usar cabeçalhos diferentes para o IP do cliente
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-nf-client-connection-ip") ||
      request.headers.get("client-ip") ||
      "unknown"
    const referrer = request.headers.get("referer") || ""

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Iniciando redirecionamento para slug: ${slug}`)
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
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔍 Dados para registrar clique:", {
        group_slug: slug,
        number_phone: phone,
        ip_address: ip,
        user_agent: userAgent,
        device_type: deviceType,
        referrer: referrer,
      })
    }

    const { error: clickError, data: clickData } = await supabase.rpc("register_click", {
      group_slug: slug,
      number_phone: phone,
      ip_address: ip,
      user_agent: userAgent,
      device_type: deviceType,
      referrer: referrer,
    })

    if (clickError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("⚠️ Erro ao registrar clique:", JSON.stringify(clickError, null, 2))
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log("✅ Clique registrado com sucesso!", clickData)
      }
    }

    // Construir URL do WhatsApp
    // Garantir que o número tenha o código do país brasileiro (55)
    const cleanPhone = phone.replace(/\D/g, "")
    const phoneWithCountryCode = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
    const message = encodeURIComponent(final_message || "Olá! Vim através do link.")
    const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${message}`

    if (process.env.NODE_ENV !== 'production') {
      console.log("📱 Número formatado:", {
        original: phone,
        cleaned: cleanPhone,
        withCountryCode: phoneWithCountryCode,
        whatsappUrl,
      })
    }

    // Em vez de redirecionamento direto, ir para página intermediária
    const redirectUrl = new URL("/redirect", process.env.NEXT_PUBLIC_SITE_URL || request.url)
    redirectUrl.searchParams.set("to", whatsappUrl)
    redirectUrl.searchParams.set("phone", phone)
    redirectUrl.searchParams.set("group", slug)

    if (process.env.NODE_ENV !== 'production') {
      console.log("🚀 Redirecionando para página intermediária:", redirectUrl.toString())
    }

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("💥 Erro no redirecionamento:", error)
    }
    return NextResponse.redirect(
      new URL("/error", process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_LINK_BASE_URL || request.url),
    )
  }
}
