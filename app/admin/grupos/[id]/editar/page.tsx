import { GroupFormPage } from "@/components/group-form-page"

interface EditGroupPageProps {
  params: {
    id: string
  }
}

export default function EditGroupPage({ params }: EditGroupPageProps) {
  return <GroupFormPage groupId={params.id} />
}
