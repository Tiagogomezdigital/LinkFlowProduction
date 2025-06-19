"use client"

import { UltraSafeGroupAnalytics } from "@/components/ultra-safe-group-analytics"
import { useParams } from "next/navigation"

export default function GroupAnalyticsPage() {
  const params = useParams()
  const groupId = params.id as string
  return (
    <div className="container mx-auto py-6">
      <UltraSafeGroupAnalytics groupId={groupId} />
    </div>
  )
}
