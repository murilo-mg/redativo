import Link from "next/link";

import { login } from "./actions";
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

type LoginPageProps = {
  searchParams: Promise<{
    erro?: string;
    mensagem?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar no Redativo</CardTitle>
          <CardDescription>
            Acesse sua área de estudos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {params.erro && (
            <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
              {params.erro}
            </p>
          )}

          {params.mensagem && (
            <p className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-700">
              {params.mensagem}
            </p>
          )}

          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <p className="mt-4 text-center text-sm">
            Ainda não possui conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium underline"
            >
              Criar cadastro
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}