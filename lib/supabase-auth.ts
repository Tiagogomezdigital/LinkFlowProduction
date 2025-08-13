import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getSupabaseClient } from "./supabase";

// Usar o cliente centralizado para autenticação
export const supabaseAuth = getSupabaseClient()

// Função de login simplificada
export async function loginUser(email: string, password: string) {
  console.log("🔐 Iniciando login para:", email)

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  })

  console.log("📊 Resultado do login:", {
    success: !error,
    user: data?.user?.email,
    error: error?.message,
  })

  return { data, error }
}

// Função de logout
export async function logoutUser() {
  const { error } = await supabaseAuth.auth.signOut()
  return { error }
}

// Verificar sessão atual
export async function getCurrentSession() {
  const { data } = await supabaseAuth.auth.getSession()
  return data.session
}

export async function getUserSession() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  return data.session;
}
