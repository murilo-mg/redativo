"use client";

import { useState } from "react";

type BotaoCorrigirProps = {
  redacaoId: string;
};

export function BotaoCorrigir({
  redacaoId,
}: BotaoCorrigirProps) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function corrigir() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/correcoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redacaoId,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível corrigir.",
        );
      }

      window.location.reload();
    } catch (erroAtual) {
      setErro(
        erroAtual instanceof Error
          ? erroAtual.message
          : "Erro desconhecido.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={corrigir}
        disabled={carregando}
        className="rounded-md bg-purple-600 px-5 py-2 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {carregando
          ? "Corrigindo redação..."
          : "Corrigir com IA"}
      </button>

      {erro && (
        <p className="mt-3 rounded-md bg-red-950 px-4 py-3 text-red-200">
          {erro}
        </p>
      )}
    </div>
  );
}