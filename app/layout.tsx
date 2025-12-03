import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wikimedic Dashboard",
  description: "Gerenciamento de Medicamentos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* Mantive o slate-50 no body para dar contraste com os Cards Brancos */}
      <body
        className={`${inter.className} bg-slate-50 min-h-screen text-slate-900`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
