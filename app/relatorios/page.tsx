import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/supabase-auth";
import dynamic from "next/dynamic";

export default async function RelatoriosPage() {
  const session = await getUserSession();
  if (!session) return redirect("/login");
  const ClientRelatorios = dynamic(() => import("@/components/reports/ClientRelatorios"), { ssr: false });
  return <ClientRelatorios />;
} 