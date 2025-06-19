"use client"

import { useSearchParams } from "next/navigation"
import { GroupFormPage } from "@/components/group-form-page"

export default function NewGroupPage() {
  const searchParams = useSearchParams()
  const groupId = searchParams.get("id")

  return <GroupFormPage mode="create" groupId={groupId || undefined} />
}
