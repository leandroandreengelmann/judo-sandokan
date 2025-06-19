"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";
import { BeltDisplay } from "@/components/BeltIcon";

export default function AlunoPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (loading) {
      return;
    }

    // Se não há usuário, redirecionar para login
    if (!user) {
      router.push("/login");
      return;
    }

    // Se não é aluno ou não aprovado, redirecionar
    if (user.nivel_usuario !== "aluno" || !user.aprovado) {
      if (user.nivel_usuario === "mestre") {
        router.push("/mestre");
      } else if (!user.aprovado) {
        router.push("/aguardando-aprovacao");
      } else {
        router.push("/login");
      }
      return;
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
                🥋 Portal do Aluno
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
                Bem-vindo ao{" "}
                <span className="text-yellow-600">Judô Sandokan</span>! 🥋
              </h2>
              <p className="text-primary-700">
                Olá, {user.nome_completo || user.email}! Sua conta foi aprovada.
                Bons treinos!
              </p>
              {user.cor_faixa && (
                <div className="mt-2">
                  <BeltDisplay
                    color={user.cor_faixa}
                    size={64}
                    className="text-primary-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meu Perfil */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200 mb-8">
          <h3 className="text-2xl font-bold text-primary-950 mb-6">
            Meu Perfil
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Nome Completo
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
            {user.escola && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Escola/Academia
                </label>
                <p className="text-primary-950 font-semibold">{user.escola}</p>
              </div>
            )}
            {user.contato && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Contato
                </label>
                <p className="text-primary-950 font-semibold">{user.contato}</p>
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
          <h3 className="text-2xl font-bold text-primary-950 mb-6">
            Ações Rápidas
          </h3>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/aluno/editar-perfil")}
              className="bg-primary-800 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Icon
                icon="iron:person"
                width={24}
                height={24}
                className="mr-2"
              />
              Editar Perfil
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
