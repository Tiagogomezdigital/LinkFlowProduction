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

interface AddNumberToGroupDialogProps {
  groupId: string
  groupName: string
  isOpen: boolean
  onClose: () => void
  onNumberAdded: () => void
}

export function AddNumberToGroupDialog({
  groupId,
  groupName,
  isOpen,
  onClose,
  onNumberAdded,
}: AddNumberToGroupDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [number, setNumber] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [customMessage, setCustomMessage] = useState("")

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

    if (cleanNumber.length < 10) {
      toast({
        title: "Número inválido",
        description: "Por favor, informe um número válido com DDD.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createNumber({
        number: cleanNumber,
        description: description || `Número do grupo ${groupName}`,
        group_id: groupId,
        is_active: isActive,
        custom_message: customMessage,
      })

      toast({
        title: "Número adicionado",
        description: `O número foi adicionado ao grupo "${groupName}" com sucesso.`,
        variant: "success",
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
        description: "Não foi possível adicionar o número. Verifique se o número já não está cadastrado.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setNumber(formatted)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Adicionar Número</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adicione um novo número de WhatsApp ao grupo "{groupName}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="number" className="text-sm font-medium text-slate-300">
                Número de telefone *
              </Label>
              <Input
                id="number"
                placeholder="(11) 99999-9999"
                value={number}
                onChange={handlePhoneChange}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-lime-400"
                maxLength={15}
              />
              <p className="text-xs text-slate-500">Formato: (XX) XXXXX-XXXX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-300">
                Descrição (opcional)
              </Label>
              <Input
                id="description"
                placeholder="Ex: Atendimento principal, Vendas, Suporte..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-lime-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMessage" className="text-sm font-medium text-slate-300">
                Mensagem Personalizada (opcional)
              </Label>
              <Textarea
                id="customMessage"
                placeholder="Ex: Olá! Sou da equipe de vendas. Como posso ajudar?"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-lime-400 min-h-20"
                rows={3}
              />
              <p className="text-xs text-slate-500">Se não informada, será usada a mensagem padrão do grupo</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-lime-400"
              />
              <Label htmlFor="active" className="text-sm font-medium text-slate-300">
                Número ativo (recebe redirecionamentos)
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !number}
              className="bg-lime-400 text-black hover:bg-lime-500 font-semibold px-6"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar Número"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
