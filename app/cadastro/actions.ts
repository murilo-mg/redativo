"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const cadastroSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  confirmarSenha: z.string().min(6),
});

export async function cadastro(formData: FormData) {
  const dados = {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    senha: String(formData.get("senha") ?? ""),
    confirmarSenha: String(formData.get("confirmarSenha") ?? ""),
  };

  const resultado = cadastroSchema.safeParse(dados);

  if (!resultado.success) {
    redirect("/cadastro?erro=Preencha os campos corretamente.");
  }

  if (dados.senha !== dados.confirmarSenha) {
    redirect("/cadastro?erro=As senhas não são iguais.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
    options: {
      data: {
        display_name: dados.nome,
      },
    },
  });

  if (error) {
    redirect("/cadastro?erro=Não foi possível criar a conta.");
  }

  if (!data.session) {
    redirect(
      "/login?mensagem=Cadastro criado. Verifique seu e-mail.",
    );
  }

  redirect("/dashboard");
}