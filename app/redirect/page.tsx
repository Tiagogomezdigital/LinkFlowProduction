"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, MessageCircle, CheckCircle, Search, Users } from "lucide-react"

export default function RedirectPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1) // 1: verificando, 2: vaga encontrada, 3: redirecionando
  const [countdown, setCountdown] = useState(2)
  const whatsappUrl = searchParams.get("to")
  const phone = searchParams.get("phone")
  const group = searchParams.get("group")

  useEffect(() => {
    if (!whatsappUrl) {
      window.location.href = "/"
      return
    }

    // Etapa 1: Verificando vagas (1.2 segundos)
    const verifyTimer = setTimeout(() => {
      setStep(2)
    }, 1200)

    // Etapa 2: Vaga encontrada (0.8 segundos)
    const foundTimer = setTimeout(() => {
      setStep(3)
    }, 2000)

    // Etapa 3: Countdown para redirecionamento (1 segundo)
    const redirectTimer = setTimeout(() => {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            window.location.href = whatsappUrl
            return 0
          }
          return prev - 1
        })
      }, 500) // Countdown mais rápido (0.5s por número)
    }, 2000)

    return () => {
      clearTimeout(verifyTimer)
      clearTimeout(foundTimer)
      clearTimeout(redirectTimer)
    }
  }, [whatsappUrl])

  const formatPhoneForDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return "Carregando..."

    const cleaned = phoneNumber.replace(/\D/g, "")

    // Se tem 13 dígitos e começa com 55 (Brasil)
    if (cleaned.length === 13 && cleaned.startsWith("55")) {
      const ddd = cleaned.substring(2, 4)
      const number = cleaned.substring(4)
      const firstPart = number.substring(0, 5)
      const secondPart = number.substring(5)
      return `(${ddd}) ${firstPart}-${secondPart}`
    }

    // Se tem 11 dígitos (DDD + número)
    if (cleaned.length === 11) {
      const ddd = cleaned.substring(0, 2)
      const number = cleaned.substring(2)
      const firstPart = number.substring(0, 5)
      const secondPart = number.substring(5)
      return `(${ddd}) ${firstPart}-${secondPart}`
    }

    // Se tem 10 dígitos (DDD + número fixo)
    if (cleaned.length === 10) {
      const ddd = cleaned.substring(0, 2)
      const number = cleaned.substring(2)
      const firstPart = number.substring(0, 4)
      const secondPart = number.substring(4)
      return `(${ddd}) ${firstPart}-${secondPart}`
    }

    // Fallback: retorna o número original
    return phoneNumber
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            {/* Ícone de busca */}
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-white animate-pulse" />
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-white mb-2">Verificando Vagas</h1>
            <p className="text-slate-400 mb-6">Aguarde, verificando disponibilidade...</p>

            {/* Loading compacto */}
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-white text-sm">Verificando</span>
              </div>
            </div>
          </>
        )

      case 2:
        return (
          <>
            {/* Ícone de sucesso */}
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-white mb-2">🎉 Vaga Encontrada!</h1>
            <p className="text-green-400 mb-6 font-semibold">Temos uma vaga para você!</p>

            {/* Sucesso compacto */}
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Vaga Confirmada</span>
              </div>
            </div>
          </>
        )

      case 3:
        return (
          <>
            {/* Logo WhatsApp */}
            <div className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-black" />
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-white mb-2">Conectando...</h1>
            <p className="text-slate-400 mb-6">Redirecionando para WhatsApp</p>

            {/* Informações compactas */}
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <p className="text-white font-mono text-lg font-bold">{formatPhoneForDisplay(phone || "")}</p>
              {group && <p className="text-xs text-slate-500 mt-1">{group}</p>}
            </div>

            {/* Contador compacto */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
              <span className="text-lg font-bold text-white">{countdown}</span>
            </div>

            {/* Botão manual */}
            <button
              onClick={() => whatsappUrl && (window.location.href = whatsappUrl)}
              className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Ir Agora
            </button>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
        {renderStep()}
      </div>
    </div>
  )
}
