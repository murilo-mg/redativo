import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { corrigirRedacaoComIA } from "@/lib/ia";

const requisicaoSchema = z.object({
  redacaoId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getClaims();

    if (!authData?.claims?.sub) {
      return NextResponse.json(
        {
          erro: "Usuário não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    const corpo = await request.json();

    const resultadoRequisicao =
      requisicaoSchema.safeParse(corpo);

    if (!resultadoRequisicao.success) {
      return NextResponse.json(
        {
          erro: "ID da redação inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const { redacaoId } = resultadoRequisicao.data;

    const { data: redacao, error: erroRedacao } =
      await supabase
        .from("redacoes")
        .select("id, tema, texto_plain, status")
        .eq("id", redacaoId)
        .eq("aluno_id", String(authData.claims.sub))
        .maybeSingle();

    if (erroRedacao || !redacao) {
      return NextResponse.json(
        {
          erro: "Redação não encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      redacao.status !== "enviada" &&
      redacao.status !== "corrigida"
    ) {
      return NextResponse.json(
        {
          erro: "Envie a redação antes de solicitar a correção.",
        },
        {
          status: 400,
        },
      );
    }

    const texto = String(redacao.texto_plain ?? "").trim();

    if (texto.length < 100) {
      return NextResponse.json(
        {
          erro: "A redação precisa ter pelo menos 100 caracteres.",
        },
        {
          status: 400,
        },
      );
    }

    const correcao = await corrigirRedacaoComIA(
  redacao.texto_plain,
  redacao.tema,
);

    const notaTotal =
      correcao.competencias.C1.nota +
      correcao.competencias.C2.nota +
      correcao.competencias.C3.nota +
      correcao.competencias.C4.nota +
      correcao.competencias.C5.nota;

    const { error: erroCorrecao } = await supabase
      .from("correcoes")
      .upsert(
        {
          redacao_id: redacao.id,
          aluno_id: String(authData.claims.sub),
          nota_total: notaTotal,
          competencias: correcao.competencias,
          observacoes_gerais: correcao.observacoes_gerais,
          origem: "ia",
          atualizado_em: new Date().toISOString(),
        },
        {
          onConflict: "redacao_id",
        },
      );

    if (erroCorrecao) {
      console.error(
        "Erro ao salvar correção:",
        erroCorrecao,
      );

      return NextResponse.json(
        {
          erro: "A correção foi gerada, mas não pôde ser salva.",
        },
        {
          status: 500,
        },
      );
    }

    const { error: erroStatus } = await supabase
      .from("redacoes")
      .update({
        status: "corrigida",
        updated_at: new Date().toISOString(),
      })
      .eq("id", redacao.id)
      .eq("aluno_id", String(authData.claims.sub));

    if (erroStatus) {
      console.error(
        "Erro ao atualizar status:",
        erroStatus,
      );

      return NextResponse.json(
        {
          erro: "Correção salva, mas o status não foi atualizado.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      sucesso: true,
      nota_total: notaTotal,
      competencias: correcao.competencias,
      observacoes_gerais: correcao.observacoes_gerais,
    });
  } catch (erro) {
  console.error("Erro na correção por IA:", erro);

  return NextResponse.json(
    {
      erro:
        "O serviço de correção está temporariamente indisponível. Tente novamente.",
    },
    {
      status: 503,
    },
  );
}
}