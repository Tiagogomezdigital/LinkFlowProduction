"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, AlertTriangle, Clock, RefreshCw, Key } from "lucide-react"
import { runAllTests, type TestResult } from "@/lib/database-tests"
import { checkApiKey } from "@/lib/supabase"

export default function DatabaseTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null)
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(false)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setIsLoading(true)
    try {
      const results = await runAllTests()
      setTestResults(results)
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testApiKey = async () => {
    setIsCheckingApiKey(true)
    try {
      const result = await checkApiKey()
      setApiKeyStatus(result)
    } catch (error) {
      console.error("Error checking API key:", error)
      setApiKeyStatus({ success: false, error: String(error) })
    } finally {
      setIsCheckingApiKey(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="bg-green-900/20 text-green-500 border-green-800">
            Sucesso
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-900/20 text-red-500 border-red-800">
            Erro
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="bg-yellow-900/20 text-yellow-500 border-yellow-800">
            Aviso
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-900/20 text-blue-500 border-blue-800">
            Pendente
          </Badge>
        )
      default:
        return null
    }
  }

  const successCount = testResults.filter((test) => test.status === "success").length
  const errorCount = testResults.filter((test) => test.status === "error").length
  const warningCount = testResults.filter((test) => test.status === "warning").length

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Teste de Banco de Dados</h1>
          <p className="text-slate-400">Verifique a conexão e estrutura do banco de dados</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={testApiKey}
            disabled={isCheckingApiKey}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isCheckingApiKey ? (
              <>
                <Key className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Testar API Key
              </>
            )}
          </Button>
          <Button onClick={runTests} disabled={isLoading} className="bg-slate-800 hover:bg-slate-700 text-white">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Executar testes
              </>
            )}
          </Button>
        </div>
      </div>

      {apiKeyStatus && (
        <Card
          className={`mb-6 ${apiKeyStatus.success ? "bg-green-900/20 border-green-800" : "bg-red-900/20 border-red-800"}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              {apiKeyStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Teste de API Key
            </CardTitle>
            <CardDescription className={apiKeyStatus.success ? "text-green-300" : "text-red-300"}>
              {apiKeyStatus.success ? "API Key está sendo enviada corretamente!" : "Erro ao verificar API Key"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-md overflow-x-auto">
              {JSON.stringify(apiKeyStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-slate-700">
            Detalhes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Testes bem-sucedidos</CardTitle>
                <CardDescription className="text-slate-400">Componentes funcionando corretamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-white">{successCount}</div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Erros</CardTitle>
                <CardDescription className="text-slate-400">Componentes com falhas críticas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-white">{errorCount}</div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Avisos</CardTitle>
                <CardDescription className="text-slate-400">Componentes com problemas não críticos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-white">{warningCount}</div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Resumo dos testes</CardTitle>
              <CardDescription className="text-slate-400">Status de cada componente do banco de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : (
                  testResults.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-md bg-slate-800 border border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <span className="font-medium text-white">{test.name}</span>
                      </div>
                      {getStatusBadge(test.status)}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <RefreshCw className="h-12 w-12 animate-spin text-slate-400" />
            </div>
          ) : (
            testResults.map((test, index) => (
              <Card key={index} className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      {test.name}
                    </CardTitle>
                    {getStatusBadge(test.status)}
                  </div>
                  <CardDescription className="text-slate-400">{test.message}</CardDescription>
                </CardHeader>
                {test.details && (
                  <CardContent>
                    <div className="bg-slate-800 p-3 rounded-md border border-slate-700 overflow-x-auto">
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap">{test.details}</pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
