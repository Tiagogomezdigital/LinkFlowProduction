"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { normalizeSlug } from "@/lib/utils"
import { createGroup, updateGroup, checkSlugAvailability } from "@/lib/api/groups"
import { ENV_CONFIG } from "@/lib/env-config"
import type { Group } from "@/lib/types"

const groupFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome do grupo deve ter pelo menos 3 caracteres",
  }),
  slug: z
    .string()
    .min(3, {
      message: "O slug deve ter pelo menos 3 caracteres",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "O slug deve conter apenas letras minúsculas, números e hífens",
    }),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  default_message: z.string().optional(),
})

type GroupFormValues = z.infer<typeof groupFormSchema>

interface GroupFormProps {
  defaultValues?: Partial<Group>
}

export function GroupForm({ defaultValues }: GroupFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [previousName, setPreviousName] = useState("")

  const isEditMode = !!defaultValues?.id

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      slug: defaultValues?.slug || "",
      description: defaultValues?.description || "",
      is_active: defaultValues?.is_active ?? true,
      default_message: defaultValues?.default_message || "",
    },
  })

  // Inicializar o previousName com o valor inicial do nome
  useEffect(() => {
    setPreviousName(form.getValues("name"))
  }, [])

  const handleNameChange = (value: string) => {
    // Armazenar o valor anterior para comparação
    const currentSlug = form.getValues("slug")
    const generatedSlug = normalizeSlug(value)

    // Se o slug estiver vazio ou for igual ao slug gerado do nome anterior,
    // atualize-o para corresponder ao novo nome
    if (!currentSlug || currentSlug === normalizeSlug(previousName)) {
      form.setValue("slug", generatedSlug, { shouldValidate: true })
    }

    // Atualizar o nome anterior
    setPreviousName(value)
  }

  const handleSlugChange = async (value: string) => {
    const normalizedSlug = normalizeSlug(value)
    form.setValue("slug", normalizedSlug)

    if (normalizedSlug.length >= 3) {
      setIsCheckingSlug(true)
      try {
        const isAvailable = await checkSlugAvailability(normalizedSlug, defaultValues?.id)
        if (!isAvailable) {
          form.setError("slug", {
            type: "manual",
            message: "Este slug já está em uso. Escolha outro.",
          })
        } else {
          form.clearErrors("slug")
        }
      } catch (error) {
        console.error("Error checking slug availability:", error)
      } finally {
        setIsCheckingSlug(false)
      }
    }
  }

  async function onSubmit(data: GroupFormValues) {
    setIsSubmitting(true)

    try {
      if (isEditMode && defaultValues?.id) {
        await updateGroup(defaultValues.id, data)
        toast({
          title: "Grupo atualizado!",
          description: `O grupo "${data.name}" foi atualizado com sucesso.`,
          variant: "success",
        })
      } else {
        await createGroup(data)
        toast({
          title: "Grupo criado!",
          description: `O grupo "${data.name}" foi criado com sucesso.`,
          variant: "success",
        })
      }

      router.push("/admin/grupos")
    } catch (error: any) {
      console.error("Erro ao salvar grupo:", error)

      let errorMessage = "Ocorreu um erro ao salvar o grupo. Tente novamente."

      if (error.code === "23505") {
        errorMessage = "Já existe um grupo com este slug. Escolha outro."
      }

      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="ds-label">Nome do Grupo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Equipe de Vendas"
                    className="ds-input"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handleNameChange(e.target.value)
                    }}
                  />
                </FormControl>
                <FormDescription className="ds-small">Nome que aparecerá no dashboard</FormDescription>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="ds-label">Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="equipe-vendas"
                      className="ds-input"
                      {...field}
                      onChange={(e) => handleSlugChange(e.target.value)}
                    />
                    {isCheckingSlug && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription className="ds-small">
                  URL pública: {ENV_CONFIG.SITE_URL}/l/{field.value || "seu-slug"}
                </FormDescription>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="ds-label">Descrição (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o propósito deste grupo..."
                    className="ds-input min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="default_message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="ds-label">Mensagem Padrão do Grupo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ex: Olá! Vim através do nosso site. Como posso ajudar?"
                    className="ds-input min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="ds-small">
                  Esta mensagem será usada quando o número não tiver mensagem personalizada
                </FormDescription>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-700 p-6">
                <div className="space-y-1">
                  <FormLabel className="ds-body">Grupo Ativo</FormLabel>
                  <FormDescription className="ds-small">
                    Quando ativo, o grupo estará disponível para receber cliques
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-lime-400"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/grupos")}
              className="ds-button-outline"
            >
              Cancelar
            </Button>
            <Button type="submit" className="ds-button-primary" disabled={isSubmitting || isCheckingSlug}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent mr-2" />
                  Salvando...
                </>
              ) : (
                <>Salvar Grupo</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
