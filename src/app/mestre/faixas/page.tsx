"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { BeltIcon } from "@/components/BeltIcon";

interface Faixa {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  ordem: number;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  nome: string;
  cor: string;
  ordem: number;
  descricao: string;
}

const CORES_PREDEFINIDAS = [
  "#FFFFFF", // Branca
  "#800020", // Bordô
  "#808080", // Cinza
  "#0066CC", // Azul
  "#FFD700", // Amarelo
  "#228B22", // Verde
  "#8A2BE2", // Roxa
  "#8B4513", // Marrom
  "#000000", // Preto
  "#FF0000", // Vermelho (extra)
  "#FFC0CB", // Rosa (extra)
  "#A52A2A", // Marrom escuro (extra)
];

export default function FaixasPage() {
  const { user, loading, isMestre } = useAuth();
  const [faixas, setFaixas] = useState<Faixa[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFaixa, setEditingFaixa] = useState<Faixa | null>(null);
  const [loadingFaixas, setLoadingFaixas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    cor: "#FFFFFF",
    ordem: 1,
    descricao: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isMestre())) {
      router.push("/login");
    }
  }, [user, loading, isMestre, router]);

  useEffect(() => {
    if (user && isMestre()) {
      loadFaixas();
    }
  }, [user, isMestre]);

  const loadFaixas = async () => {
    setLoadingFaixas(true);
    try {
      const { data, error } = await supabase
        .from("faixas")
        .select("*")
        .order("ordem", { ascending: true });

      if (!error && data) {
        setFaixas(data);
      } else {
        console.error("Erro ao carregar faixas:", error);
      }
    } catch (error) {
      console.error("Erro ao carregar faixas:", error);
    }
    setLoadingFaixas(false);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openModal = (faixa?: Faixa) => {
    if (faixa) {
      setEditingFaixa(faixa);
      setFormData({
        nome: faixa.nome,
        cor: faixa.cor,
        ordem: faixa.ordem,
        descricao: faixa.descricao || "",
      });
    } else {
      setEditingFaixa(null);
      const nextOrdem = Math.max(...faixas.map((f) => f.ordem), 0) + 1;
      setFormData({
        nome: "",
        cor: "#FFFFFF",
        ordem: nextOrdem,
        descricao: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFaixa(null);
    setFormData({
      nome: "",
      cor: "#FFFFFF",
      ordem: 1,
      descricao: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingFaixa) {
        // Atualizar faixa existente
        const { error } = await supabase
          .from("faixas")
          .update({
            nome: formData.nome,
            cor: formData.cor,
            icone: "belt-icon", // Sempre usar o ícone de faixa
            ordem: formData.ordem,
            descricao: formData.descricao,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingFaixa.id);

        if (error) {
          console.error("Erro ao atualizar faixa:", error);
          alert("Erro ao atualizar faixa: " + error.message);
        } else {
          await loadFaixas();
          closeModal();
        }
      } else {
        // Criar nova faixa
        const { error } = await supabase.from("faixas").insert({
          nome: formData.nome,
          cor: formData.cor,
          icone: "belt-icon", // Sempre usar o ícone de faixa
          ordem: formData.ordem,
          descricao: formData.descricao,
        });

        if (error) {
          console.error("Erro ao criar faixa:", error);
          alert("Erro ao criar faixa: " + error.message);
        } else {
          await loadFaixas();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro inesperado");
    }

    setSaving(false);
  };

  const handleDelete = async (faixa: Faixa) => {
    if (!confirm(`Deseja realmente excluir a faixa "${faixa.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("faixas")
        .delete()
        .eq("id", faixa.id);

      if (error) {
        console.error("Erro ao excluir faixa:", error);
        alert("Erro ao excluir faixa: " + error.message);
      } else {
        await loadFaixas();
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro inesperado");
    }
  };

  const toggleAtivo = async (faixa: Faixa) => {
    try {
      const { error } = await supabase
        .from("faixas")
        .update({
          ativo: !faixa.ativo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", faixa.id);

      if (error) {
        console.error("Erro ao alterar status:", error);
        alert("Erro ao alterar status: " + error.message);
      } else {
        await loadFaixas();
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro inesperado");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icon
            icon="mdi:loading"
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary-950 mb-2">
                Gerenciar Faixas
              </h1>
              <p className="text-primary-700">
                Configure as faixas do dojo com cores personalizadas
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <Icon icon="mdi:plus" width={20} height={20} className="mr-2" />
              Nova Faixa
            </button>
          </div>
        </div>

        {/* Grid de Faixas */}
        {loadingFaixas ? (
          <div className="text-center py-12">
            <Icon
              icon="mdi:loading"
              width={48}
              height={48}
              className="text-primary-600 animate-spin mx-auto mb-4"
            />
            <p className="text-primary-700">Carregando faixas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faixas.map((faixa) => (
              <div
                key={faixa.id}
                className={`bg-white rounded-xl shadow-lg p-8 border ${
                  faixa.ativo
                    ? "border-primary-200"
                    : "border-gray-300 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BeltIcon color={faixa.nome} size={64} className="mr-4" />
                    <div>
                      <h3 className="font-bold text-primary-950 text-lg">
                        {faixa.nome}
                      </h3>
                      <p className="text-primary-600">Ordem: {faixa.ordem}</p>
                    </div>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: faixa.cor }}
                  ></div>
                </div>

                {faixa.descricao && (
                  <p className="text-sm text-primary-700 mb-4">
                    {faixa.descricao}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      faixa.ativo
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {faixa.ativo ? "Ativo" : "Inativo"}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAtivo(faixa)}
                      className={`p-2 rounded-lg transition-colors ${
                        faixa.ativo
                          ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                          : "text-green-600 hover:text-green-800 hover:bg-green-100"
                      }`}
                      title={faixa.ativo ? "Desativar" : "Ativar"}
                    >
                      <Icon
                        icon={faixa.ativo ? "mdi:eye-off" : "mdi:eye"}
                        width={18}
                        height={18}
                      />
                    </button>
                    <button
                      onClick={() => openModal(faixa)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Icon icon="mdi:pencil" width={18} height={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faixa)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Icon icon="mdi:trash-can" width={18} height={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-primary-950">
                  {editingFaixa ? "Editar Faixa" : "Nova Faixa"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Nome da Faixa
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Branca, Bordô, Cinza..."
                  />
                </div>

                {/* Ordem */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Ordem Hierárquica
                  </label>
                  <input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) =>
                      handleInputChange("ordem", parseInt(e.target.value))
                    }
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Seleção de Cor */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Cor da Faixa
                  </label>
                  <div className="flex items-center space-x-4 mb-3">
                    <input
                      type="color"
                      value={formData.cor}
                      onChange={(e) => handleInputChange("cor", e.target.value)}
                      className="w-16 h-12 border border-primary-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.cor}
                      onChange={(e) => handleInputChange("cor", e.target.value)}
                      className="flex-1 px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="#FFFFFF"
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {CORES_PREDEFINIDAS.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => handleInputChange("cor", cor)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          formData.cor === cor
                            ? "border-primary-500 scale-110"
                            : "border-gray-300 hover:border-primary-300"
                        }`}
                        style={{ backgroundColor: cor }}
                        title={cor}
                      />
                    ))}
                  </div>
                </div>

                {/* Informação sobre o Ícone */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Ícone da Faixa
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                    <BeltIcon
                      color={formData.nome || "Branca"}
                      size={64}
                      className="mr-4"
                    />
                    <span className="text-sm text-gray-700">
                      Todas as faixas usam o mesmo ícone de faixa de judô
                      personalizado
                    </span>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-primary-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-primary-900 mb-3">
                    Preview da Faixa
                  </label>
                  <div className="flex items-center space-x-4">
                    <BeltIcon color={formData.nome || "Branca"} size={80} />
                    <div>
                      <h3 className="text-lg font-bold text-primary-950">
                        {formData.nome || "Nome da Faixa"}
                      </h3>
                      <p className="text-sm text-primary-600">
                        Ordem: {formData.ordem} | Cor: {formData.cor}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Descrição (Opcional)
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      handleInputChange("descricao", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Descrição da faixa..."
                  />
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
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
                        <Icon
                          icon="mdi:loading"
                          width={20}
                          height={20}
                          className="mr-2 animate-spin"
                        />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Icon
                          icon="mdi:check"
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                        {editingFaixa ? "Atualizar" : "Criar"} Faixa
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Link Voltar */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/mestre")}
            className="text-primary-800 hover:text-primary-950 font-medium transition-colors flex items-center"
          >
            <Icon
              icon="mdi:arrow-left"
              width={20}
              height={20}
              className="mr-2"
            />
            Voltar ao Painel do Mestre
          </button>
        </div>
      </div>
    </div>
  );
}
