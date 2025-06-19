import { NumbersManagementPage } from "@/components/numbers-management-page"

interface NumbersPageProps {
  params: {
    id: string
  }
}

export default function NumbersPage({ params }: NumbersPageProps) {
  // Em um cenário real, você buscaria os dados do grupo pelo ID
  const groupData = {
    id: params.id,
    name: "Equipe de Vendas",
    slug: "equipe-vendas",
    totalNumbers: 5,
  }

  return <NumbersManagementPage group={groupData} />
}
