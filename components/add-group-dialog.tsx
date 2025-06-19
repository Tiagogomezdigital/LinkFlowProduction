'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { createGroup } from '@/lib/api/groups'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGroupAdded: () => void
}

export function AddGroupDialog({ open, onOpenChange, onGroupAdded }: Props) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', defaultMsg: '', isActive: true })

  const handleNameChange = (value: string) => {
    const slugGen = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    setForm((prev) => ({ ...prev, name: value, slug: slugGen }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) {
      toast({ title: 'Nome e slug são obrigatórios', variant: 'destructive' })
      return
    }
    try {
      setIsSubmitting(true)
      await createGroup({ name: form.name, slug: form.slug, description: form.description, is_active: form.isActive })
      toast({ title: 'Grupo criado', variant: 'default' })
      onOpenChange(false)
      onGroupAdded()
    } catch (err) {
      toast({ title: 'Erro ao criar grupo', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Grupo</DialogTitle>
          <DialogDescription className="text-slate-400">Preencha as informações do grupo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nome *</Label>
            <Input placeholder="Ex: Equipe de Vendas" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="bg-slate-800 border-slate-700 placeholder:text-slate-500" />
            <p className="text-xs text-slate-400">Nome que aparecerá no dashboard</p>
          </div>
          <div className="grid gap-2">
            <Label>Slug *</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-slate-800 border-slate-700" />
            <p className="text-xs text-slate-400">URL pública: https://whatsapp.aescoladenegocios.com.br/l/<span className="font-mono">{form.slug || 'seu-slug'}</span></p>
          </div>
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Textarea placeholder="Descreva o propósito deste grupo..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-slate-800 border-slate-700 placeholder:text-slate-500" />
          </div>
          <div className="grid gap-2">
            <Label>Mensagem Padrão do Grupo</Label>
            <Textarea placeholder="Ex: Olá! Vim através do nosso site. Como posso ajudar?" value={form.defaultMsg} onChange={(e) => setForm({ ...form, defaultMsg: e.target.value })} className="bg-slate-800 border-slate-700 placeholder:text-slate-500" />
            <p className="text-xs text-slate-400">Esta mensagem será usada quando o número não tiver mensagem personalizada</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} className="data-[state=checked]:bg-lime-400" />
            <Label>Grupo Ativo</Label>
            <p className="text-xs text-slate-400 ml-2">Quando ativo, o grupo estará disponível para receber cliques</p>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="border-slate-700 text-slate-300">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-lime-400 text-black hover:bg-lime-500">{isSubmitting ? 'Salvando...' : 'Criar Grupo'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 