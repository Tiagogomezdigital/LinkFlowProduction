"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function ErrorPage() {
  const [isClient, setIsClient] = useState(false)
  const searchParams = useSearchParams()
  const errorType = searchParams.get("type") || "unknown"

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getErrorInfo = () => {
    switch (errorType) {
      case "group-not-found":
        return {
          title: "Link não encontrado",
          description: "O link que você acessou não existe ou foi removido.",
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          suggestion: "Verifique se o link está correto ou entre em contato conosco.",
        }

      case "no-numbers":
        return {
          title: "Serviço temporariamente indisponível",
          description: "Não há atendentes disponíveis no momento.",
          icon: <Phone className="h-12 w-12 text-yellow-500" />,
          suggestion: "Tente novamente em alguns minutos ou entre em contato por outros meios.",
        }

      case "internal-error":
        return {
          title: "Erro interno",
          description: "Ocorreu um erro inesperado em nossos servidores.",
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          suggestion: "Tente novamente em alguns minutos. Se o problema persistir, entre em contato conosco.",
        }

      default:
        return {
          title: "Algo deu errado",
          description: "Ocorreu um erro inesperado.",
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          suggestion: "Tente novamente ou entre em contato conosco.",
        }
    }
  }

  const errorInfo = getErrorInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{errorInfo.icon}</div>
          <CardTitle className="text-xl text-white">{errorInfo.title}</CardTitle>
          <CardDescription className="text-slate-300">{errorInfo.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400 text-center">{errorInfo.suggestion}</p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                if (isClient && typeof window !== 'undefined') {
                  window.history.back()
                }
              }}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Button
              onClick={() => {
                if (isClient && typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              Powered by{" "}
              <Link href="/admin" className="text-lime-400 hover:text-lime-300">
                LinkFlow
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
