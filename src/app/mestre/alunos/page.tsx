"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { BeltIcon } from "@/components/BeltIcon";

interface Aluno {
  id: string;
  email: string;
  nome_completo: string;
  data_nascimento: string;
  altura: number;
  peso: number;
  escolaridade: string;
  cor_faixa: string;
  escola: string;
  contato: string;
  endereco: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  tipo_sanguineo: string;
  toma_remedio: string;
  alergico_remedio: string;
  nome_responsavel: string;
  endereco_responsavel: string;
  cpf_responsavel: string;
  contato_responsavel: string;
  created_at: string;
  updated_at: string;
  nivel_usuario: string;
  aprovado: boolean;
  data_aprovacao: string;
  aprovado_por: string;
  aluno_particular: boolean;
  aluno_projeto_social: boolean;
  valor_mensalidade: number;
  observacoes: string;
}

interface Faixa {
  nome: string;
  cor: string;
  ordem: number;
}

interface FormData {
  nome_completo: string;
  email: string;
  data_nascimento: string;
  altura: number | string;
  peso: number | string;
  escolaridade: string;
  cor_faixa: string;
  escola: string;
  contato: string;
  endereco: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  tipo_sanguineo: string;
  toma_remedio: string;
  alergico_remedio: string;
  nome_responsavel: string;
  endereco_responsavel: string;
  cpf_responsavel: string;
  contato_responsavel: string;
  aluno_particular: boolean;
  aluno_projeto_social: boolean;
  valor_mensalidade: number | string;
  observacoes: string;
}

export default function AlunosPage() {
  const { user, loading, isMestre } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [faixas, setFaixas] = useState<Faixa[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPromocaoModal, setShowPromocaoModal] = useState(false);
  const [alunoParaPromover, setAlunoParaPromover] = useState<Aluno | null>(
    null
  );
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedAlunos, setSelectedAlunos] = useState<Set<string>>(new Set());
  const [showDeleteBatchModal, setShowDeleteBatchModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome_completo: "",
    email: "",
    data_nascimento: "",
    altura: "",
    peso: "",
    escolaridade: "",
    cor_faixa: "Branca",
    escola: "",
    contato: "",
    endereco: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    tipo_sanguineo: "",
    toma_remedio: "",
    alergico_remedio: "",
    nome_responsavel: "",
    endereco_responsavel: "",
    cpf_responsavel: "",
    contato_responsavel: "",
    aluno_particular: false,
    aluno_projeto_social: false,
    valor_mensalidade: "",
    observacoes: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isMestre())) {
      router.push("/login");
    }
  }, [user, loading, isMestre, router]);

  const loadData = useCallback(async () => {
    setLoadingAlunos(true);
    await Promise.all([loadAlunos(), loadFaixas()]);
    setLoadingAlunos(false);
  }, []);

  useEffect(() => {
    if (user && isMestre()) {
      loadData();
    }
  }, [user, isMestre, loadData]);

  const loadAlunos = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("nivel_usuario", "aluno")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAlunos(data);
      } else {
        console.error("Erro ao carregar alunos:", error);
      }
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    }
  };

  const loadFaixas = async () => {
    try {
      const { data, error } = await supabase
        .from("faixas")
        .select("nome, cor, ordem")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (!error && data) {
        setFaixas(data);
      } else {
        console.error("Erro ao carregar faixas:", error);
      }
    } catch (error) {
      console.error("Erro ao carregar faixas:", error);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openModal = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setFormData({
      nome_completo: aluno.nome_completo || "",
      email: aluno.email || "",
      data_nascimento: aluno.data_nascimento || "",
      altura: aluno.altura || "",
      peso: aluno.peso || "",
      escolaridade: aluno.escolaridade || "",
      cor_faixa: aluno.cor_faixa || "Branca",
      escola: aluno.escola || "",
      contato: aluno.contato || "",
      endereco: aluno.endereco || "",
      instagram: aluno.instagram || "",
      facebook: aluno.facebook || "",
      tiktok: aluno.tiktok || "",
      tipo_sanguineo: aluno.tipo_sanguineo || "",
      toma_remedio: aluno.toma_remedio || "",
      alergico_remedio: aluno.alergico_remedio || "",
      nome_responsavel: aluno.nome_responsavel || "",
      endereco_responsavel: aluno.endereco_responsavel || "",
      cpf_responsavel: aluno.cpf_responsavel || "",
      contato_responsavel: aluno.contato_responsavel || "",
      aluno_particular: aluno.aluno_particular || false,
      aluno_projeto_social: aluno.aluno_projeto_social || false,
      valor_mensalidade: aluno.valor_mensalidade || "",
      observacoes: aluno.observacoes || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAluno(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAluno) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          nome_completo: formData.nome_completo,
          email: formData.email,
          data_nascimento: formData.data_nascimento || null,
          altura: formData.altura ? Number(formData.altura) : null,
          peso: formData.peso ? Number(formData.peso) : null,
          escolaridade: formData.escolaridade,
          cor_faixa: formData.cor_faixa,
          escola: formData.escola,
          contato: formData.contato,
          endereco: formData.endereco,
          instagram: formData.instagram,
          facebook: formData.facebook,
          tiktok: formData.tiktok,
          tipo_sanguineo: formData.tipo_sanguineo,
          toma_remedio: formData.toma_remedio,
          alergico_remedio: formData.alergico_remedio,
          nome_responsavel: formData.nome_responsavel,
          endereco_responsavel: formData.endereco_responsavel,
          cpf_responsavel: formData.cpf_responsavel,
          contato_responsavel: formData.contato_responsavel,
          aluno_particular: formData.aluno_particular,
          aluno_projeto_social: formData.aluno_projeto_social,
          observacoes: formData.observacoes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingAluno.id);

      if (error) {
        console.error("Erro ao atualizar aluno:", error);
        alert("Erro ao atualizar aluno: " + error.message);
      } else {
        await loadAlunos();
        closeModal();
        alert("Aluno atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro inesperado");
    }

    setSaving(false);
  };

  const toggleAprovado = async (aluno: Aluno) => {
    try {
      const updateData: {
        aprovado: boolean;
        updated_at: string;
        data_aprovacao?: string | null;
        aprovado_por?: string | null;
      } = {
        aprovado: !aluno.aprovado,
        updated_at: new Date().toISOString(),
      };

      if (!aluno.aprovado) {
        updateData.data_aprovacao = new Date().toISOString();
        updateData.aprovado_por = user?.id;
      } else {
        updateData.data_aprovacao = null;
        updateData.aprovado_por = null;
      }

      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("id", aluno.id);

      if (error) {
        console.error("Erro ao alterar status:", error);
        alert("Erro ao alterar status: " + error.message);
      } else {
        await loadAlunos();
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro inesperado");
    }
  };

  const abrirModalPromocao = (aluno: Aluno) => {
    setAlunoParaPromover(aluno);
    setShowPromocaoModal(true);
  };

  const confirmarPromocao = async () => {
    if (!alunoParaPromover) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("user_profiles")
        .update({
          nivel_usuario: "mestre",
          updated_at: new Date().toISOString(),
        })
        .eq("id", alunoParaPromover.id);

      if (error) {
        console.error("Erro ao promover aluno:", error);
        alert("Erro ao promover aluno para mestre: " + error.message);
      } else {
        await loadAlunos();
        setShowPromocaoModal(false);
        setAlunoParaPromover(null);
        alert(
          `🎉 ${alunoParaPromover.nome_completo} foi promovido(a) para Mestre com sucesso!\n\n👑 Ele agora terá acesso completo ao sistema administrativo.`
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro inesperado ao promover aluno");
    } finally {
      setSaving(false);
    }
  };

  const cancelarPromocao = () => {
    setShowPromocaoModal(false);
    setAlunoParaPromover(null);
  };

  const deleteAluno = async (aluno: Aluno) => {
    if (
      !confirm(`Deseja realmente excluir o aluno "${aluno.nome_completo}"?`)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", aluno.id);

      if (error) {
        console.error("Erro ao excluir aluno:", error);
        alert("Erro ao excluir aluno: " + error.message);
      } else {
        await loadAlunos();
        alert("Aluno excluído com sucesso!");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro inesperado");
    }
  };

  // Funções para seleção em lote
  const toggleSelectAluno = (alunoId: string) => {
    const newSelected = new Set(selectedAlunos);
    if (newSelected.has(alunoId)) {
      newSelected.delete(alunoId);
    } else {
      newSelected.add(alunoId);
    }
    setSelectedAlunos(newSelected);
  };

  const selectAllAlunos = () => {
    const allIds = new Set(filteredAlunos.map((aluno) => aluno.id));
    setSelectedAlunos(allIds);
  };

  const clearSelection = () => {
    setSelectedAlunos(new Set());
  };

  const deleteBatchAlunos = async () => {
    if (selectedAlunos.size === 0) return;

    const alunosParaExcluir = alunos.filter((aluno) =>
      selectedAlunos.has(aluno.id)
    );
    const nomes = alunosParaExcluir
      .map((aluno) => aluno.nome_completo || aluno.email)
      .join(", ");

    if (
      !confirm(
        `Tem certeza que deseja excluir ${selectedAlunos.size} aluno(s)?\n\n${nomes}`
      )
    ) {
      return;
    }

    try {
      const idsArray = Array.from(selectedAlunos);
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .in("id", idsArray);

      if (error) {
        alert("Erro ao excluir alunos: " + error.message);
        return;
      }

      alert(`${selectedAlunos.size} aluno(s) excluído(s) com sucesso!`);
      setSelectedAlunos(new Set());
      setShowDeleteBatchModal(false);
      await loadAlunos();
    } catch (error) {
      console.error("Erro ao excluir alunos em lote:", error);
      alert("Erro inesperado ao excluir alunos");
    }
  };

  const filteredAlunos = alunos.filter((aluno) => {
    const matchesSearch =
      aluno.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.cor_faixa?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "aprovados" && aluno.aprovado) ||
      (statusFilter === "pendentes" && !aluno.aprovado);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: alunos.length,
    aprovados: alunos.filter((a) => a.aprovado).length,
    pendentes: alunos.filter((a) => !a.aprovado).length,
    hoje: alunos.filter((a) => {
      const hoje = new Date().toISOString().split("T")[0];
      return a.created_at?.split("T")[0] === hoje;
    }).length,
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg
            width={32}
            height={32}
            fill="currentColor"
            className="text-primary-950 animate-spin"
            viewBox="0 0 24 24"
          >
            <path d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
          </svg>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-primary-950 mb-2">
                Gerenciar Alunos
              </h1>
              <p className="text-sm lg:text-base text-primary-700">
                Visualize e edite informações dos alunos do dojo
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <span className="text-white text-xl lg:text-2xl font-bold">
                  👥
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-primary-600">
                  Total de Alunos
                </p>
                <p className="text-xl lg:text-3xl font-bold text-primary-950">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <span className="text-white text-xl lg:text-2xl font-bold">
                  ✅
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-primary-600">Aprovados</p>
                <p className="text-xl lg:text-3xl font-bold text-primary-950">
                  {stats.aprovados}
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
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <span className="text-white text-xl lg:text-2xl font-bold">
                  📅
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-primary-600">
                  Cadastros Hoje
                </p>
                <p className="text-xl lg:text-3xl font-bold text-primary-950">
                  {stats.hoje}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-primary-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                  placeholder="Nome, email ou faixa..."
                  className="w-full pl-10 pr-4 py-2 lg:py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-primary-900 mb-2">
                Filtrar por Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 lg:py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
              >
                <option value="todos">Todos</option>
                <option value="aprovados">Aprovados</option>
                <option value="pendentes">Pendentes</option>
              </select>
            </div>
          </div>

          {/* Controles de Seleção em Lote */}
          {filteredAlunos.length > 0 && (
            <div className="border-t border-primary-200 pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary-700">
                    {selectedAlunos.size} de {filteredAlunos.length} aluno(s)
                    selecionado(s)
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={selectAllAlunos}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    ✅ Selecionar Todos
                  </button>

                  {selectedAlunos.size > 0 && (
                    <>
                      <button
                        onClick={clearSelection}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        ❌ Limpar Seleção
                      </button>

                      <button
                        onClick={() => setShowDeleteBatchModal(true)}
                        className="px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-medium"
                      >
                        🗑️ Excluir Selecionados ({selectedAlunos.size})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Alunos */}
        {loadingAlunos ? (
          <div className="text-center py-12">
            <svg
              width={48}
              height={48}
              fill="currentColor"
              className="text-primary-600 animate-spin mx-auto mb-4"
              viewBox="0 0 24 24"
            >
              <path d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
            </svg>
            <p className="text-primary-700">Carregando alunos...</p>
          </div>
        ) : (
          <>
            {/* Versão Desktop - Tabela */}
            <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-4 text-center text-sm font-medium text-primary-900">
                        <input
                          type="checkbox"
                          checked={
                            selectedAlunos.size === filteredAlunos.length &&
                            filteredAlunos.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              selectAllAlunos();
                            } else {
                              clearSelection();
                            }
                          }}
                          className="w-4 h-4 text-primary-600 bg-white border-2 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Aluno
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Faixa
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Tipo de Aluno
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Contato
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary-900">
                        Cadastro
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-primary-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAlunos.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-primary-25">
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedAlunos.has(aluno.id)}
                            onChange={() => toggleSelectAluno(aluno.id)}
                            className="w-4 h-4 text-primary-600 bg-white border-2 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-primary-950">
                              {aluno.nome_completo || "Nome não informado"}
                            </div>
                            <div className="text-sm text-primary-600">
                              {aluno.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <BeltIcon
                              color={aluno.cor_faixa || "Branca"}
                              size={48}
                              className="mr-3"
                            />
                            <span className="text-sm text-primary-700">
                              {aluno.cor_faixa || "Não definida"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            {aluno.aluno_particular && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center w-fit">
                                <span className="mr-1">💰</span>
                                Particular{" "}
                                {aluno.valor_mensalidade > 0 &&
                                  `(R$ ${aluno.valor_mensalidade.toFixed(2)})`}
                              </span>
                            )}
                            {aluno.aluno_projeto_social && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center w-fit">
                                <span className="mr-1">🤝</span>
                                Projeto Social
                              </span>
                            )}
                            {!aluno.aluno_particular &&
                              !aluno.aluno_projeto_social && (
                                <span className="text-xs text-gray-500">
                                  Não definido
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-primary-700">
                            {aluno.contato || "Não informado"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              aluno.aprovado
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {aluno.aprovado ? "Aprovado" : "Pendente"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-primary-700">
                            {new Date(aluno.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => toggleAprovado(aluno)}
                              className={`p-2 rounded-lg transition-colors ${
                                aluno.aprovado
                                  ? "text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                                  : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                              }`}
                              title={
                                aluno.aprovado ? "Remover Aprovação" : "Aprovar"
                              }
                            >
                              <span className="text-lg">
                                {aluno.aprovado ? "❌" : "✅"}
                              </span>
                            </button>
                            <button
                              onClick={() => abrirModalPromocao(aluno)}
                              className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Promover para Mestre"
                            >
                              <span className="text-lg">👑</span>
                            </button>
                            <button
                              onClick={() => openModal(aluno)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <span className="text-lg">✏️</span>
                            </button>
                            <button
                              onClick={() => deleteAluno(aluno)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <span className="text-lg">🗑️</span>
                            </button>
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
              {filteredAlunos.map((aluno) => (
                <div
                  key={aluno.id}
                  className="bg-white rounded-xl shadow-lg border border-primary-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedAlunos.has(aluno.id)}
                        onChange={() => toggleSelectAluno(aluno.id)}
                        className="w-4 h-4 text-primary-600 bg-white border-2 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-primary-950 truncate">
                          {aluno.nome_completo || "Nome não informado"}
                        </h3>
                        <p className="text-sm text-primary-600 truncate">
                          {aluno.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${
                        aluno.aprovado
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {aluno.aprovado ? "Aprovado" : "Pendente"}
                    </span>
                  </div>

                  <div className="flex items-center mb-3">
                    <BeltIcon
                      color={aluno.cor_faixa || "Branca"}
                      size={32}
                      className="mr-2"
                    />
                    <span className="text-sm text-primary-700 mr-4">
                      {aluno.cor_faixa || "Não definida"}
                    </span>
                    <span className="text-xs text-primary-500">
                      {new Date(aluno.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {aluno.contato && (
                    <div className="mb-3">
                      <p className="text-sm text-primary-700">
                        📞 {aluno.contato}
                      </p>
                    </div>
                  )}

                  {/* Tipo de Aluno */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    {aluno.aluno_particular && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                        <span className="mr-1">💰</span>
                        Particular{" "}
                        {aluno.valor_mensalidade > 0 &&
                          `(R$ ${aluno.valor_mensalidade.toFixed(2)})`}
                      </span>
                    )}
                    {aluno.aluno_projeto_social && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                        <span className="mr-1">🤝</span>
                        Projeto Social
                      </span>
                    )}
                    {!aluno.aluno_particular && !aluno.aluno_projeto_social && (
                      <span className="text-xs text-gray-500">
                        Tipo não definido
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => toggleAprovado(aluno)}
                      className={`p-2 rounded-lg transition-colors text-sm ${
                        aluno.aprovado
                          ? "text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                          : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                      }`}
                      title={aluno.aprovado ? "Remover Aprovação" : "Aprovar"}
                    >
                      <span className="text-lg">
                        {aluno.aprovado ? "❌" : "✅"}
                      </span>
                    </button>
                    <button
                      onClick={() => abrirModalPromocao(aluno)}
                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Promover para Mestre"
                    >
                      <span className="text-lg">👑</span>
                    </button>
                    <button
                      onClick={() => openModal(aluno)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <span className="text-lg">✏️</span>
                    </button>
                    <button
                      onClick={() => deleteAluno(aluno)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Estado vazio */}
            {filteredAlunos.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 text-center py-12">
                <span className="text-6xl mb-4 block">👥</span>
                <p className="text-primary-600 text-lg mb-2">
                  Nenhum aluno encontrado
                </p>
                <p className="text-sm text-primary-500">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            )}
          </>
        )}

        {/* Modal de Promoção para Mestre - MEGA PERSONALIZADO */}
        {showPromocaoModal && alunoParaPromover && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] border-2 sm:border-4 border-yellow-400 overflow-y-auto animate-pulse">
              {/* Header com Efeito Dourado */}
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 p-1">
                <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6 text-center">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">
                    👑
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold text-yellow-400 mb-2 tracking-wide">
                    PROMOÇÃO PARA MESTRE
                  </h2>
                  <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
                </div>
              </div>

              {/* Conteúdo Principal */}
              <div className="p-4 sm:p-6 lg:p-8 text-center">
                {/* Avatar do Aluno */}
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-2xl border-2 sm:border-4 border-yellow-300">
                  <span className="text-3xl sm:text-5xl">🥋</span>
                </div>

                {/* Nome do Aluno */}
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4 px-2">
                  {alunoParaPromover.nome_completo}
                </h3>

                {/* Informações da Faixa */}
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <BeltIcon
                    color={alunoParaPromover.cor_faixa || "Branca"}
                    size={56}
                    className="mr-2 sm:mr-3 w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <span className="text-lg sm:text-xl text-yellow-300 font-semibold">
                    Faixa {alunoParaPromover.cor_faixa}
                  </span>
                </div>

                {/* Aviso Principal */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-red-400 shadow-xl mx-2 sm:mx-0">
                  <div className="text-xl sm:text-2xl mb-2 sm:mb-3">⚠️</div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    ATENÇÃO: DECISÃO IRREVERSÍVEL
                  </h4>
                  <p className="text-red-100 text-sm sm:text-lg leading-relaxed px-2 sm:px-0">
                    Esta ação promoverá{" "}
                    <strong>{alunoParaPromover.nome_completo}</strong> para
                    <span className="text-yellow-300 font-bold">
                      {" "}
                      MESTRE ADMINISTRADOR
                    </span>
                  </p>
                </div>

                {/* Poderes que serão concedidos */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-blue-400 mx-2 sm:mx-0">
                  <h4 className="text-lg sm:text-xl font-bold text-blue-200 mb-3 sm:mb-4 flex items-center justify-center">
                    <span className="mr-2">⚡</span>
                    PODERES CONCEDIDOS
                    <span className="ml-2">⚡</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-blue-100 text-sm sm:text-base">
                    <div className="flex items-center">
                      <span className="mr-2">🛡️</span>
                      Acesso Total ao Sistema
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">👥</span>
                      Gerenciar Outros Alunos
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📊</span>
                      Ver Relatórios Completos
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">🏆</span>
                      Gerenciar Faixas
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">💰</span>
                      Controle Financeiro
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">👑</span>
                      Promover Outros Mestres
                    </div>
                  </div>
                </div>

                {/* Confirmação Final */}
                <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 border-2 border-green-400 mx-2 sm:mx-0">
                  <p className="text-green-100 text-base sm:text-lg font-semibold">
                    🤔 Tem certeza absoluta desta decisão?
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
                  <button
                    onClick={cancelarPromocao}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-lg sm:rounded-xl border-2 border-gray-400 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-2">❌</span>
                      CANCELAR
                    </span>
                  </button>

                  <button
                    onClick={confirmarPromocao}
                    disabled={saving}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-purple-900 font-bold rounded-lg sm:rounded-xl border-2 border-yellow-300 hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <span className="flex items-center justify-center">
                      {saving ? (
                        <>
                          <svg
                            width={24}
                            height={24}
                            fill="currentColor"
                            className="mr-2 animate-spin"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
                          </svg>
                          PROMOVENDO...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">👑</span>
                          CONFIRMAR PROMOÇÃO
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* Rodapé */}
                <div className="mt-4 sm:mt-6 text-purple-300 text-xs sm:text-sm px-2 sm:px-0">
                  <p>⏰ Data: {new Date().toLocaleDateString("pt-BR")}</p>
                  <p className="truncate">
                    👤 Promovido por: {user?.nome_completo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {showModal && editingAluno && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 lg:p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh] overflow-y-auto">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h2 className="text-lg lg:text-2xl font-bold text-primary-950">
                  Editar Aluno: {editingAluno.nome_completo}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-4 lg:space-y-6">
                    <h3 className="text-base lg:text-lg font-semibold text-primary-950 border-b border-primary-200 pb-2">
                      Dados Pessoais
                    </h3>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-primary-900 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.nome_completo}
                        onChange={(e) =>
                          handleInputChange("nome_completo", e.target.value)
                        }
                        required
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={formData.data_nascimento}
                        onChange={(e) =>
                          handleInputChange("data_nascimento", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-900 mb-2">
                          Altura (cm)
                        </label>
                        <input
                          type="number"
                          value={formData.altura}
                          onChange={(e) =>
                            handleInputChange("altura", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-900 mb-2">
                          Peso (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.peso}
                          onChange={(e) =>
                            handleInputChange("peso", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Faixa Atual
                      </label>
                      <div className="flex items-center space-x-3">
                        <select
                          value={formData.cor_faixa}
                          onChange={(e) =>
                            handleInputChange("cor_faixa", e.target.value)
                          }
                          className="flex-1 px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {faixas.map((faixa) => (
                            <option key={faixa.nome} value={faixa.nome}>
                              {faixa.nome}
                            </option>
                          ))}
                        </select>
                        <BeltIcon color={formData.cor_faixa} size={48} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Escolaridade
                      </label>
                      <input
                        type="text"
                        value={formData.escolaridade}
                        onChange={(e) =>
                          handleInputChange("escolaridade", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Escola
                      </label>
                      <input
                        type="text"
                        value={formData.escola}
                        onChange={(e) =>
                          handleInputChange("escola", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Contato e Endereço */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-primary-950 border-b border-primary-200 pb-2">
                      Contato e Endereço
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Telefone/WhatsApp
                      </label>
                      <input
                        type="text"
                        value={formData.contato}
                        onChange={(e) =>
                          handleInputChange("contato", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Endereço Completo
                      </label>
                      <textarea
                        value={formData.endereco}
                        onChange={(e) =>
                          handleInputChange("endereco", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) =>
                          handleInputChange("instagram", e.target.value)
                        }
                        placeholder="@usuario"
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={formData.facebook}
                        onChange={(e) =>
                          handleInputChange("facebook", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        TikTok
                      </label>
                      <input
                        type="text"
                        value={formData.tiktok}
                        onChange={(e) =>
                          handleInputChange("tiktok", e.target.value)
                        }
                        placeholder="@usuario"
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-primary-950 border-b border-primary-200 pb-2 mt-8">
                      Informações Médicas
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Tipo Sanguíneo
                      </label>
                      <select
                        value={formData.tipo_sanguineo}
                        onChange={(e) =>
                          handleInputChange("tipo_sanguineo", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Toma algum remédio?
                      </label>
                      <textarea
                        value={formData.toma_remedio}
                        onChange={(e) =>
                          handleInputChange("toma_remedio", e.target.value)
                        }
                        rows={2}
                        placeholder="Descreva quais remédios..."
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        É alérgico a algum remédio?
                      </label>
                      <textarea
                        value={formData.alergico_remedio}
                        onChange={(e) =>
                          handleInputChange("alergico_remedio", e.target.value)
                        }
                        rows={2}
                        placeholder="Descreva as alergias..."
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de Aluno e Mensalidades */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-primary-950 border-b border-primary-200 pb-2 mb-6">
                    Tipo de Aluno e Mensalidades
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div
                        className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.aluno_particular
                            ? "bg-green-50 border-green-300 shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          id="aluno_particular"
                          checked={formData.aluno_particular}
                          onChange={(e) =>
                            handleInputChange(
                              "aluno_particular",
                              e.target.checked
                            )
                          }
                          className="w-5 h-5 text-green-600 bg-white border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2 checked:bg-green-600 checked:border-green-600"
                        />
                        <label
                          htmlFor="aluno_particular"
                          className={`ml-3 text-sm font-medium cursor-pointer ${
                            formData.aluno_particular
                              ? "text-green-800"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="mr-2">💰</span>
                          Aluno de Aulas Particulares
                        </label>
                      </div>

                      <div
                        className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.aluno_projeto_social
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          id="aluno_projeto_social"
                          checked={formData.aluno_projeto_social}
                          onChange={(e) =>
                            handleInputChange(
                              "aluno_projeto_social",
                              e.target.checked
                            )
                          }
                          className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 checked:bg-blue-600 checked:border-blue-600"
                        />
                        <label
                          htmlFor="aluno_projeto_social"
                          className={`ml-3 text-sm font-medium cursor-pointer ${
                            formData.aluno_projeto_social
                              ? "text-blue-800"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="mr-2">🤝</span>
                          Aluno do Projeto Social
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-purple-800 mb-3">
                      <span className="mr-2">📝</span>
                      Observações Gerais
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) =>
                        handleInputChange("observacoes", e.target.value)
                      }
                      rows={3}
                      placeholder="Informações adicionais sobre o aluno..."
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-purple-800 resize-none"
                    />
                  </div>
                </div>

                {/* Dados do Responsável */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-primary-950 border-b border-primary-200 pb-2 mb-6">
                    Dados do Responsável (se menor de idade)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Nome do Responsável
                      </label>
                      <input
                        type="text"
                        value={formData.nome_responsavel}
                        onChange={(e) =>
                          handleInputChange("nome_responsavel", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        CPF do Responsável
                      </label>
                      <input
                        type="text"
                        value={formData.cpf_responsavel}
                        onChange={(e) =>
                          handleInputChange("cpf_responsavel", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Contato do Responsável
                      </label>
                      <input
                        type="text"
                        value={formData.contato_responsavel}
                        onChange={(e) =>
                          handleInputChange(
                            "contato_responsavel",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Endereço do Responsável
                      </label>
                      <textarea
                        value={formData.endereco_responsavel}
                        onChange={(e) =>
                          handleInputChange(
                            "endereco_responsavel",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-primary-700 hover:text-primary-900 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg
                          width={20}
                          height={20}
                          fill="currentColor"
                          className="mr-2 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg
                          width={20}
                          height={20}
                          fill="currentColor"
                          className="mr-2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão em Lote */}
        {showDeleteBatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confirmar Exclusão em Lote
                  </h3>
                  <p className="text-gray-600">
                    Tem certeza que deseja excluir {selectedAlunos.size}{" "}
                    aluno(s) selecionado(s)?
                  </p>
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    Esta ação não pode ser desfeita!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteBatchModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteBatchAlunos}
                    className="flex-1 px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
                  >
                    Excluir Todos
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
