import { supabase } from "./supabase"

export interface TestResult {
  testName: string
  passed: boolean
  errorMessage?: string
  details?: any
}

// Função para testar a conexão com o Supabase
export async function testConnection(): Promise<TestResult> {
  try {
    // ✅ SIMPLES E FUNCIONA:
    const { data, error } = await supabase.from("groups").select("id").limit(10) // só para teste

    if (error) {
      return {
        testName: "Conexão com Supabase",
        passed: false,
        errorMessage: error.message,
        details: error,
      }
    }

    const count = data?.length || 0
    console.log(`✅ Conexão OK - ${count} grupos encontrados`)

    return {
      testName: "Conexão com Supabase",
      passed: true,
      details: { count, message: `${count} grupos encontrados` },
    }
  } catch (error: any) {
    return {
      testName: "Conexão com Supabase",
      passed: false,
      errorMessage: error.message,
      details: error,
    }
  }
}

// Função para testar a tabela groups
export async function testGroupsTable(): Promise<TestResult> {
  try {
    const { data, error } = await supabase.from("groups").select("*").limit(1)

    if (error) {
      return {
        testName: "Tabela groups",
        passed: false,
        errorMessage: error.message,
        details: error,
      }
    }

    return {
      testName: "Tabela groups",
      passed: true,
      details: { count: data.length, sample: data[0] },
    }
  } catch (error: any) {
    return {
      testName: "Tabela groups",
      passed: false,
      errorMessage: error.message,
      details: error,
    }
  }
}

// Função para testar a tabela whatsapp_numbers
export async function testWhatsappNumbersTable(): Promise<TestResult> {
  try {
    const { data, error } = await supabase.from("whatsapp_numbers").select("*").limit(1)

    if (error) {
      return {
        testName: "Tabela whatsapp_numbers",
        passed: false,
        errorMessage: error.message,
        details: error,
      }
    }

    return {
      testName: "Tabela whatsapp_numbers",
      passed: true,
      details: { count: data.length, sample: data[0] },
    }
  } catch (error: any) {
    return {
      testName: "Tabela whatsapp_numbers",
      passed: false,
      errorMessage: error.message,
      details: error,
    }
  }
}

// Função para testar a tabela clicks
export async function testClicksTable(): Promise<TestResult> {
  try {
    const { data, error } = await supabase.from("clicks").select("*").limit(1)

    if (error) {
      return {
        testName: "Tabela clicks",
        passed: false,
        errorMessage: error.message,
        details: error,
      }
    }

    return {
      testName: "Tabela clicks",
      passed: true,
      details: { count: data.length, sample: data[0] },
    }
  } catch (error: any) {
    return {
      testName: "Tabela clicks",
      passed: false,
      errorMessage: error.message,
      details: error,
    }
  }
}

// Função para testar a função get_next_number
export async function testGetNextNumberFunction(): Promise<TestResult> {
  try {
    // Primeiro, vamos buscar um grupo existente
    const { data: groups, error: groupError } = await supabase.from("groups").select("slug").limit(1)

    if (groupError || !groups || groups.length === 0) {
      return {
        testName: "Função get_next_number",
        passed: false,
        errorMessage: groupError?.message || "Nenhum grupo encontrado para testar",
        details: groupError,
      }
    }

    const groupSlug = groups[0].slug

    // Agora testamos a função com o slug do grupo
    const { data, error } = await supabase.rpc("get_next_number", { group_slug: groupSlug })

    if (error) {
      return {
        testName: "Função get_next_number",
        passed: false,
        errorMessage: error.message,
        details: error,
      }
    }

    return {
      testName: "Função get_next_number",
      passed: true,
      details: { result: data },
    }
  } catch (error: any) {
    return {
      testName: "Função get_next_number",
      passed: false,
      errorMessage: error.message,
      details: error,
    }
  }
}

// Função para testar a view group_stats
export async function testGroupStatsView(): Promise<TestResult> {
  try {
    const { data, error } = await supabase.from("group_stats").select("*").limit(1)

    if (error) {
      return {
        testName: "View group_stats",
        passed: false,
        errorMessage: error.message,
        details: error,
      }
    }

    return {
      testName: "View group_stats",
      passed: true,
      details: { count: data.length, sample: data[0] },
    }
  } catch (error: any) {
    return {
      testName: "View group_stats",
      passed: false,
      errorMessage: error.message,
      details: error,
    }
  }
}

// Função para verificar se a API key está sendo enviada corretamente
export async function checkApiKey() {
  try {
    console.log("🔍 Verificando configuração do Supabase...")

    // ✅ SIMPLES E FUNCIONA:
    const { data, error } = await supabase.from("groups").select("id").limit(10) // só para teste

    if (error) {
      console.error("❌ Erro na requisição:", error)
      return {
        success: false,
        error: error.message,
        details: error,
      }
    }

    const count = data?.length || 0
    console.log(`✅ API Key funcionando corretamente! ${count} grupos encontrados`)

    return {
      success: true,
      message: "API Key está sendo enviada corretamente",
      data: { count, message: `${count} grupos encontrados` },
    }
  } catch (error: any) {
    console.error("❌ Erro ao verificar API key:", error)
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    }
  }
}

// Função para executar todos os testes
export async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = []

  results.push(await testConnection())
  results.push(await testGroupsTable())
  results.push(await testWhatsappNumbersTable())
  results.push(await testClicksTable())
  results.push(await testGetNextNumberFunction())
  results.push(await testGroupStatsView())

  return results
}

// Classe DatabaseTester para manter compatibilidade com código existente
export class DatabaseTester {
  async runAllTests(): Promise<any[]> {
    const results = await runAllTests()

    // Converter para o formato antigo esperado pelos componentes
    return [
      {
        name: "Testes de Banco de Dados",
        status: results.every((r) => r.passed) ? "success" : "error",
        tests: results.map((r) => ({
          name: r.testName,
          status: r.passed ? "success" : "error",
          message: r.passed ? "Teste passou com sucesso" : r.errorMessage,
          details: r.details,
          duration: 0,
        })),
      },
    ]
  }
}

// Export default para compatibilidade total
export default DatabaseTester
