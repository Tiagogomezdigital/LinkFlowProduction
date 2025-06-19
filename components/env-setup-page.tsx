"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertTriangle, XCircle, Database, Play, Download, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { testSupabaseConnection } from "@/lib/env-config"
import { DatabaseTester } from "@/lib/database-tests"

export function EnvSetupPage() {
  const { toast } = useToast()
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [testProgress, setTestProgress] = useState(0)

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      const result = await testSupabaseConnection()
      setConnectionResult(result)

      if (result.success) {
        toast({
          title: "✅ Conexão bem-sucedida!",
          description: "Supabase está configurado corretamente.",
        })

        // Redirecionar para admin após sucesso
        setTimeout(() => {
          window.location.href = "/admin/dashboard"
        }, 2000)
      } else {
        toast({
          title: "❌ Erro na conexão",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setConnectionResult({
        success: false,
        error: error.message,
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleRunComprehensiveTests = async () => {
    setIsRunningTests(true)
    setTestProgress(0)
    setTestResults([])

    try {
      const tester = new DatabaseTester()
      const results = await tester.runAllTests()

      setTestResults(results)
      setTestProgress(100)

      const hasErrors = results.some((category) => category.status === "error")
      const hasWarnings = results.some((category) => category.status === "warning")

      if (hasErrors) {
        toast({
          title: "❌ Testes concluídos com erros",
          description: "Alguns testes falharam. Verifique os detalhes.",
          variant: "destructive",
        })
      } else if (hasWarnings) {
        toast({
          title: "⚠️ Testes concluídos com avisos",
          description: "Alguns testes geraram avisos. Verifique os detalhes.",
        })
      } else {
        toast({
          title: "✅ Todos os testes passaram!",
          description: "Banco de dados está funcionando perfeitamente.",
        })
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro nos testes",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsRunningTests(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-900/20 border-green-800"
      case "warning":
        return "bg-yellow-900/20 border-yellow-800"
      case "error":
        return "bg-red-900/20 border-red-800"
      default:
        return "bg-gray-900/20 border-gray-800"
    }
  }

  const exportResults = () => {
    const dataStr = JSON.stringify(testResults, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `linkflow-database-tests-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lime-400">
              <Database className="h-7 w-7 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white">LinkFlow - Configuração</h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            As variáveis de ambiente foram configuradas! Teste a conexão e execute testes abrangentes.
          </p>
        </div>

        {/* Teste Básico de Conexão */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5" />
              Teste Básico de Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Verificar Configuração</p>
                <p className="text-sm text-slate-400">Testa se o Supabase está funcionando corretamente</p>
              </div>
              <Button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="bg-lime-400 hover:bg-lime-500 text-black"
              >
                {isTestingConnection ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2" />
                    Testando...
                  </>
                ) : (
                  "Testar Conexão"
                )}
              </Button>
            </div>

            {connectionResult && (
              <Alert
                className={
                  connectionResult.success ? "border-green-800 bg-green-900/20" : "border-red-800 bg-red-900/20"
                }
              >
                <div className="flex items-center gap-2">
                  {connectionResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription className={connectionResult.success ? "text-green-300" : "text-red-300"}>
                    {connectionResult.success ? "✅ Conexão bem-sucedida!" : connectionResult.error}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Testes Abrangentes */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Testes Abrangentes do Banco de Dados
              </div>
              {testResults.length > 0 && (
                <Button onClick={exportResults} variant="outline" size="sm" className="text-white border-slate-600">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Resultados
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Teste Completo de Funcionalidades</p>
                <p className="text-sm text-slate-400">
                  Verifica estrutura, permissões, CRUD, funções e integridade dos dados
                </p>
              </div>
              <Button
                onClick={handleRunComprehensiveTests}
                disabled={isRunningTests}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRunningTests ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Executar Testes
                  </>
                )}
              </Button>
            </div>

            {isRunningTests && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Progresso dos testes</span>
                  <span>{testProgress}%</span>
                </div>
                <Progress value={testProgress} className="w-full" />
              </div>
            )}

            {testResults.length > 0 && (
              <div className="mt-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-7 bg-slate-700">
                    <TabsTrigger value="overview" className="text-xs">
                      Resumo
                    </TabsTrigger>
                    {testResults.map((category, index) => (
                      <TabsTrigger key={index} value={`category-${index}`} className="text-xs">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(category.status)}
                          <span className="hidden sm:inline">{category.name}</span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {testResults.map((category, index) => (
                        <Card key={index} className={`${getStatusColor(category.status)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-white">{category.name}</h3>
                              {getStatusIcon(category.status)}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Total:</span>
                                <span className="text-white">{category.tests.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-400">Sucessos:</span>
                                <span className="text-white">
                                  {category.tests.filter((t) => t.status === "success").length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-yellow-400">Avisos:</span>
                                <span className="text-white">
                                  {category.tests.filter((t) => t.status === "warning").length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-red-400">Erros:</span>
                                <span className="text-white">
                                  {category.tests.filter((t) => t.status === "error").length}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {testResults.map((category, categoryIndex) => (
                    <TabsContent key={categoryIndex} value={`category-${categoryIndex}`} className="space-y-4">
                      <div className="space-y-3">
                        {category.tests.map((test, testIndex) => (
                          <Card key={testIndex} className={`${getStatusColor(test.status)}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getStatusIcon(test.status)}
                                    <h4 className="font-medium text-white">{test.name}</h4>
                                    {test.duration && (
                                      <Badge variant="outline" className="text-xs">
                                        {test.duration}ms
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-300 mb-2">{test.message}</p>
                                  {test.details && (
                                    <details className="text-xs text-slate-400">
                                      <summary className="cursor-pointer hover:text-slate-300">Ver detalhes</summary>
                                      <pre className="mt-2 p-2 bg-slate-900 rounded overflow-x-auto">
                                        {JSON.stringify(test.details, null, 2)}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações sobre as variáveis */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">✅ Variáveis Configuradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-white">NEXT_PUBLIC_SUPABASE_URL</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-white">SUPABASE_SERVICE_ROLE_KEY</span>
            </div>
          </CardContent>
        </Card>

        {/* Botão para continuar */}
        {connectionResult?.success && (
          <div className="text-center">
            <Button
              onClick={() => (window.location.href = "/admin/dashboard")}
              className="bg-lime-400 hover:bg-lime-500 text-black font-medium px-8 py-3"
            >
              Ir para o Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
