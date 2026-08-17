import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Workshops FAST",
  description: "Consulta e administração de workshops e suas participações.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
