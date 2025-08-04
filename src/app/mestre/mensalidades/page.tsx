"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { BeltIcon } from "@/components/BeltIcon";

interface Mensalidade {
  id: string;
  aluno_id: string;
  mes_referencia: number;
  ano_referencia: number;
  valor_mensalidade: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  forma_pagamento: string | null;
  observacoes: string | null;
  aluno: {
    nome_completo: string;
    email: string;
    cor_faixa: string;
    contato: string;
  };
}

interface AlunoParticular {
  id: string;
  nome_completo: string;
  email: string;
  cor_faixa: string;
  valor_mensalidade: number;
}

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function MensalidadesPage() {
  const { user, loading, isMestre } = useAuth();
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [alunosParticulares, setAlunosParticulares] = useState<
    AlunoParticular[]
  >([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [mesFilter, setMesFilter] = useState("");
  const [anoFilter, setAnoFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [mensalidadeSelecionada, setMensalidadeSelecionada] =
    useState<Mensalidade | null>(null);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModalValorGlobal, setShowModalValorGlobal] = useState(false);
  const [valorGlobal, setValorGlobal] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isMestre())) {
      router.push("/login");
    }
  }, [user, loading, isMestre, router]);

  useEffect(() => {
    if (user && isMestre()) {
      loadData();
    }
  }, [user, isMestre]);

  const loadData = async () => {
    setLoadingData(true);
    await Promise.all([loadMensalidades(), loadAlunosParticulares()]);
    setLoadingData(false);
  };

  const loadMensalidades = async () => {
    try {
      const { data, error } = await supabase
        .from("mensalidades")
        .select(
          `
          *,
          aluno:user_profiles(nome_completo, email, cor_faixa, contato)
        `
        )
        .order("ano_referencia", { ascending: false })
        .order("mes_referencia", { ascending: false })
        .order("data_vencimento", { ascending: false });

      if (!error && data) {
        setMensalidades(data);
      } else {
        console.error("Erro ao carregar mensalidades:", error);
      }
    } catch (error) {
      console.error("Erro ao carregar mensalidades:", error);
    }
  };

  const loadAlunosParticulares = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, nome_completo, email, cor_faixa, valor_mensalidade")
        .eq("nivel_usuario", "aluno")
        .eq("aprovado", true)
        .eq("aluno_particular", true)
        .order("nome_completo");

      if (!error && data) {
        setAlunosParticulares(data);
      } else {
        console.error("Erro ao carregar alunos particulares:", error);
      }
    } catch (error) {
      console.error("Erro ao carregar alunos particulares:", error);
    }
  };

  const gerarMensalidadesMes = async () => {
    try {
      // Validar se há alunos particulares
      if (alunosParticulares.length === 0) {
        alert("Nenhum aluno particular encontrado! Certifique-se de que há alunos cadastrados como particulares.");
        return;
      }

      const mesAtual = new Date().getMonth() + 1;
      const anoAtual = new Date().getFullYear();

      // Verificar se já existem mensalidades para este mês
      const { data: existentes, error: errorCheck } = await supabase
        .from("mensalidades")
        .select("aluno_id")
        .eq("mes_referencia", mesAtual)
        .eq("ano_referencia", anoAtual);

      if (errorCheck) {
        console.error("Erro ao verificar mensalidades existentes:", errorCheck?.message || errorCheck);
        alert("Erro ao verificar mensalidades existentes. Tente novamente.");
        return;
      }

      const alunosComMensalidade = existentes?.map((m) => m.aluno_id) || [];
      const alunosSemMensalidade = alunosParticulares.filter(
        (aluno) => !alunosComMensalidade.includes(aluno.id)
      );

      if (alunosSemMensalidade.length === 0) {
        alert("Todas as mensalidades do mês atual já foram geradas!");
        return;
      }

      const mensalidadesParaInserir = alunosSemMensalidade.map((aluno) => ({
        aluno_id: aluno.id,
        mes_referencia: mesAtual,
        ano_referencia: anoAtual,
        valor_mensalidade: aluno.valor_mensalidade,
        data_vencimento: new Date(anoAtual, mesAtual - 1, 5)
          .toISOString()
          .split("T")[0], // Vencimento dia 5 (mesAtual-1 porque Date usa mês 0-11)
        status: "pendente",
      }));

      const { error } = await supabase
        .from("mensalidades")
        .insert(mensalidadesParaInserir);

      if (!error) {
        alert(
          `${mensalidadesParaInserir.length} mensalidades geradas com sucesso!`
        );
        loadMensalidades();
      } else {
        console.error("Erro ao gerar mensalidades:", error?.message || error);
        alert(`Erro ao gerar mensalidades: ${error?.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao gerar mensalidades:", error?.message || error);
      alert(`Erro inesperado ao gerar mensalidades: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const marcarComoPago = (mensalidade: Mensalidade) => {
    setMensalidadeSelecionada(mensalidade);
    setDataPagamento(new Date().toISOString().split("T")[0]);
    setFormaPagamento("");
    setShowModalPagamento(true);
  };

  const confirmarPagamento = async () => {
    if (!mensalidadeSelecionada || !formaPagamento || !dataPagamento) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("mensalidades")
        .update({
          status: "pago",
          data_pagamento: dataPagamento,
          forma_pagamento: formaPagamento,
        })
        .eq("id", mensalidadeSelecionada.id);

      if (!error) {
        setShowModalPagamento(false);
        loadMensalidades();
        alert("Pagamento registrado com sucesso!");
      } else {
        console.error("Erro ao registrar pagamento:", error);
      }
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
    }
    setSaving(false);
  };

  const cancelarMensalidade = async (mensalidade: Mensalidade) => {
    if (
      !confirm(
        `Tem certeza que deseja cancelar a mensalidade de ${mensalidade.aluno.nome_completo}?`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("mensalidades")
        .update({ status: "cancelado" })
        .eq("id", mensalidade.id);

      if (!error) {
        loadMensalidades();
        alert("Mensalidade cancelada com sucesso!");
      } else {
        console.error("Erro ao cancelar mensalidade:", error);
      }
    } catch (error) {
      console.error("Erro ao cancelar mensalidade:", error);
    }
  };

  const abrirModalValorGlobal = () => {
    // Pegar o valor mais comum como sugestão
    const valoresComuns = alunosParticulares.map((a) => a.valor_mensalidade);
    const valorMaisComum = valoresComuns.length > 0 ? valoresComuns[0] : 150;
    setValorGlobal(valorMaisComum.toString());
    setShowModalValorGlobal(true);
  };

  const confirmarValorGlobal = async () => {
    if (!valorGlobal) {
      alert("Preencha o valor da mensalidade");
      return;
    }

    const valorNumerico = parseFloat(valorGlobal);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Digite um valor válido");
      return;
    }

    if (
      !confirm(
        `Tem certeza que deseja alterar o valor da mensalidade para R$ ${valorNumerico.toFixed(
          2
        )} para TODOS os alunos particulares? Isso afetará:\n\n• Valor padrão de ${
          alunosParticulares.length
        } alunos particulares\n• Mensalidades pendentes existentes\n• Futuras mensalidades que forem geradas`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      // 1. Atualizar valor padrão de todos os alunos particulares
      const { error: errorAlunos } = await supabase
        .from("user_profiles")
        .update({ valor_mensalidade: valorNumerico })
        .eq("aluno_particular", true)
        .eq("aprovado", true);

      if (errorAlunos) {
        console.error("Erro ao atualizar alunos:", errorAlunos);
        alert("Erro ao atualizar valor dos alunos");
        setSaving(false);
        return;
      }

      // 2. Atualizar mensalidades pendentes existentes
      const { error: errorMensalidades } = await supabase
        .from("mensalidades")
        .update({ valor_mensalidade: valorNumerico })
        .eq("status", "pendente");

      if (errorMensalidades) {
        console.error("Erro ao atualizar mensalidades:", errorMensalidades);
        alert(
          "Alunos atualizados, mas erro ao atualizar mensalidades pendentes"
        );
      } else {
        alert(
          `Valor global atualizado com sucesso!\n\n✅ ${
            alunosParticulares.length
          } alunos particulares\n✅ Mensalidades pendentes\n✅ Futuras mensalidades\n\nNovo valor: R$ ${valorNumerico.toFixed(
            2
          )}`
        );
      }

      setShowModalValorGlobal(false);
      // Recarregar dados para mostrar as mudanças
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar valor global:", error);
      alert("Erro ao atualizar valor global");
    }
    setSaving(false);
  };

  const filteredMensalidades = mensalidades.filter((mensalidade) => {
    const matchesSearch =
      mensalidade.aluno.nome_completo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      mensalidade.aluno.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" || mensalidade.status === statusFilter;
    const matchesMes =
      mesFilter === "" || mensalidade.mes_referencia.toString() === mesFilter;
    const matchesAno =
      anoFilter === "" || mensalidade.ano_referencia.toString() === anoFilter;

    return matchesSearch && matchesStatus && matchesMes && matchesAno;
  });

  const stats = {
    total: mensalidades.length,
    pendentes: mensalidades.filter((m) => m.status === "pendente").length,
    pagas: mensalidades.filter((m) => m.status === "pago").length,
    atrasadas: mensalidades.filter((m) => m.status === "atrasado").length,
    faturamentoMes: mensalidades
      .filter(
        (m) =>
          m.status === "pago" && m.mes_referencia === new Date().getMonth() + 1
      )
      .reduce((sum, m) => sum + m.valor_mensalidade, 0),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-3 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-primary-950 mb-2">
            💰 Controle de Mensalidades
          </h1>
          <p className="text-primary-700 text-sm lg:text-base">
            Gerencie os pagamentos dos alunos particulares
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <span className="text-white text-xl lg:text-2xl font-bold">
                  📋
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-primary-600">Total</p>
                <p className="text-xl lg:text-3xl font-bold text-primary-950">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <span className="text-white text-xl lg:text-2xl font-bold">
                  ⏰
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-primary-600">Pendentes</p>
                <p className="text-xl lg:text-3xl font-bold text-primary-950">
                  {stats.pendentes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <span className="text-white text-xl lg:text-2xl font-bold">
                  ✅
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-primary-600">Pagas</p>
                <p className="text-xl lg:text-3xl font-bold text-primary-950">
                  {stats.pagas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <span className="text-white text-xl lg:text-2xl font-bold">
                  ❌
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-primary-600">Atrasadas</p>
                <p className="text-xl lg:text-3xl font-bold text-primary-950">
                  {stats.atrasadas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <span className="text-white text-xl lg:text-2xl font-bold">
                  💰
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-primary-600">
                  Faturamento
                </p>
                <p className="text-lg lg:text-2xl font-bold text-primary-950">
                  R$ {stats.faturamentoMes.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-primary-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h3 className="text-lg font-semibold text-primary-950">
              Ações Rápidas
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={abrirModalValorGlobal}
                disabled={loadingData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              >
                <span className="mr-2">💰</span>
                Alterar Valor Global
              </button>
              <button
                onClick={gerarMensalidadesMes}
                disabled={loadingData}
                className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              >
                <span className="mr-2">📅</span>
                Gerar Mensalidades do Mês
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-primary-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-primary-900 mb-2">
                Buscar Aluno
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou email..."
                  className="w-full pl-10 pr-4 py-2 lg:py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-primary-900 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 lg:py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-primary-900 mb-2">
                Mês
              </label>
              <select
                value={mesFilter}
                onChange={(e) => setMesFilter(e.target.value)}
                className="w-full px-4 py-2 lg:py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
              >
                <option value="">Todos</option>
                {meses.map((mes, index) => (
                  <option key={index} value={index + 1}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-primary-900 mb-2">
                Ano
              </label>
              <select
                value={anoFilter}
                onChange={(e) => setAnoFilter(e.target.value)}
                className="w-full px-4 py-2 lg:py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
              >
                <option value="">Todos</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Mensalidades */}
        {loadingData ? (
          <div className="text-center py-12">
            <span className="text-4xl animate-spin">🔄</span>
            <p className="text-primary-700 mt-4">Carregando mensalidades...</p>
          </div>
        ) : (
          <>
            {/* Versão Desktop - Tabela */}
            <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Aluno
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Período
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Valor
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Vencimento
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Pagamento
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-primary-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMensalidades.map((mensalidade) => (
                      <tr key={mensalidade.id} className="hover:bg-primary-25">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <BeltIcon
                              color={mensalidade.aluno.cor_faixa || "Branca"}
                              size={32}
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium text-primary-950">
                                {mensalidade.aluno.nome_completo}
                              </div>
                              <div className="text-sm text-primary-600">
                                {mensalidade.aluno.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-primary-700">
                            {meses[mensalidade.mes_referencia - 1]} /{" "}
                            {mensalidade.ano_referencia}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-primary-950">
                            R$ {mensalidade.valor_mensalidade.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-primary-700">
                            {new Date(
                              mensalidade.data_vencimento
                            ).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              mensalidade.status === "pago"
                                ? "bg-green-100 text-green-800"
                                : mensalidade.status === "pendente"
                                ? "bg-yellow-100 text-yellow-800"
                                : mensalidade.status === "atrasado"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {mensalidade.status === "pago"
                              ? "Pago"
                              : mensalidade.status === "pendente"
                              ? "Pendente"
                              : mensalidade.status === "atrasado"
                              ? "Atrasado"
                              : "Cancelado"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {mensalidade.data_pagamento ? (
                            <div className="text-sm">
                              <div className="text-primary-950">
                                {new Date(
                                  mensalidade.data_pagamento
                                ).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="text-primary-600">
                                {mensalidade.forma_pagamento}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            {mensalidade.status === "pendente" && (
                              <>
                                <button
                                  onClick={() => marcarComoPago(mensalidade)}
                                  className="text-green-600 hover:text-green-800 hover:bg-green-100 p-1 rounded"
                                  title="Marcar como Pago"
                                >
                                  <span className="text-lg">💰</span>
                                </button>
                                <button
                                  onClick={() =>
                                    cancelarMensalidade(mensalidade)
                                  }
                                  className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded"
                                  title="Cancelar"
                                >
                                  <span className="text-lg">❌</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Versão Mobile - Cards */}
            <div className="lg:hidden space-y-3">
              {filteredMensalidades.map((mensalidade) => (
                <div
                  key={mensalidade.id}
                  className="bg-white rounded-xl shadow-lg border border-primary-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1 min-w-0">
                      <BeltIcon
                        color={mensalidade.aluno.cor_faixa || "Branca"}
                        size={32}
                        className="mr-3"
                      />
                      <div className="min-w-0">
                        <h3 className="font-medium text-primary-950 truncate">
                          {mensalidade.aluno.nome_completo}
                        </h3>
                        <p className="text-sm text-primary-600 truncate">
                          {mensalidade.aluno.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${
                        mensalidade.status === "pago"
                          ? "bg-green-100 text-green-800"
                          : mensalidade.status === "pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : mensalidade.status === "atrasado"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {mensalidade.status === "pago"
                        ? "Pago"
                        : mensalidade.status === "pendente"
                        ? "Pendente"
                        : mensalidade.status === "atrasado"
                        ? "Atrasado"
                        : "Cancelado"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-primary-600">Período:</span>
                      <div className="font-medium">
                        {meses[mensalidade.mes_referencia - 1]} /{" "}
                        {mensalidade.ano_referencia}
                      </div>
                    </div>
                    <div>
                      <span className="text-primary-600">Valor:</span>
                      <div className="font-medium">
                        R$ {mensalidade.valor_mensalidade.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-primary-600">Vencimento:</span>
                      <div className="font-medium">
                        {new Date(
                          mensalidade.data_vencimento
                        ).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    {mensalidade.data_pagamento && (
                      <div>
                        <span className="text-primary-600">Pagamento:</span>
                        <div className="font-medium">
                          {new Date(
                            mensalidade.data_pagamento
                          ).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-xs text-primary-500">
                          {mensalidade.forma_pagamento}
                        </div>
                      </div>
                    )}
                  </div>

                  {mensalidade.status === "pendente" && (
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => marcarComoPago(mensalidade)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                      >
                        <span className="mr-1">💰</span>
                        Pagar
                      </button>
                      <button
                        onClick={() => cancelarMensalidade(mensalidade)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                      >
                        <span className="mr-1">❌</span>
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredMensalidades.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 text-center py-12">
                <span className="text-5xl mb-4 block">📋</span>
                <h3 className="text-xl font-semibold text-primary-950 mb-2">
                  Nenhuma mensalidade encontrada
                </h3>
                <p className="text-primary-600">
                  {mensalidades.length === 0
                    ? "Gere as mensalidades do mês para começar"
                    : "Tente ajustar os filtros para ver os resultados"}
                </p>
              </div>
            )}
          </>
        )}

        {/* Modal de Pagamento */}
        {showModalPagamento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary-950 mb-4">
                  Registrar Pagamento
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-primary-600">Aluno:</p>
                    <p className="font-medium">
                      {mensalidadeSelecionada?.aluno.nome_completo}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-primary-600">Período:</p>
                    <p className="font-medium">
                      {mensalidadeSelecionada &&
                        meses[mensalidadeSelecionada.mes_referencia - 1]}{" "}
                      / {mensalidadeSelecionada?.ano_referencia}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-primary-600">Valor:</p>
                    <p className="font-medium">
                      R$ {mensalidadeSelecionada?.valor_mensalidade.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Data do Pagamento
                    </label>
                    <input
                      type="date"
                      value={dataPagamento}
                      onChange={(e) => setDataPagamento(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="transferencia">
                        Transferência Bancária
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModalPagamento(false)}
                    className="px-4 py-2 text-primary-700 hover:text-primary-900 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarPagamento}
                    disabled={saving || !formaPagamento || !dataPagamento}
                    className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="mr-2 animate-spin">🔄</span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💰</span>
                        Confirmar Pagamento
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Valor Global */}
        {showModalValorGlobal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary-950 mb-4">
                  Alterar Valor Global da Mensalidade
                </h3>

                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      ⚠️ Atenção
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Esta ação alterará o valor da mensalidade para:
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                      <li>
                        <strong>
                          {alunosParticulares.length} alunos particulares
                        </strong>{" "}
                        (valor padrão)
                      </li>
                      <li>
                        <strong>Mensalidades pendentes</strong> existentes
                      </li>
                      <li>
                        <strong>Futuras mensalidades</strong> que forem geradas
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Novo Valor Global (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorGlobal}
                      onChange={(e) => setValorGlobal(e.target.value)}
                      placeholder="150,00"
                      className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-medium"
                    />
                    <p className="text-xs text-primary-500 mt-1">
                      Valor sugerido baseado nos alunos atuais
                    </p>
                  </div>

                  {valorGlobal && !isNaN(parseFloat(valorGlobal)) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">
                        💰 Resumo da Alteração
                      </h4>
                      <p className="text-sm text-blue-700">
                        <strong>Novo valor:</strong> R${" "}
                        {parseFloat(valorGlobal).toFixed(2)}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Afetará:</strong> {alunosParticulares.length}{" "}
                        alunos + mensalidades pendentes
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModalValorGlobal(false)}
                    className="px-4 py-2 text-primary-700 hover:text-primary-900 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarValorGlobal}
                    disabled={
                      saving ||
                      !valorGlobal ||
                      isNaN(parseFloat(valorGlobal)) ||
                      parseFloat(valorGlobal) <= 0
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="mr-2 animate-spin">🔄</span>
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💰</span>
                        Aplicar Valor Global
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Link Voltar */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/mestre")}
            className="text-primary-800 hover:text-primary-950 font-medium transition-colors flex items-center"
          >
            <svg
              width={20}
              height={20}
              fill="currentColor"
              className="mr-2"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M7.28 7.72a.75.75 0 010 1.06l-2.47 2.47H21a.75.75 0 010 1.5H4.81l2.47 2.47a.75.75 0 11-1.06 1.06L2.47 12.53a.75.75 0 010-1.06l3.75-3.75a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
            Voltar ao Painel do Mestre
          </button>
        </div>
      </div>
    </div>
  );
}
