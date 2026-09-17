"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const redacaoSchema = z.object({
  titulo: z.string().min(1),
  tema: z.string().min(1),
  conteudo: z.string().min(1),
  texto_plain: z.string(),
});

function interpretarConteudo(conteudo: string) {
  try {
    return JSON.parse(conteudo);
  } catch {
    return null;
  }
}

export async function salvarRascunho(formData: FormData) {
  const resultado = redacaoSchema.safeParse({
    titulo: String(formData.get("titulo") ?? "").trim(),
    tema: String(formData.get("tema") ?? "").trim(),
    conteudo: String(formData.get("conteudo") ?? ""),
    texto_plain: String(formData.get("texto_plain") ?? ""),
  });

  if (!resultado.success) {
    redirect("/redacoes/nova?erro=Preencha o título e o tema.");
  }

  const conteudoJson = interpretarConteudo(resultado.data.conteudo);

  if (!conteudoJson) {
    redirect("/redacoes/nova?erro=O conteúdo da redação é inválido.");
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase.from("redacoes").insert({
    aluno_id: String(authData.claims.sub),
    titulo: resultado.data.titulo,
    tema: resultado.data.tema,
    conteudo: conteudoJson,
    texto_plain: resultado.data.texto_plain,
    status: "rascunho",
    origem: "livre",
  });

  if (error) {
    console.error("Erro ao salvar redação:", error);

    redirect(
      "/redacoes/nova?erro=Não foi possível salvar a redação.",
    );
  }

  revalidatePath("/dashboard");

  redirect("/dashboard?mensagem=Rascunho salvo com sucesso.");
}

export async function atualizarRedacao(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  const resultado = redacaoSchema.safeParse({
    titulo: String(formData.get("titulo") ?? "").trim(),
    tema: String(formData.get("tema") ?? "").trim(),
    conteudo: String(formData.get("conteudo") ?? ""),
    texto_plain: String(formData.get("texto_plain") ?? ""),
  });

  if (!id || !resultado.success) {
    redirect(
      `/redacoes/${id}?erro=Preencha os dados corretamente.`,
    );
  }

  const conteudoJson = interpretarConteudo(resultado.data.conteudo);

  if (!conteudoJson) {
    redirect(
      `/redacoes/${id}?erro=O conteúdo da redação é inválido.`,
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims?.sub) {
    redirect("/login");
  }

  const { data: redacaoAtualizada, error } = await supabase
    .from("redacoes")
    .update({
      titulo: resultado.data.titulo,
      tema: resultado.data.tema,
      conteudo: conteudoJson,
      texto_plain: resultado.data.texto_plain,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("aluno_id", String(authData.claims.sub))
    .select("id")
    .maybeSingle();

  if (error || !redacaoAtualizada) {
    console.error("Erro ao atualizar redação:", error);

    redirect(
      `/redacoes/${id}?erro=Não foi possível atualizar a redação.`,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/redacoes/${id}`);

  redirect(
    `/redacoes/${id}?mensagem=Redação atualizada com sucesso.`,
  );
}