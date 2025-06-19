"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";

export default function AguardandoAprovacaoPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver logado, redireciona para login
    if (!loading && !user) {
      router.push("/login");
    }
    // Se for mestre ou aluno aprovado, redireciona adequadamente
    else if (
      !loading &&
      user &&
      (user.nivel_usuario === "mestre" || user.aprovado)
    ) {
      if (user.nivel_usuario === "mestre") {
        router.push("/mestre");
      } else {
        router.push("/aluno");
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icon
            icon="iron:refresh"
            width={32}
            height={32}
            className="text-primary-950 animate-spin"
          />
          <span className="text-primary-950 font-semibold">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-950">
                🥋 Judô <span className="text-yellow-600">Sandokan</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-primary-700">
                {user.nome_completo || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-primary-950 hover:bg-primary-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Icon
                  icon="iron:logout"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Ícone Principal */}
          <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <Icon
              icon="iron:clock"
              width={48}
              height={48}
              className="text-white"
            />
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-primary-950 mb-4">
            Aguardando Aprovação
          </h1>

          {/* Mensagem Principal */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200 mb-8">
            <div className="text-center">
              <Icon
                icon="iron:info-circle"
                width={64}
                height={64}
                className="text-yellow-500 mx-auto mb-6"
              />
              <h2 className="text-2xl font-bold text-primary-950 mb-4">
                Sua conta foi criada com sucesso! 🎉
              </h2>
              <p className="text-lg text-primary-700 mb-6">
                Agora você precisa aguardar a aprovação do mestre para ter
                acesso completo ao sistema. Você receberá uma notificação por
                email quando sua conta for aprovada.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center text-yellow-700">
                  <Icon
                    icon="iron:warning"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  <span className="font-semibold">
                    Status: Aguardando aprovação do mestre
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Usuário */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200 mb-8">
            <h3 className="text-xl font-bold text-primary-950 mb-4">
              Suas Informações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Nome
                </label>
                <p className="text-primary-950 font-semibold">
                  {user.nome_completo || "Não informado"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Email
                </label>
                <p className="text-primary-950 font-semibold">{user.email}</p>
              </div>
              {user.cor_faixa && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Graduação
                  </label>
                  <p className="text-primary-950 font-semibold">
                    {user.cor_faixa}
                  </p>
                </div>
              )}
              {user.escola && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Escola/Academia
                  </label>
                  <p className="text-primary-950 font-semibold">
                    {user.escola}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* O que acontece agora */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
            <h3 className="text-xl font-bold text-primary-950 mb-6">
              O que acontece agora?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="iron:eye"
                    width={24}
                    height={24}
                    className="text-white"
                  />
                </div>
                <h4 className="font-semibold text-primary-950 mb-2">
                  1. Análise
                </h4>
                <p className="text-sm text-primary-600">
                  O mestre irá analisar suas informações e verificar sua
                  elegibilidade
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="iron:check"
                    width={24}
                    height={24}
                    className="text-white"
                  />
                </div>
                <h4 className="font-semibold text-primary-950 mb-2">
                  2. Aprovação
                </h4>
                <p className="text-sm text-primary-600">
                  Se aprovado, você receberá um email de confirmação
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="iron:star"
                    width={24}
                    height={24}
                    className="text-white"
                  />
                </div>
                <h4 className="font-semibold text-primary-950 mb-2">
                  3. Acesso
                </h4>
                <p className="text-sm text-primary-600">
                  Faça login novamente para ter acesso completo ao sistema
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
