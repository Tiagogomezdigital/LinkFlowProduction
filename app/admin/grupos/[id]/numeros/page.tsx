import { NumbersManagementPage } from "@/components/numbers-management-page"

interface GroupNumbersPageProps {
  params: {
    id: string
  }
}

export default function GroupNumbersPage({ params }: GroupNumbersPageProps) {
  return <NumbersManagementPage groupId={params.id} />
}
