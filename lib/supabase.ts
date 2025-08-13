import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.error("⚠️ Variáveis de ambiente do Supabase não configuradas!")
    console.error("URL:", supabaseUrl)
    console.error("Key:", supabaseAnonKey ? "Definida" : "Não definida")
  }
}

// Cliente para componentes (usando auth-helpers para melhor compatibilidade SSR)
export const supabase = createClientComponentClient()

// Cliente alternativo para operações que não precisam de auth
export const supabasePublic = createSupabaseClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Cliente admin para operações que requerem privilégios elevados
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey
  ? createSupabaseClient(supabaseUrl || "", supabaseServiceKey, {
      global: {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Função para verificar se a API key está sendo enviada corretamente
export async function checkApiKey() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔍 Verificando configuração do Supabase...")
      console.log("URL:", supabaseUrl)
      console.log("API Key (primeiros 20 chars):", supabaseAnonKey?.substring(0, 20) + "...")
    }

    // Usar cliente público para teste
    const { data, error } = await supabasePublic.from("groups").select("id").limit(10)

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("❌ Erro na requisição:", error)
      }
      return {
        success: false,
        error: error.message,
        details: error,
      }
    }

    const count = data?.length || 0
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ API Key funcionando corretamente! ${count} grupos encontrados`)
    }

    return {
      success: true,
      message: "API Key está sendo enviada corretamente",
      data: { count, message: `${count} grupos encontrados` },
      url: supabaseUrl,
      keyPrefix: supabaseAnonKey?.substring(0, 20) + "...",
    }
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("❌ Erro ao verificar API key:", error)
    }
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    }
  }
}

// Função para verificar se o usuário está autenticado
export async function checkAuth() {
  const { data } = await supabase.auth.getSession()
  return data.session !== null
}

// Log para debug
if (process.env.NODE_ENV !== 'production') {
  console.log("🚀 Cliente Supabase inicializado com auth-helpers")
  console.log("📍 URL:", supabaseUrl)
  console.log("🔑 API Key configurada:", !!supabaseAnonKey)
  console.log("👑 Service Role configurada:", !!supabaseServiceKey)
  console.log("🌍 Environment:", process.env.NODE_ENV)
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and key are required")
  }

  return createSupabaseClient(supabaseUrl, supabaseKey)
}
