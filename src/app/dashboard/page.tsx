"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user) {
      // Redirecionar baseado no tipo de usuário
      if (user.nivel_usuario === "mestre" && user.aprovado) {
        router.push("/mestre");
      } else if (user.nivel_usuario === "aluno" && user.aprovado) {
        router.push("/aluno");
      } else if (user.nivel_usuario === "aluno" && !user.aprovado) {
        // Aluno não aprovado - mostrar mensagem de aguardo
        router.push("/aguardando-aprovacao");
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
                Dashboard Judô
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-primary-700">
                Olá, {user.nome_completo || user.email}!
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Boas-vindas */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200 mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary-950 rounded-full flex items-center justify-center mr-6">
              <Icon
                icon="iron:person"
                width={32}
                height={32}
                className="text-white"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary-950 mb-2">
                Bem-vindo, {user.nome_completo || user.email}! 🥋
              </h2>
              <p className="text-primary-700">Email: {user.email}</p>
              <p className="text-primary-600 text-sm mt-1">
                Você está logado no sistema de judô
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <Icon
                  icon="iron:trophy"
                  width={24}
                  height={24}
                  className="text-white"
                />
              </div>
              <div>
                <p className="text-sm text-primary-600">Treinos</p>
                <p className="text-2xl font-bold text-primary-950">15</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <Icon
                  icon="iron:star"
                  width={24}
                  height={24}
                  className="text-white"
                />
              </div>
              <div>
                <p className="text-sm text-primary-600">Graduação</p>
                <p className="text-2xl font-bold text-primary-950">
                  Faixa Branca
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                <Icon
                  icon="iron:calendar"
                  width={24}
                  height={24}
                  className="text-white"
                />
              </div>
              <div>
                <p className="text-sm text-primary-600">Próximo Treino</p>
                <p className="text-lg font-bold text-primary-950">Hoje 19h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                <Icon
                  icon="iron:people"
                  width={24}
                  height={24}
                  className="text-white"
                />
              </div>
              <div>
                <p className="text-sm text-primary-600">Companheiros</p>
                <p className="text-2xl font-bold text-primary-950">23</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
          <h3 className="text-2xl font-bold text-primary-950 mb-6">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-primary-950 hover:bg-primary-900 text-white p-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
              <Icon
                icon="iron:calendar"
                width={24}
                height={24}
                className="mr-2"
              />
              Agendar Treino
            </button>
            <button className="bg-primary-800 hover:bg-primary-700 text-white p-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
              <Icon
                icon="iron:person"
                width={24}
                height={24}
                className="mr-2"
              />
              Perfil
            </button>
            <button className="bg-primary-600 hover:bg-primary-500 text-white p-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
              <Icon icon="iron:chart" width={24} height={24} className="mr-2" />
              Relatórios
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
