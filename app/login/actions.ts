"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(formData: FormData) {
  const resultado = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });

  if (!resultado.success) {
    redirect("/login?erro=Preencha os dados corretamente.");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: resultado.data.email,
    password: resultado.data.password,
  });

  if (error) {
    redirect("/login?erro=E-mail ou senha inválidos.");
  }

  redirect("/dashboard");
}