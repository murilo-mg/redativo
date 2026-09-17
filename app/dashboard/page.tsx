import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { sair } from "./actions";

type DashboardPageProps = {
  searchParams: Promise<{
    mensagem?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const { data: redacoes } = await supabase
    .from("redacoes")
    .select("id, titulo, tema, status, created_at")
    .order("created_at", { ascending: false });

  const listaRedacoes = redacoes ?? [];

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Painel do Redativo
          </h1>

          <p className="mt-2 text-muted-foreground">
            Suas atividades de redação.
          </p>
        </div>

        <form action={sair}>
          <Button type="submit" variant="outline">
            Sair
          </Button>
        </form>
      </div>

      {params.mensagem && (
        <p className="mt-6 rounded-md bg-green-100 p-3 text-sm text-green-700">
          {params.mensagem}
        </p>
      )}

      <Link
        href="/redacoes/nova"
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Escrever nova redação
      </Link>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">
          Minhas redações
        </h2>

        {listaRedacoes.length === 0 ? (
          <p className="mt-4 text-muted-foreground">
            Você ainda não possui redações salvas.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {listaRedacoes.map((redacao) => (

              <article
                key={redacao.id}
                className="rounded-lg border p-5"
              >
                <h3 className="text-lg font-semibold">
                  {redacao.titulo}
                </h3>

                <Link
                  href={`/redacoes/${redacao.id}`}
                  className="mt-4 inline-block rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                >
                    Continuar redação
                </Link>

                <p className="mt-2 text-sm text-muted-foreground">
                  Tema: {redacao.tema}
                </p>

                <p className="mt-2 text-sm">
                  Status: {redacao.status}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Criada em:{" "}
                  {new Date(
                    redacao.created_at,
                  ).toLocaleDateString("pt-BR")}
                </p>
                <Link
                  href={`/redacoes/${redacao.id}`}
                  className="mt-4 inline-block rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Continuar redação
                </Link>              
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}