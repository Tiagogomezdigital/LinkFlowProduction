"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command'
import { ChevronsUpDown, Check } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { createNumber } from "@/lib/api/numbers"
import { getGroups } from "@/lib/api/groups"
import type { Group } from "@/lib/types"

interface AddGlobalNumberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNumberAdded: () => void
}

export function AddGlobalNumberDialog({ open, onOpenChange, onNumberAdded }: AddGlobalNumberDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [groupSelectOpen, setGroupSelectOpen] = useState(false)

  const [formData, setFormData] = useState({
    number: "",
    description: "",
    groupId: "",
    isActive: true,
    customMessage: "",
  })

  useEffect(() => {
    if (open) {
      loadGroups()
    }
  }, [open])

  const loadGroups = async () => {
    try {
      setIsLoadingGroups(true)
      const groupsData = await getGroups()
      setGroups(groupsData)
    } catch (error) {
      console.error("Error loading groups:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os grupos.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingGroups(false)
    }
  }

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

    if (!formData.number) {
      toast({
        title: "Número obrigatório",
        description: "Por favor, informe o número de telefone.",
        variant: "destructive",
      })
      return
    }

    if (!formData.groupId) {
      toast({
        title: "Grupo obrigatório",
        description: "Por favor, selecione um grupo para o número.",
        variant: "destructive",
      })
      return
    }

    // Limpar o número (remover formatação)
    const cleanNumber = formData.number.replace(/\D/g, "")

    setIsSubmitting(true)
    try {
      await createNumber({
        number: cleanNumber,
        description: formData.description,
        group_id: formData.groupId,
        is_active: formData.isActive,
        custom_message: formData.customMessage || undefined,
      })

      toast({
        title: "Número adicionado",
        description: "O número foi adicionado com sucesso.",
        variant: "default",
      })

      // Limpar o formulário
      setFormData({
        number: "",
        description: "",
        groupId: "",
        isActive: true,
        customMessage: "",
      })

      // Fechar o diálogo e notificar o componente pai
      onOpenChange(false)
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

  const handleClose = () => {
    setFormData({
      number: "",
      description: "",
      groupId: "",
      isActive: true,
      customMessage: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Adicionar Número</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adicione um novo número de WhatsApp ao sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Grupo *</Label>
              <Popover open={groupSelectOpen} onOpenChange={setGroupSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-slate-800 border-slate-700 text-white"
                    disabled={isLoadingGroups}
                  >
                    {formData.groupId
                      ? groups.find((g) => g.id === formData.groupId)?.name
                      : isLoadingGroups
                      ? 'Carregando...'
                      : 'Selecione um grupo'}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-slate-800 border-slate-700 w-[300px] overflow-y-auto max-h-72">
                  <Command>
                    <CommandInput placeholder="Buscar grupo..." className="text-sm bg-slate-900" />
                    <CommandEmpty className="py-2 text-center text-sm">Nenhum grupo encontrado.</CommandEmpty>
                    <CommandList className="max-h-60 overflow-y-auto">
                      {groups.map((g) => (
                        <CommandItem
                          key={g.id}
                          value={g.name}
                          onSelect={() => {
                            setFormData((prev) => ({ ...prev, groupId: g.id }))
                            setGroupSelectOpen(false)
                          }}
                          className="flex gap-2 text-sm"
                        >
                          {formData.groupId === g.id && <Check className="h-4 w-4 text-lime-400" />}
                          <span>{g.name}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="number" className="text-slate-300">
                Número de telefone *
              </Label>
              <Input
                id="number"
                placeholder="(11) 99999-9999"
                value={formData.number}
                onChange={(e) => setFormData((prev) => ({ ...prev, number: formatPhone(e.target.value) }))}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-300">
                Descrição (opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Ex: Atendimento principal"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customMessage" className="text-slate-300">
                Mensagem Personalizada (opcional)
              </Label>
              <Textarea
                id="customMessage"
                placeholder="Ex: Olá! Sou da equipe de vendas. Como posso ajudar?"
                value={formData.customMessage}
                onChange={(e) => setFormData((prev) => ({ ...prev, customMessage: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">Se não informada, será usada a mensagem padrão do grupo</p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
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
              onClick={handleClose}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingGroups}
              className="bg-lime-400 hover:bg-lime-500 text-black"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar Número"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
