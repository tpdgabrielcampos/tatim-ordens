"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  }

  return (
    <button
      onClick={sair}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
    >
      Sair
    </button>
  );
}
