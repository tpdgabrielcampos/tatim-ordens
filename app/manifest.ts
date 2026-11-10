import type { MetadataRoute } from "next";

// Faz o formulário de OS virar "app": dá para instalar no celular, tablet e computador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OS TATIM — Gabriel Campos",
    short_name: "OS TATIM",
    description: "Envio de ordens de serviço para o laboratório Gabriel Campos.",
    start_url: "/novo-pedido",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#000000",
    theme_color: "#1F3864",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
