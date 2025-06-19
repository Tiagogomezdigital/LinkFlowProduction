import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/supabase-auth";
import dynamic from "next/dynamic";

export default async function AnalyticsPage() {
  const session = await getUserSession();
  if (!session) return redirect("/login");
  return <ClientDashboard />;
}

const ClientDashboard = dynamic(() => import("@/components/analytics/ClientDashboard"), { ssr: false }); 