"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });

    setCarregando(false);

    if (!res.ok) {
      setErro("Senha incorreta.");
      return;
    }

    router.push(params.get("redirect") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold text-navy">Painel do laboratório</h1>
        <p className="mt-1 text-sm text-slate-500">Acesso restrito</p>

        <label className="mt-6 flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoFocus
            className="rounded-md border border-slate-300 px-3 py-2 focus:border-navy focus:outline-none"
          />
        </label>

        {erro && <p className="mt-2 text-sm text-rose-600">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="mt-5 w-full rounded-lg bg-navy px-4 py-2.5 font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
