"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";
import { BeltIcon } from "@/components/BeltIcon";

export default function EditarPerfilPage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    email: "",
    nome_completo: "",
    data_nascimento: "",
    altura: "",
    peso: "",
    escolaridade: "",
    cor_faixa: "",
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
  });

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (loading) {
      return;
    }

    // Se não há usuário ou não é aluno aprovado, redirecionar
    if (!user || user.nivel_usuario !== "aluno" || !user.aprovado) {
      router.push("/login");
      return;
    }

    // Preencher formulário com dados atuais
    setFormData({
      email: user.email || "",
      nome_completo: user.nome_completo || "",
      data_nascimento: user.data_nascimento || "",
      altura: user.altura?.toString() || "",
      peso: user.peso?.toString() || "",
      escolaridade: user.escolaridade || "",
      cor_faixa: user.cor_faixa || "",
      escola: user.escola || "",
      contato: user.contato || "",
      endereco: user.endereco || "",
      instagram: user.instagram || "",
      facebook: user.facebook || "",
      tiktok: user.tiktok || "",
      tipo_sanguineo: user.tipo_sanguineo || "",
      toma_remedio: user.toma_remedio || "",
      alergico_remedio: user.alergico_remedio || "",
      nome_responsavel: user.nome_responsavel || "",
      endereco_responsavel: user.endereco_responsavel || "",
      cpf_responsavel: user.cpf_responsavel || "",
      contato_responsavel: user.contato_responsavel || "",
    });
  }, [user, loading, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.trim(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Converter campos numéricos
      const dataToUpdate = {
        ...formData,
        altura: formData.altura ? parseInt(formData.altura) : undefined,
        peso: formData.peso ? parseFloat(formData.peso) : undefined,
      };

      // Se o email foi alterado, atualizar na auth também
      if (dataToUpdate.email && dataToUpdate.email !== user?.email) {
        const { supabase } = await import("@/lib/supabase");
        const { error: authError } = await supabase.auth.updateUser({
          email: dataToUpdate.email as string,
        });

        if (authError) {
          setMessage({
            type: "error",
            text: `Erro ao atualizar email: ${authError.message}`,
          });
          return;
        }
      }

      const result = await updateProfile(dataToUpdate);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
        setTimeout(() => {
          router.push("/aluno");
        }, 2000);
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erro inesperado ao atualizar perfil",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <button
                onClick={() => router.push("/aluno")}
                className="mr-4 text-primary-700 hover:text-primary-900 transition-colors"
              >
                <Icon icon="iron:arrow-left" width={24} height={24} />
              </button>
              <h1 className="text-2xl font-bold text-primary-950">
                🥋 Editar Perfil
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-primary-700">
                {user.nome_completo || user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-950 mb-2">
            Editar Meu Perfil
          </h2>
          <p className="text-primary-700">
            Atualize suas informações no{" "}
            <span className="text-yellow-600 font-semibold">Judô Sandokan</span>
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seção: Dados Pessoais */}
            <div>
              <h3 className="text-xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-2">
                📝 Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Digite seu email"
                    required
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                  <p className="mt-1 text-xs text-primary-600">
                    ⚠️ Alterar o email exigirá nova confirmação por email
                  </p>
                </div>

                {/* Nome Completo */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_completo}
                    onChange={(e) =>
                      handleInputChange("nome_completo", e.target.value)
                    }
                    placeholder="Digite seu nome completo"
                    required
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) =>
                      handleInputChange("data_nascimento", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* Escolaridade */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Escolaridade
                  </label>
                  <select
                    value={formData.escolaridade}
                    onChange={(e) =>
                      handleInputChange("escolaridade", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  >
                    <option value="">Selecione</option>
                    <option value="Ensino Fundamental">
                      Ensino Fundamental
                    </option>
                    <option value="Ensino Médio">Ensino Médio</option>
                    <option value="Ensino Superior">Ensino Superior</option>
                    <option value="Pós-graduação">Pós-graduação</option>
                  </select>
                </div>

                {/* Altura */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.altura}
                    onChange={(e) =>
                      handleInputChange("altura", e.target.value)
                    }
                    placeholder="170"
                    min="100"
                    max="250"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* Peso */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.peso}
                    onChange={(e) => handleInputChange("peso", e.target.value)}
                    placeholder="70.5"
                    min="30"
                    max="200"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Judô */}
            <div>
              <h3 className="text-xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-2">
                🥋 Informações de Judô
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Faixa Atual (Somente leitura) */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Sua Faixa Atual
                  </label>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    {formData.cor_faixa ? (
                      <div className="flex items-center">
                        <BeltIcon
                          color={formData.cor_faixa}
                          size={32}
                          className="drop-shadow-sm mr-3"
                        />
                        <div>
                          <span className="text-lg font-semibold text-gray-800">
                            Faixa {formData.cor_faixa}
                          </span>
                          <p className="text-sm text-gray-600">
                            Apenas o mestre pode alterar sua faixa
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        Sua faixa será definida pelo mestre
                      </p>
                    )}
                  </div>
                </div>

                {/* Escola/Academia */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Escola/Academia Anterior
                  </label>
                  <input
                    type="text"
                    value={formData.escola}
                    onChange={(e) =>
                      handleInputChange("escola", e.target.value)
                    }
                    placeholder="Nome da escola ou academia anterior"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Contato */}
            <div>
              <h3 className="text-xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-2">
                📞 Informações de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Telefone/WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.contato}
                    onChange={(e) =>
                      handleInputChange("contato", e.target.value)
                    }
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* Endereço */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) =>
                      handleInputChange("endereco", e.target.value)
                    }
                    placeholder="Rua, número, bairro, cidade/estado"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Redes Sociais */}
            <div>
              <h3 className="text-xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-2">
                📱 Redes Sociais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) =>
                      handleInputChange("instagram", e.target.value)
                    }
                    placeholder="@seuperfil"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={formData.facebook}
                    onChange={(e) =>
                      handleInputChange("facebook", e.target.value)
                    }
                    placeholder="Seu Nome no Facebook"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* TikTok */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="text"
                    value={formData.tiktok}
                    onChange={(e) =>
                      handleInputChange("tiktok", e.target.value)
                    }
                    placeholder="@seuperfil"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Saúde */}
            <div>
              <h3 className="text-xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-2">
                🏥 Informações de Saúde
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tipo Sanguíneo */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Tipo Sanguíneo
                  </label>
                  <select
                    value={formData.tipo_sanguineo}
                    onChange={(e) =>
                      handleInputChange("tipo_sanguineo", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
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

                {/* Toma Remédio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Toma algum remédio regularmente?
                  </label>
                  <input
                    type="text"
                    value={formData.toma_remedio}
                    onChange={(e) =>
                      handleInputChange("toma_remedio", e.target.value)
                    }
                    placeholder="Ex: Não / Sim, vitamina D"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* Alérgico a Remédio */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    É alérgico a algum remédio?
                  </label>
                  <input
                    type="text"
                    value={formData.alergico_remedio}
                    onChange={(e) =>
                      handleInputChange("alergico_remedio", e.target.value)
                    }
                    placeholder="Ex: Não / Sim, penicilina"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Responsável (para menores de idade) */}
            <div>
              <h3 className="text-xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-2">
                👨‍👩‍👧‍👦 Dados do Responsável (se menor de idade)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Responsável */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Nome do Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.nome_responsavel}
                    onChange={(e) =>
                      handleInputChange("nome_responsavel", e.target.value)
                    }
                    placeholder="Nome completo do responsável"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* CPF do Responsável */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    CPF do Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.cpf_responsavel}
                    onChange={(e) =>
                      handleInputChange("cpf_responsavel", e.target.value)
                    }
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* Contato do Responsável */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Telefone do Responsável
                  </label>
                  <input
                    type="tel"
                    value={formData.contato_responsavel}
                    onChange={(e) =>
                      handleInputChange("contato_responsavel", e.target.value)
                    }
                    placeholder="(11) 88888-7777"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>

                {/* Endereço do Responsável */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Endereço do Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.endereco_responsavel}
                    onChange={(e) =>
                      handleInputChange("endereco_responsavel", e.target.value)
                    }
                    placeholder="Endereço completo do responsável"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-primary-900"
                  />
                </div>
              </div>
            </div>

            {/* Mensagem de feedback */}
            {message.text && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "error"
                    ? "bg-red-100 border border-red-400 text-red-700"
                    : "bg-green-100 border border-green-400 text-green-700"
                }`}
              >
                <div className="flex items-center">
                  <Icon
                    icon={
                      message.type === "error"
                        ? "iron:warning"
                        : "iron:check-circle"
                    }
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  {message.text}
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/aluno")}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Icon
                  icon="iron:arrow-left"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary-950 hover:bg-primary-900 disabled:bg-primary-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Icon
                      icon="iron:refresh"
                      width={20}
                      height={20}
                      className="mr-2 animate-spin"
                    />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Icon
                      icon="iron:save"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
