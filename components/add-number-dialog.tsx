"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createNumber } from "@/lib/api/numbers"

interface AddNumberDialogProps {
  groupId: string
  isOpen: boolean
  onClose: () => void
  onNumberAdded: () => void
}

export function AddNumberDialog({ groupId, isOpen, onClose, onNumberAdded }: AddNumberDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [number, setNumber] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [customMessage, setCustomMessage] = useState("")

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "")
    const withoutCountry = digits.startsWith("55") ? digits.slice(2) : digits
    if (withoutCountry.length === 0) return ""
    const ddd = withoutCountry.slice(0, 2)
    const rest = withoutCountry.slice(2)
    let formatted = `(`
    formatted += ddd
    if (ddd.length === 2) formatted += ") "
    if (rest.length > 5) {
      formatted += `${rest.slice(0, 5)}-${rest.slice(5, 9)}`
    } else if (rest) {
      formatted += rest
    }
    return formatted.trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!number) {
      toast({
        title: "Número obrigatório",
        description: "Por favor, informe o número de telefone.",
        variant: "destructive",
      })
      return
    }

    // Limpar o número (remover formatação)
    const cleanNumber = number.replace(/\D/g, "")

    setIsSubmitting(true)
    try {
      await createNumber({
        number: cleanNumber,
        description,
        group_id: groupId,
        is_active: isActive,
        custom_message: customMessage,
      })

      toast({
        title: "Número adicionado",
        description: "O número foi adicionado com sucesso.",
        variant: "default",
      })

      // Limpar o formulário
      setNumber("")
      setDescription("")
      setIsActive(true)
      setCustomMessage("")

      // Fechar o diálogo e notificar o componente pai
      onClose()
      onNumberAdded()
    } catch (error) {
      console.error("Error adding number:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o número.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Adicionar número</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adicione um novo número de WhatsApp para este grupo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="number" className="text-slate-300">
                Número de telefone
              </Label>
              <Input
                id="number"
                placeholder="(11) 99999-9999"
                value={number}
                onChange={(e) => setNumber(formatPhone(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-300">
                Descrição (opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Ex: Atendimento principal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customMessage" className="text-slate-300">
                Mensagem Personalizada (opcional)
              </Label>
              <Textarea
                id="customMessage"
                placeholder="Ex: Olá! Sou da equipe de vendas. Como posso ajudar?"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-400">Se não informada, será usada a mensagem padrão do grupo</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-lime-400"
              />
              <Label htmlFor="active" className="text-slate-300">
                Ativo
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-lime-600 hover:bg-lime-700 text-white">
              {isSubmitting ? "Adicionando..." : "Adicionar número"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
