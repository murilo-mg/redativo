import Link from "next/link";
import { redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/react";

import { EditorRedacao } from "@/components/redacoes/editor-redacao";
import { createClient } from "@/lib/supabase/server";

import { atualizarRedacao } from "../actions";

type EditarRedacaoPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    mensagem?: string;
    erro?: string;
  }>;
};

export default async function EditarRedacaoPage({
  params,
  searchParams,
}: EditarRedacaoPageProps) {
  const { id } = await params;
  const parametros = await searchParams;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims?.sub) {
    redirect("/login");
  }

  const { data: redacao, error } = await supabase
    .from("redacoes")
    .select(
      "id, titulo, tema, conteudo, texto_plain, status, created_at, updated_at",
    )
    .eq("id", id)
    .eq("aluno_id", String(authData.claims.sub))
    .maybeSingle();

  if (error || !redacao) {
    redirect("/dashboard?erro=Redação não encontrada.");
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link
        href="/dashboard"
        className="text-sm underline underline-offset-4"
      >
        Voltar para o dashboard
      </Link>

      <h1 className="mt-8 text-4xl font-bold">
        Continuar redação
      </h1>

      <p className="mt-2 text-zinc-400">
        Status atual: {redacao.status}
      </p>

      {parametros.mensagem && (
        <p className="mt-6 rounded-md bg-green-950 px-4 py-3 text-green-200">
          {parametros.mensagem}
        </p>
      )}

      {parametros.erro && (
        <p className="mt-6 rounded-md bg-red-950 px-4 py-3 text-red-200">
          {parametros.erro}
        </p>
      )}

      <EditorRedacao
        action={atualizarRedacao}
        id={redacao.id}
        tituloInicial={redacao.titulo}
        temaInicial={redacao.tema}
        conteudoInicial={redacao.conteudo as JSONContent}
        textoInicial={redacao.texto_plain ?? ""}
        textoBotao="Atualizar rascunho"
      />
    </main>
  );
}