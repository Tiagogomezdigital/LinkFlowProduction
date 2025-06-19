import { GroupFormPage } from "@/components/group-form-page"

interface EditGroupPageProps {
  params: {
    id: string
  }
}

export default function EditGroupPage({ params }: EditGroupPageProps) {
  // Em um cenário real, você buscaria os dados do grupo pelo ID
  const groupData = {
    id: params.id,
    name: "Equipe de Vendas",
    slug: "equipe-vendas",
    description: "Grupo responsável pelo atendimento de vendas via WhatsApp",
  }

  return <GroupFormPage mode="edit" defaultValues={groupData} />
}
