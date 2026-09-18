import Link from "next/link";
import { redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/react";

import { EditorRedacao } from "@/components/redacoes/editor-redacao";
import { BotaoCorrigir } from "@/components/redacoes/botao-corrigir";
import { createClient } from "@/lib/supabase/server";

import {
  atualizarRedacao,
  enviarParaCorrecao,
} from "../actions";

type EditarRedacaoPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    mensagem?: string;
    erro?: string;
  }>;
};

type Competencia = {
  nota: number;
  feedback: string;
  pontos_melhoria: string[];
};

type Competencias = {
  C1?: Competencia;
  C2?: Competencia;
  C3?: Competencia;
  C4?: Competencia;
  C5?: Competencia;
};

const nomesCompetencias = {
  C1: "Competência 1 - Norma padrão",
  C2: "Competência 2 - Compreensão do tema",
  C3: "Competência 3 - Argumentação",
  C4: "Competência 4 - Coesão",
  C5: "Competência 5 - Proposta de intervenção",
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

  const { data: correcao } = await supabase
    .from("correcoes")
    .select(
      "id, nota_total, competencias, observacoes_gerais, origem, criado_em, atualizado_em",
    )
    .eq("redacao_id", redacao.id)
    .eq("aluno_id", String(authData.claims.sub))
    .maybeSingle();

  const competencias =
    (correcao?.competencias as Competencias | null) ?? {};

  const observacoesGerais =
    (correcao?.observacoes_gerais as string[] | null) ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link
        href="/dashboard"
        className="text-sm underline underline-offset-4"
      >
        Voltar para o dashboard
      </Link>

      <h1 className="mt-8 text-4xl font-bold">
        {redacao.titulo}
      </h1>

      <p className="mt-2 text-zinc-400">
        Tema: {redacao.tema}
      </p>

      <p className="mt-1 text-zinc-400">
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

      {redacao.status === "rascunho" && (
        <form action={enviarParaCorrecao} className="mt-4">
          <input
            type="hidden"
            name="id"
            value={redacao.id}
          />

          <button
            type="submit"
            className="rounded-md bg-purple-600 px-5 py-2 font-medium text-white hover:bg-purple-700"
          >
            Enviar para correção
          </button>
        </form>
      )}

      {redacao.status === "enviada" && (
        <div className="mt-6 rounded-md bg-yellow-950 px-4 py-4 text-yellow-200">
          <p>Redação enviada e aguardando correção.</p>

          <BotaoCorrigir redacaoId={redacao.id} />
        </div>
      )}

      {redacao.status === "corrigida" && correcao && (
        <section className="mt-10 space-y-6">
          <div className="rounded-lg border border-purple-700 bg-purple-950 p-6">
            <p className="text-sm text-purple-200">
              Nota estimada pela IA
            </p>

            <p className="mt-2 text-5xl font-bold text-white">
              {correcao.nota_total}/1000
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Correção por competência
            </h2>

            <div className="mt-4 space-y-4">
              {Object.entries(nomesCompetencias).map(
                ([codigo, nome]) => {
                  const competencia =
                    competencias[
                      codigo as keyof Competencias
                    ];

                  if (!competencia) {
                    return null;
                  }

                  return (
                    <article
                      key={codigo}
                      className="rounded-lg border border-zinc-700 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-bold">{nome}</h3>

                        <span className="rounded-md bg-zinc-800 px-3 py-1 font-bold">
                          {competencia.nota}/200
                        </span>
                      </div>

                      <p className="mt-3 text-zinc-300">
                        {competencia.feedback}
                      </p>

                      {competencia.pontos_melhoria.length > 0 && (
                        <div className="mt-4">
                          <p className="font-medium">
                            Pontos para melhorar:
                          </p>

                          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
                            {competencia.pontos_melhoria.map(
                              (ponto) => (
                                <li key={ponto}>{ponto}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          </div>

          {observacoesGerais.length > 0 && (
            <div className="rounded-lg border border-zinc-700 p-5">
              <h2 className="text-xl font-bold">
                Observações gerais
              </h2>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-300">
                {observacoesGerais.map((observacao) => (
                  <li key={observacao}>{observacao}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}