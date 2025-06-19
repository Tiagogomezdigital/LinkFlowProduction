import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/supabase-auth";
import ClientRelatorios from "@/components/reports/ClientRelatorios";

export default async function RelatoriosPage() {
  const session = await getUserSession();
  if (!session) return redirect("/login");
  return <ClientRelatorios />;
} 