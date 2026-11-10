import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TATIM Laboratório — Ordens de Serviço",
  description: "Envio e controle de ordens de serviço do laboratório TATIM",
  applicationName: "OS TATIM",
  appleWebApp: { capable: true, title: "OS TATIM", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1F3864",
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
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
