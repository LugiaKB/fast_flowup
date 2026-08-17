"use client";

import { LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button, Card, TextField } from "@/components/ui";
import { DEMO_ADMIN_CREDENTIALS } from "@/features/auth/demo-credentials";
import { useAuth } from "@/features/auth/auth-provider";

const GENERIC_LOGIN_ERROR =
  "Não foi possível entrar. Verifique suas credenciais e tente novamente.";

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (status === "authenticated") router.replace("/workshops");
  }, [router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/workshops");
    } catch {
      setError(GENERIC_LOGIN_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-[var(--container-max)] justify-center px-[var(--container-padding)] py-12 sm:py-16"
    >
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Acesso administrativo</h1>
          <p className="mt-3 text-gray-700">
            Entre para criar, editar e arquivar os dados da aplicação.
          </p>
        </div>

        <Card className="mt-8 hover:translate-y-0 hover:shadow-card">
          <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
            <TextField
              label="E-mail"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              leadingIcon={<Mail aria-hidden="true" className="size-5" />}
            />
            <TextField
              label="Senha"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              leadingIcon={<LockKeyhole aria-hidden="true" className="size-5" />}
            />

            {error && (
              <p role="alert" className="rounded-lg border border-error bg-error-subtle p-4 text-sm text-error-strong">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting || status === "loading"}>
              {isSubmitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </Card>

        {process.env.NEXT_PUBLIC_API_MODE === "mock" && (
          <aside className="mt-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">Credenciais da demonstração</p>
            <p className="mt-1 break-all">
              {DEMO_ADMIN_CREDENTIALS.email} / {DEMO_ADMIN_CREDENTIALS.password}
            </p>
          </aside>
        )}
      </div>
    </main>
  );
}
