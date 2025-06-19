// Configuração das variáveis de ambiente
export const ENV_CONFIG = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_LINK_BASE_URL || "http://localhost:3000",
  LINK_BASE_URL: process.env.NEXT_PUBLIC_LINK_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
}

// Função para validar se todas as variáveis obrigatórias estão definidas
export function validateEnvConfig() {
  const errors: string[] = []

  if (!ENV_CONFIG.SUPABASE_URL) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL não está definida")
  }

  if (!ENV_CONFIG.SUPABASE_ANON_KEY) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida")
  }

  if (errors.length > 0) {
    throw new Error(`Variáveis de ambiente faltando:\n${errors.join("\n")}`)
  }

  return true
}

// Função para obter configurações de ambiente (sem expor valores sensíveis)
export function getEnvConfig() {
  // Verificar variáveis de ambiente essenciais
  const config = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://whatsapp.aescoladenegocios.com.br",
    LINK_BASE_URL: process.env.NEXT_PUBLIC_LINK_BASE_URL || "https://whatsapp.aescoladenegocios.com.br",
  }

  return {
    ...config,
    isValid: !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY,
  }
}

// Função legada para compatibilidade
export function validateEnvironment() {
  return getEnvConfig()
}

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    validateEnvConfig()

    // Importar aqui para evitar problemas de inicialização
    const { supabase } = await import("./supabase")

    // ✅ SIMPLES E FUNCIONA:
    const { data, error } = await supabase.from("groups").select("id").limit(10) // só para teste

    if (error) {
      return {
        success: false,
        error: error.message,
        details: error,
      }
    }

    const count = data?.length || 0
    console.log(`✅ Conexão OK - ${count} grupos encontrados`)

    return {
      success: true,
      message: "Conexão com Supabase estabelecida com sucesso",
      data: { count, message: `${count} grupos encontrados` },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// Log das configurações (sem expor valores sensíveis)
console.log("🔧 Configurações de ambiente carregadas:")
console.log("📍 SUPABASE_URL:", ENV_CONFIG.SUPABASE_URL ? "✅ Definida" : "❌ Não definida")
console.log("🔑 SUPABASE_ANON_KEY:", ENV_CONFIG.SUPABASE_ANON_KEY ? "✅ Definida" : "❌ Não definida")
console.log("🌐 SITE_URL:", ENV_CONFIG.SITE_URL)
console.log("🔗 LINK_BASE_URL:", ENV_CONFIG.LINK_BASE_URL)
