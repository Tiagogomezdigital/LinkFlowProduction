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

interface NewGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewGroupDialog({ open, onOpenChange }: NewGroupDialogProps) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Creating group:", { name, slug })
    setIsSubmitting(false)
    onOpenChange(false)
    setName("")
    setSlug("")
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)

    // Auto-generate slug from name
    if (value) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
      setSlug(generatedSlug)
    } else {
      setSlug("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">Criar Novo Grupo</DialogTitle>
            <DialogDescription className="text-slate-400">
              Crie um novo grupo para gerenciar seus números de WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-300">
                Nome do Grupo
              </Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Ex: Vendas Premium"
                className="bg-slate-800 border-slate-700 text-white focus-visible:ring-lime-400"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug" className="text-slate-300">
                Slug (URL)
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ex: vendas-premium"
                className="bg-slate-800 border-slate-700 text-white focus-visible:ring-lime-400"
                required
              />
              <p className="text-xs text-slate-400">
                Este será o endereço público do seu grupo: linkflow.com/{slug || "seu-slug"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-lime-400 hover:bg-lime-500 text-black font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Grupo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
