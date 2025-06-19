import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""

  // Remove todos os caracteres não numéricos
  const cleanNumber = phone.replace(/\D/g, "")

  // Se o número já começa com 55 (Brasil)
  if (cleanNumber.startsWith("55") && cleanNumber.length >= 12) {
    const countryCode = cleanNumber.slice(0, 2) // 55
    const areaCode = cleanNumber.slice(2, 4) // DDD
    const number = cleanNumber.slice(4) // Resto do número

    // Formatar número brasileiro
    if (number.length === 9) {
      // Celular: 99999-9999
      return `+${countryCode} (${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`
    } else if (number.length === 8) {
      // Fixo: 9999-9999
      return `+${countryCode} (${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`
    }
  }

  // Se o número não tem código do país, assumir que é brasileiro
  if (cleanNumber.length >= 10 && cleanNumber.length <= 11) {
    const areaCode = cleanNumber.slice(0, 2)
    const number = cleanNumber.slice(2)

    if (number.length === 9) {
      // Celular brasileiro sem código do país
      return `+55 (${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`
    } else if (number.length === 8) {
      // Fixo brasileiro sem código do país
      return `+55 (${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`
    }
  }

  // Para outros países ou formatos não reconhecidos
  return `+${cleanNumber}`
}

export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return ""

  // Remove todos os caracteres não numéricos
  const cleanNumber = phone.replace(/\D/g, "")

  // Se o número começa com 55 (Brasil), remove o código do país
  let numberToFormat = cleanNumber
  if (cleanNumber.startsWith("55") && cleanNumber.length >= 12) {
    numberToFormat = cleanNumber.slice(2) // Remove o "55"
  }

  // Formatar apenas com DDD e número
  if (numberToFormat.length >= 10) {
    const areaCode = numberToFormat.slice(0, 2)
    const number = numberToFormat.slice(2)

    if (number.length === 9) {
      // Celular: (11) 99999-9999
      return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`
    } else if (number.length === 8) {
      // Fixo: (11) 9999-9999
      return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`
    }
  }

  return phone
}

export function ensureBrazilianCountryCode(phone: string): string {
  const cleanNumber = phone.replace(/\D/g, "")
  return cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const targetDate = typeof date === "string" ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "agora mesmo"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""} atrás`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hora${diffInHours > 1 ? "s" : ""} atrás`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} dia${diffInDays > 1 ? "s" : ""} atrás`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} mês${diffInMonths > 1 ? "es" : ""} atrás`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} ano${diffInYears > 1 ? "s" : ""} atrás`
}

export function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
}

// Função para normalizar texto para busca (remove acentos, converte para minúsculo)
function normalizeForSearch(text: string): string {
  if (!text) return ""
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim()
}

// Função para busca mais profunda e robusta
export function createSearchMatcher(searchTerm: string) {
  if (!searchTerm || searchTerm.trim() === "") return () => true

  const normalizedSearch = normalizeForSearch(searchTerm)
  const searchWords = normalizedSearch.split(/\s+/).filter((word) => word.length > 0)

  return (item: any) => {
    // Campos para buscar - incluindo todos os dados do grupo
    const searchableFields = [
      // Dados do número
      item.phone?.replace(/\D/g, ""), // Número limpo (apenas dígitos)
      normalizeForSearch(item.name), // Nome do número
      formatPhoneNumber(item.phone), // Número formatado

      // Dados do grupo
      normalizeForSearch(item.groups?.name), // Nome do grupo
      normalizeForSearch(item.groups?.description), // Descrição do grupo
      normalizeForSearch(item.groups?.slug), // Slug do grupo
      item.groups?.id, // ID do grupo

      // Campos adicionais que podem existir
      normalizeForSearch(item.groups?.message), // Mensagem do grupo
      normalizeForSearch(item.description), // Descrição do número (se existir)
    ].filter(Boolean) // Remove valores nulos/undefined

    // Log para debug (remover em produção)
    if (searchWords.includes("debug")) {
      console.log("Campos de busca para item:", item.id, searchableFields)
    }

    // Verificar se todas as palavras da busca estão presentes em pelo menos um campo
    return searchWords.every((word) =>
      searchableFields.some((field) => {
        if (typeof field === "string") {
          return (
            field.includes(word) || // Busca normal
            field.replace(/\D/g, "").includes(word.replace(/\D/g, "")) // Busca removendo caracteres especiais
          )
        }
        // Para campos numéricos (como ID)
        return String(field).includes(word)
      }),
    )
  }
}
