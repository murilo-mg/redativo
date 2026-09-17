import Link from "next/link";
import { redirect } from "next/navigation";

import { EditorRedacao } from "@/components/redacoes/editor-redacao";
import { createClient } from "@/lib/supabase/server";

import { salvarRascunho } from "../actions";

type NovaRedacaoPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function NovaRedacaoPage({
  searchParams,
}: NovaRedacaoPageProps) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const parametros = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link
        href="/dashboard"
        className="text-sm underline underline-offset-4"
      >
        Voltar para o dashboard
      </Link>

      <h1 className="mt-8 text-4xl font-bold">Nova redação</h1>

      <p className="mt-2 text-zinc-400">
        Escreva sua redação e salve como rascunho.
      </p>

      {parametros.erro && (
        <p className="mt-6 rounded-md bg-red-950 px-4 py-3 text-red-200">
          {parametros.erro}
        </p>
      )}

      <EditorRedacao
        action={salvarRascunho}
        textoBotao="Salvar rascunho"
      />
    </main>
  );
}