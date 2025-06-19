"use client";

import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Função para verificar se deve mostrar o header global
const shouldShowHeader = (pathname: string) => {
  const routesWithoutHeader = [
    "/mestre",
    "/aluno",
    "/dashboard",
    "/login",
    "/recuperar-senha",
    "/aguardando-aprovacao",
  ];
  return !routesWithoutHeader.some((route) => pathname.startsWith(route));
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    setShowHeader(shouldShowHeader(pathname));
  }, [pathname]);

  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Judô Sandokan - Sistema de Gerenciamento de Dojo</title>
        <meta
          name="description"
          content="Sistema completo para gestão de dojo de judô - Controle de alunos, mestres e atividades. Tradição, disciplina e excelência."
        />
      </head>
      <body
        className="bg-primary-50 text-primary-950 antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
