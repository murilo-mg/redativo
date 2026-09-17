import Link from "next/link";

import { cadastro } from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CadastroPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function CadastroPage({
  searchParams,
}: CadastroPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Comece seus estudos no Redativo.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {params.erro && (
            <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
              {params.erro}
            </p>
          )}

          <form action={cadastro} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">
                Confirmar senha
              </Label>
              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Criar conta
            </Button>
          </form>

          <p className="mt-4 text-center text-sm">
            Já possui uma conta?{" "}
            <Link href="/login" className="font-medium underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}