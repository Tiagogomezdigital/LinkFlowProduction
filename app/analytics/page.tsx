import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/supabase-auth";
import ClientDashboard from "@/components/analytics/ClientDashboard";

export default async function AnalyticsPage() {
  const session = await getUserSession();
  if (!session) return redirect("/login");
  return <ClientDashboard />;
} 