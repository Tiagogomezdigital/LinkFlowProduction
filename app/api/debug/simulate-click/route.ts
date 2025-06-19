import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabasePublic } from "@/lib/supabase"

// Seleciona o client com privilégios mais elevados quando disponível
const supabase = supabaseAdmin ?? supabasePublic

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const slug = url.searchParams.get("slug")?.trim()
  const customPhone = url.searchParams.get("phone")?.trim()
  const verbose = url.searchParams.get("verbose") === "true"

  if (!slug) {
    return NextResponse.json({ error: "Parâmetro 'slug' é obrigatório" }, { status: 400 })
  }

  const logs: any[] = []
  const pushLog = (step: string, detail: any) => {
    const entry = { step, detail }
    logs.push(entry)
    // Também loga no console para quem estiver acompanhando via dashboard
    console.log("[simulate-click]", entry)
  }

  try {
    // 1) Buscar próximo número ativo (ou usar phone custom)
    let targetPhone = customPhone
    if (!targetPhone) {
      const { data, error } = await supabase.rpc("get_next_number", { group_slug: slug })
      pushLog("get_next_number_response", { data, error })
      if (error || !data || data.length === 0) {
        return NextResponse.json({ error: error?.message || "Nenhum número encontrado", logs }, { status: 400 })
      }
      targetPhone = data[0].phone
    }

    // 2) Registrar clique
    const { data: clickData, error: clickError } = await supabase.rpc("register_click", {
      group_slug: slug,
      number_phone: targetPhone,
      ip_address: "127.0.0.1",
      user_agent: "SimulateClick/1.0",
      device_type: "desktop",
      referrer: "https://debug.local",
    })
    pushLog("register_click_response", { data: clickData, error: clickError })

    // 3) Retornar resultado final
    const responsePayload = {
      success: !clickError,
      slug,
      phone: targetPhone,
      clickData,
      clickError,
      logs,
    }
    return NextResponse.json(responsePayload)
  } catch (error: any) {
    pushLog("exception", { message: error.message, stack: verbose ? error.stack : undefined })
    return NextResponse.json({ error: error.message, logs }, { status: 500 })
  }
} 