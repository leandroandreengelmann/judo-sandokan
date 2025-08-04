"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile, supabase } from "@/lib/supabase";
import { BeltDisplay } from "@/components/BeltIcon";

interface DashboardStats {
  totalAlunos: number;
  alunosAprovados: number;
  alunosPendentes: number;
  alunosAtivos: number;
  faixasBrancas: number;
  faixasColoridas: number;
  faixasPretas: number;
  cadastrosHoje: number;
}

export default function MestrePage() {
  const { user, loading, signOut, getPendingUsers, approveUser, isMestre } =
    useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    alunosAprovados: 0,
    alunosPendentes: 0,
    alunosAtivos: 0,
    faixasBrancas: 0,
    faixasColoridas: 0,
    faixasPretas: 0,
    cadastrosHoje: 0,
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [approvingUser, setApprovingUser] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redireciona se não for mestre
    if (!loading && (!user || !isMestre())) {
      router.push("/login");
    }
  }, [user, loading, isMestre, router]);

  const loadDashboardData = useCallback(async () => {
    setLoadingUsers(true);

    // Carregar usuários pendentes
    const pendingResult = await getPendingUsers();
    if (pendingResult.data) {
      setPendingUsers(pendingResult.data);
    }

    // Carregar estatísticas do banco
    await loadStats();
    await loadApprovedUsers();

    setLoadingUsers(false);
  }, [getPendingUsers]);

  useEffect(() => {
    if (user && isMestre()) {
      loadDashboardData();
    }
  }, [user, isMestre, loadDashboardData]);

  const loadStats = async () => {
    try {
      console.log("🔄 Iniciando carregamento de estatísticas...");

      // Verificar sessão atual
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("🔑 Sessão atual:", session?.user?.id, session?.user?.email);

      // Total de usuários
      const { count: totalAlunos, error: errorTotal } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("nivel_usuario", "aluno");

      console.log(
        "📊 Total de alunos:",
        totalAlunos,
        errorTotal ? "ERRO:" + errorTotal.message : ""
      );

      // Alunos aprovados
      const { count: alunosAprovados, error: errorAprovados } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("nivel_usuario", "aluno")
        .eq("aprovado", true);

      console.log(
        "✅ Alunos aprovados:",
        alunosAprovados,
        errorAprovados ? "ERRO:" + errorAprovados.message : ""
      );

      // Alunos pendentes
      const { count: alunosPendentes, error: errorPendentes } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("nivel_usuario", "aluno")
        .eq("aprovado", false);

      console.log(
        "⏰ Alunos pendentes:",
        alunosPendentes,
        errorPendentes ? "ERRO:" + errorPendentes.message : ""
      );

      // Faixas brancas
      const { count: faixasBrancas, error: errorBrancas } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("nivel_usuario", "aluno")
        .eq("aprovado", true)
        .eq("cor_faixa", "Branca");

      console.log(
        "⚪ Faixas brancas:",
        faixasBrancas,
        errorBrancas ? "ERRO:" + errorBrancas.message : ""
      );

      // Faixas pretas
      const { count: faixasPretas, error: errorPretas } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("nivel_usuario", "aluno")
        .eq("aprovado", true)
        .eq("cor_faixa", "Preto");

      console.log(
        "⚫ Faixas pretas:",
        faixasPretas,
        errorPretas ? "ERRO:" + errorPretas.message : ""
      );

      // Cadastros hoje
      const hoje = new Date().toISOString().split("T")[0];
      const { count: cadastrosHoje, error: errorHoje } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("nivel_usuario", "aluno")
        .gte("created_at", hoje);

      console.log(
        "📅 Cadastros hoje (" + hoje + "):",
        cadastrosHoje,
        errorHoje ? "ERRO:" + errorHoje.message : ""
      );

      const statsCalculadas = {
        totalAlunos: totalAlunos || 0,
        alunosAprovados: alunosAprovados || 0,
        alunosPendentes: alunosPendentes || 0,
        alunosAtivos: alunosAprovados || 0,
        faixasBrancas: faixasBrancas || 0,
        faixasColoridas:
          (alunosAprovados || 0) - (faixasBrancas || 0) - (faixasPretas || 0),
        faixasPretas: faixasPretas || 0,
        cadastrosHoje: cadastrosHoje || 0,
      };

      console.log("📈 Estatísticas finais:", statsCalculadas);
      setStats(statsCalculadas);
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas:", error);
    }
  };

  const loadApprovedUsers = async () => {
    try {
      console.log("👥 Carregando alunos aprovados...");
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("nivel_usuario", "aluno")
        .eq("aprovado", true)
        .order("created_at", { ascending: false })
        .limit(10);

      console.log("👥 Resultado alunos aprovados:", { data, error });

      if (!error && data) {
        setApprovedUsers(data);
        console.log("✅ Alunos aprovados carregados:", data.length, "alunos");
      } else if (error) {
        console.error("❌ Erro ao carregar alunos aprovados:", error);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar alunos aprovados:", error);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setApprovingUser(userId);
    const result = await approveUser(userId);

    if (!result.error) {
      // Remover usuário da lista de pendentes
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      // Recarregar estatísticas
      await loadStats();
      await loadApprovedUsers();
    }

    setApprovingUser(null);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl text-primary-950 animate-spin">🔄</span>
          <span className="text-primary-950 font-semibold">Carregando...</span>
        </div>
      </div>
    );
  }

  const menuItems: {
    id: string;
    label: string;
    icon: string;
    description: string;
    badge?: number;
    external?: boolean;
    href?: string;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
      description: "Visão geral do dojo",
    },
    {
      id: "aprovacoes",
      label: "Aprovações",
      icon: "⏰",
      description: "Novos cadastros",
      badge: pendingUsers.length,
    },
    {
      id: "alunos",
      label: "Alunos",
      icon: "👥",
      description: "Alunos aprovados",
    },
    {
      id: "gerenciar-alunos",
      label: "Gerenciar Alunos",
      icon: "✏️",
      description: "Editar dados dos alunos",
      external: true,
      href: "/mestre/alunos",
    },
    {
      id: "editar-perfil",
      label: "Editar Perfil",
      icon: "👤",
      description: "Minhas informações",
      external: true,
      href: "/mestre/editar-perfil",
    },
    {
      id: "faixas",
      label: "Faixas",
      icon: "🥋",
      description: "Gerenciar faixas",
      external: true,
      href: "/mestre/faixas",
    },
    {
      id: "mensalidades",
      label: "Mensalidades",
      icon: "💰",
      description: "Controle de pagamentos",
      external: true,
      href: "/mestre/mensalidades",
    },
    {
      id: "relatorios",
      label: "Relatórios",
      icon: "📊",
      description: "Estatísticas detalhadas",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col lg:flex-row">
      {/* Mobile Menu Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary-900 text-white p-3 rounded-xl shadow-lg"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Overlay para fechar menu mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Menu Lateral */}
      <div
        className={`lg:w-80 bg-white shadow-2xl border-r border-primary-200 flex flex-col lg:relative fixed lg:translate-x-0 transform transition-transform duration-300 ease-in-out z-50 w-full lg:w-80 h-full lg:h-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header do Menu */}
        <div className="p-4 lg:p-6 border-b border-primary-200 bg-gradient-to-r from-primary-900 to-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                <span className="text-white text-lg lg:text-xl">⭐</span>
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-white">
                  Painel do Mestre
                </h1>
                <p className="text-primary-200 text-xs lg:text-sm">
                  Judô Sandokan
                </p>
              </div>
            </div>
            {/* Botão X para fechar menu mobile */}
            <button
              className="lg:hidden text-white hover:text-primary-200 p-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 p-3 lg:p-4">
          <div className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.external && item.href) {
                    router.push(item.href);
                  } else {
                    setActiveTab(item.id);
                  }
                  // Fechar menu mobile ao selecionar item
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left p-3 lg:p-4 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-primary-900 text-white shadow-lg"
                    : "text-primary-700 hover:bg-primary-100"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        activeTab === item.id
                          ? "text-primary-200"
                          : "text-primary-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Botão de Atualizar */}
        <div className="p-3 lg:p-4 border-t border-primary-200">
          <button
            onClick={loadDashboardData}
            disabled={loadingUsers}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-xl font-medium transition-colors flex items-center justify-center mb-2 lg:mb-3 text-sm lg:text-base"
          >
            <span className={`mr-2 ${loadingUsers ? "animate-spin" : ""}`}>
              🔄
            </span>
            Atualizar Dados
          </button>

          {/* Botão de Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-xl font-medium transition-colors flex items-center justify-center text-sm lg:text-base"
          >
            <span className="mr-2">🚪</span>
            Sair do Sistema
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header Mobile */}
        <div className="lg:hidden bg-white shadow-lg border-b border-primary-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-primary-900">
                Painel do Mestre
              </h1>
              <p className="text-sm text-primary-600 mt-1">Judô Sandokan</p>
            </div>
            <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">M</span>
            </div>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <main className="flex-1 p-3 lg:p-6 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-500 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <p className="text-xs lg:text-sm text-primary-600">
                        Total de Alunos
                      </p>
                      <p className="text-xl lg:text-3xl font-bold text-primary-950">
                        {stats.totalAlunos}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-green-500 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <p className="text-xs lg:text-sm text-primary-600">
                        Alunos Aprovados
                      </p>
                      <p className="text-xl lg:text-3xl font-bold text-primary-950">
                        {stats.alunosAprovados}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-500 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                      <span className="text-2xl">⏰</span>
                    </div>
                    <div>
                      <p className="text-xs lg:text-sm text-primary-600">
                        Aguardando Aprovação
                      </p>
                      <p className="text-xl lg:text-3xl font-bold text-primary-950">
                        {stats.alunosPendentes}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-500 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div>
                      <p className="text-xs lg:text-sm text-primary-600">
                        Cadastros Hoje
                      </p>
                      <p className="text-xl lg:text-3xl font-bold text-primary-950">
                        {stats.cadastrosHoje}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribuição de Faixas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-bold text-primary-950">
                      Faixas Brancas
                    </h3>
                    <BeltDisplay color="Branca" showText={false} size={36} />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-primary-950">
                    {stats.faixasBrancas}
                  </p>
                  <p className="text-xs lg:text-sm text-primary-600">
                    alunos iniciantes
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-bold text-primary-950">
                      Faixas Coloridas
                    </h3>
                    <BeltDisplay color="Verde" showText={false} size={36} />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-primary-950">
                    {stats.faixasColoridas}
                  </p>
                  <p className="text-xs lg:text-sm text-primary-600">
                    alunos intermediários
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-bold text-primary-950">
                      Faixas Pretas
                    </h3>
                    <BeltDisplay color="Preto" showText={false} size={36} />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-primary-950">
                    {stats.faixasPretas}
                  </p>
                  <p className="text-xs lg:text-sm text-primary-600">
                    alunos avançados
                  </p>
                </div>
              </div>

              {/* Últimos Alunos Aprovados */}
              <div className="bg-white rounded-xl shadow-lg border border-primary-200">
                <div className="p-4 lg:p-6 border-b border-primary-200">
                  <h3 className="text-lg lg:text-xl font-bold text-primary-950">
                    Últimos Alunos Aprovados
                  </h3>
                </div>
                <div className="p-4 lg:p-6">
                  {approvedUsers.length === 0 ? (
                    <p className="text-center text-primary-600 py-8">
                      Nenhum aluno aprovado ainda
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                      {approvedUsers.slice(0, 6).map((aluno) => (
                        <div
                          key={aluno.id}
                          className="bg-primary-50 rounded-lg p-3 lg:p-4 border border-primary-200"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-900 rounded-full flex items-center justify-center mr-2 lg:mr-3">
                              <span className="text-white text-sm lg:text-base">
                                👤
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-primary-950 text-sm lg:text-base truncate">
                                {aluno.nome_completo || "Nome não informado"}
                              </h4>
                              <div className="flex items-center gap-1 lg:gap-2">
                                {aluno.cor_faixa && (
                                  <BeltDisplay
                                    color={aluno.cor_faixa}
                                    showText={false}
                                    size={24}
                                  />
                                )}
                                <span className="text-xs lg:text-sm text-primary-600 truncate">
                                  {aluno.cor_faixa || "Faixa não informada"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "aprovacoes" && (
            <div className="bg-white rounded-xl shadow-lg border border-primary-200">
              <div className="p-4 lg:p-6 border-b border-primary-200">
                <h3 className="text-lg lg:text-xl font-bold text-primary-950">
                  Novos Cadastros - Aguardando Aprovação
                </h3>
              </div>
              <div className="p-4 lg:p-6">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-2xl text-primary-950 animate-spin mr-2">
                      🔄
                    </span>
                    <span className="text-primary-700">
                      Carregando usuários...
                    </span>
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl text-green-500 mb-4">✅</div>
                    <h4 className="text-xl font-semibold text-primary-950 mb-2">
                      Nenhum usuário pendente
                    </h4>
                    <p className="text-primary-600">
                      Todos os cadastros foram aprovados!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-primary-50 rounded-lg p-4 lg:p-6 border border-primary-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-primary-700 mr-2 text-lg">
                                👤
                              </span>
                              <h4 className="text-base lg:text-lg font-semibold text-primary-950">
                                {user.nome_completo || "Nome não informado"}
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm text-primary-700">
                              <div>
                                <strong>Email:</strong> {user.email}
                              </div>
                              <div>
                                <strong>Cadastro:</strong>{" "}
                                {new Date(user.created_at).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </div>
                              {user.cor_faixa && (
                                <div className="flex items-center gap-2">
                                  <strong>Faixa:</strong>
                                  <BeltDisplay
                                    color={user.cor_faixa}
                                    showText={false}
                                    size={24}
                                  />
                                  <span>{user.cor_faixa}</span>
                                </div>
                              )}
                              {user.escola && (
                                <div>
                                  <strong>Escola:</strong> {user.escola}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 lg:mt-0 lg:ml-6">
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              disabled={approvingUser === user.id}
                              className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white px-4 lg:px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              {approvingUser === user.id ? (
                                <>
                                  <span className="mr-2 animate-spin">🔄</span>
                                  Aprovando...
                                </>
                              ) : (
                                <>
                                  <span className="mr-2">✅</span>
                                  Aprovar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "alunos" && (
            <div className="bg-white rounded-xl shadow-lg border border-primary-200">
              <div className="p-6 border-b border-primary-200">
                <h3 className="text-xl font-bold text-primary-950">
                  Alunos Aprovados
                </h3>
              </div>
              <div className="p-6">
                {approvedUsers.length === 0 ? (
                  <p className="text-center text-primary-600 py-8">
                    Nenhum aluno aprovado ainda
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {approvedUsers.map((aluno) => (
                      <div
                        key={aluno.id}
                        className="bg-primary-50 rounded-lg p-4 border border-primary-200"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-primary-900 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xl">👤</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-primary-950">
                              {aluno.nome_completo || "Nome não informado"}
                            </h4>
                            <p className="text-sm text-primary-600">
                              {aluno.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {aluno.cor_faixa && (
                                <>
                                  <BeltDisplay
                                    color={aluno.cor_faixa}
                                    showText={false}
                                    size={32}
                                  />
                                  <span className="text-sm text-primary-600">
                                    {aluno.cor_faixa}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "relatorios" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
                <h3 className="text-xl font-bold text-primary-950 mb-6">
                  Relatórios e Estatísticas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h4 className="font-semibold text-primary-950 mb-3">
                      Resumo Geral
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de Alunos:</span>
                        <span className="font-semibold">
                          {stats.totalAlunos}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aprovados:</span>
                        <span className="font-semibold text-green-600">
                          {stats.alunosAprovados}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pendentes:</span>
                        <span className="font-semibold text-yellow-600">
                          {stats.alunosPendentes}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Aprovação:</span>
                        <span className="font-semibold">
                          {stats.totalAlunos > 0
                            ? `${Math.round(
                                (stats.alunosAprovados / stats.totalAlunos) *
                                  100
                              )}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-50 rounded-lg p-4">
                    <h4 className="font-semibold text-primary-950 mb-3">
                      Distribuição de Faixas
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <BeltDisplay
                            color="Branca"
                            showText={false}
                            size={24}
                          />
                          <span>Brancas:</span>
                        </div>
                        <span className="font-semibold">
                          {stats.faixasBrancas}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <BeltDisplay
                            color="Verde"
                            showText={false}
                            size={24}
                          />
                          <span>Coloridas:</span>
                        </div>
                        <span className="font-semibold">
                          {stats.faixasColoridas}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <BeltDisplay
                            color="Preto"
                            showText={false}
                            size={24}
                          />
                          <span>Pretas:</span>
                        </div>
                        <span className="font-semibold">
                          {stats.faixasPretas}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-2xl font-bold">👥</span>
                    </div>
                    <h3 className="text-xl font-semibold text-primary-950">
                      Gerenciar Alunos
                    </h3>
                  </div>
                  <p className="text-primary-700 mb-4">
                    Visualize e gerencie todos os alunos cadastrados
                  </p>
                  <button
                    onClick={() => router.push("/mestre/alunos")}
                    className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Acessar
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-2xl font-bold">🥋</span>
                    </div>
                    <h3 className="text-xl font-semibold text-primary-950">
                      Graduações
                    </h3>
                  </div>
                  <p className="text-primary-700 mb-4">
                    Gerencie graduações e progressão de faixas
                  </p>
                  <button
                    onClick={() => router.push("/mestre/faixas")}
                    className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Acessar
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-2xl font-bold">💰</span>
                    </div>
                    <h3 className="text-xl font-semibold text-primary-950">
                      Mensalidades
                    </h3>
                  </div>
                  <p className="text-primary-700 mb-4">
                    Controle pagamentos e mensalidades dos alunos
                  </p>
                  <button
                    onClick={() => router.push("/mestre/mensalidades")}
                    className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Acessar
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-2xl font-bold">📊</span>
                    </div>
                    <h3 className="text-xl font-semibold text-primary-950">
                      Relatórios Financeiros
                    </h3>
                  </div>
                  <p className="text-primary-700 mb-4">
                    Acompanhe faturamento e métricas financeiras
                  </p>
                  <button
                    onClick={() => router.push("/mestre/relatorios")}
                    className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Acessar
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
