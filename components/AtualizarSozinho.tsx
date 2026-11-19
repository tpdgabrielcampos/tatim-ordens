"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Atualiza a página sozinha: a cada 20 s (com a tela aberta) e ao voltar para a janela/app.
// Assim as ordens novas aparecem no painel sem precisar recarregar.
export default function AtualizarSozinho({ segundos = 20 }: { segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    const atualizar = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(atualizar, segundos * 1000);
    document.addEventListener("visibilitychange", atualizar);
    window.addEventListener("focus", atualizar);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", atualizar);
      window.removeEventListener("focus", atualizar);
    };
  }, [router, segundos]);
  return null;
}
