import "server-only";

import { z } from "zod";

const competenciaSchema = z.object({
  nota: z.number().int().min(0).max(200),
  feedback: z.string().min(1),
  pontos_melhoria: z.array(z.string()),
});

export const correcaoIASchema = z.object({
  competencias: z.object({
    C1: competenciaSchema,
    C2: competenciaSchema,
    C3: competenciaSchema,
    C4: competenciaSchema,
    C5: competenciaSchema,
  }),
  observacoes_gerais: z.array(z.string()),
});

export type CorrecaoIA = z.infer<typeof correcaoIASchema>;

const schemaGemini = {
  type: "object",
  properties: {
    competencias: {
      type: "object",
      properties: {
        C1: {
          type: "object",
          properties: {
            nota: {
              type: "integer",
              minimum: 0,
              maximum: 200,
            },
            feedback: {
              type: "string",
            },
            pontos_melhoria: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["nota", "feedback", "pontos_melhoria"],
        },
        C2: {
          type: "object",
          properties: {
            nota: {
              type: "integer",
              minimum: 0,
              maximum: 200,
            },
            feedback: {
              type: "string",
            },
            pontos_melhoria: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["nota", "feedback", "pontos_melhoria"],
        },
        C3: {
          type: "object",
          properties: {
            nota: {
              type: "integer",
              minimum: 0,
              maximum: 200,
            },
            feedback: {
              type: "string",
            },
            pontos_melhoria: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["nota", "feedback", "pontos_melhoria"],
        },
        C4: {
          type: "object",
          properties: {
            nota: {
              type: "integer",
              minimum: 0,
              maximum: 200,
            },
            feedback: {
              type: "string",
            },
            pontos_melhoria: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["nota", "feedback", "pontos_melhoria"],
        },
        C5: {
          type: "object",
          properties: {
            nota: {
              type: "integer",
              minimum: 0,
              maximum: 200,
            },
            feedback: {
              type: "string",
            },
            pontos_melhoria: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["nota", "feedback", "pontos_melhoria"],
        },
      },
      required: ["C1", "C2", "C3", "C4", "C5"],
    },
    observacoes_gerais: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["competencias", "observacoes_gerais"],
};

function obterStatusDoErro(erro: unknown): number | null {
  if (typeof erro !== "object" || erro === null) {
    return null;
  }

  const erroComStatus = erro as {
    status?: unknown;
    code?: unknown;
  };

  if (typeof erroComStatus.status === "number") {
    return erroComStatus.status;
  }

  if (
    erroComStatus.code === "429" ||
    erroComStatus.code === "RESOURCE_EXHAUSTED"
  ) {
    return 429;
  }

  return null;
}

function erroPodeSerRepetido(erro: unknown): boolean {
  const status = obterStatusDoErro(erro);

  if (status === 429) {
    return true;
  }

  if (status !== null && status >= 500) {
    return true;
  }

  const codigo =
    typeof erro === "object" && erro !== null
      ? String((erro as { code?: unknown }).code ?? "")
      : "";

  const mensagem =
    erro instanceof Error
      ? erro.message.toLowerCase()
      : String(erro).toLowerCase();

  return (
    codigo === "ECONNRESET" ||
    codigo === "ECONNREFUSED" ||
    codigo === "ETIMEDOUT" ||
    codigo === "ABORT_ERR" ||
    mensagem.includes("resource_exhausted") ||
    mensagem.includes("too many requests") ||
    mensagem.includes("internal server error") ||
    mensagem.includes("fetch failed") ||
    mensagem.includes("aborted") ||
    mensagem.includes("timed out")
  );
}

function esperar(milisegundos: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milisegundos);
  });
}

function construirPrompt(texto: string, tema: string) {
  return `
Você é um avaliador especializado na redação do ENEM.

Avalie a redação considerando exclusivamente as cinco competências oficiais:

Competência 1:
Domínio da modalidade escrita formal da língua portuguesa.

Competência 2:
Compreensão da proposta de redação e desenvolvimento do tema dentro dos limites estruturais do texto dissertativo-argumentativo.

Competência 3:
Seleção, relação, organização e interpretação de informações, fatos, opiniões e argumentos em defesa de um ponto de vista.

Competência 4:
Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.

Competência 5:
Elaboração de proposta de intervenção para o problema abordado, respeitando os direitos humanos.

Para cada competência:

- atribua uma nota inteira entre 0 e 200;
- explique objetivamente a nota;
- apresente pontos específicos de melhoria;
- não invente informações que não estejam na redação;
- não avalie o aluno de forma ofensiva;
- não forneça uma nota total, pois ela será calculada pelo sistema.

Tema da redação:
${tema}

Texto da redação:
${texto}
`;
}

export async function corrigirRedacaoComIA(
  texto: string,
  tema: string,
): Promise<CorrecaoIA> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const modelo =
    process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";


  const prompt = construirPrompt(texto, tema);

  const maxTentativas = 4;

  for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
    try {

const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
  modelo,
)}:generateContent`;

const respostaHttp = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  },
  signal: AbortSignal.timeout(60000),
  body: JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schemaGemini,
      temperature: 0.2,
    },
  }),
});

const corpo = (await respostaHttp.json()) as {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

if (!respostaHttp.ok) {
  const erro = new Error(
    corpo.error?.message ||
      `Erro HTTP do Gemini: ${respostaHttp.status}`,
  ) as Error & {
    status?: number;
  };

  erro.status = respostaHttp.status;

  throw erro;
}

const textoResposta =
  corpo.candidates?.[0]?.content?.parts
    ?.map((parte) => parte.text ?? "")
    .join("") ?? "";

if (!textoResposta) {
  throw new Error("O Gemini retornou uma resposta vazia.");
}
      
      if (!textoResposta) {
        throw new Error("A API Gemini retornou uma resposta vazia.");
      }

      const respostaJson: unknown = JSON.parse(textoResposta);

      return correcaoIASchema.parse(respostaJson);
    } catch (erro) {
      const ultimaTentativa = tentativa === maxTentativas - 1;

      if (ultimaTentativa || !erroPodeSerRepetido(erro)) {
        throw erro;
      }

      const atraso = 1000 * 2 ** tentativa;

      console.warn(
        `Gemini falhou. Nova tentativa em ${atraso} ms.`,
      );

      await esperar(atraso);
    }
  }

  throw new Error("Não foi possível corrigir a redação.");
}