import type { Metadata, Viewport } from "next";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TATIM Laboratório — Ordens de Serviço",
  description: "Envio e controle de ordens de serviço do laboratório TATIM",
  applicationName: "OS TATIM",
  appleWebApp: { capable: true, title: "OS TATIM", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Guarda o convite de instalação do navegador (ele pode chegar antes da página carregar). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__gcInstalar=e;window.dispatchEvent(new Event('gc-instalar'));});",
          }}
        />
      </head>
      <body className="gc-app min-h-screen text-zinc-200">
        <div className="gc-ceu" aria-hidden />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
