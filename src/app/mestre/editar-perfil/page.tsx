"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BeltIcon } from "@/components/BeltIcon";
import { supabase } from "@/lib/supabase";

interface Faixa {
  nome: string;
  cor: string;
  ordem: number;
}

export default function EditarPerfilMestrePage() {
  const { user, loading, updateProfile, isMestre } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [faixas, setFaixas] = useState<Faixa[]>([]);

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
    especialidade: "",
    biografia: "",
    anos_experiencia: "",
  });

  // Função para carregar faixas do banco
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

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (loading) {
      return;
    }

    // Se não há usuário ou não é mestre, redirecionar
    if (!user || !isMestre()) {
      router.push("/login");
      return;
    }

    // Carregar faixas do banco
    loadFaixas();

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
      especialidade: user.especialidade || "",
      biografia: user.biografia || "",
      anos_experiencia: user.anos_experiencia?.toString() || "",
    });
  }, [user, loading, router, isMestre]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Preparar dados removendo campos vazios
      const dataToUpdate: Record<string, string | number> = {};

      // Apenas incluir campos que têm valor válido
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (value && value.toString().trim()) {
          if (key === "altura" || key === "peso") {
            dataToUpdate[key] = parseFloat(value);
          } else if (key === "anos_experiencia") {
            dataToUpdate[key] = parseInt(value);
          } else {
            dataToUpdate[key] = value.toString().trim();
          }
        }
      });

      console.log("Dados a serem enviados:", dataToUpdate);

      // Se o email foi alterado, atualizar na auth também
      if (dataToUpdate.email && dataToUpdate.email !== user?.email) {
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
        console.error("Erro do updateProfile:", result.error);
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: "Perfil atualizado com sucesso! 🎉",
        });
        setTimeout(() => {
          router.push("/mestre");
        }, 2000);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-900 to-primary-800 shadow-lg border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/mestre")}
                className="mr-4 text-white hover:text-yellow-300 transition-colors"
              >
                <svg
                  width={24}
                  height={24}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.28 7.72a.75.75 0 010 1.06l-2.47 2.47H21a.75.75 0 010 1.5H4.81l2.47 2.47a.75.75 0 11-1.06 1.06L2.47 12.53a.75.75 0 010-1.06l3.75-3.75a.75.75 0 011.06 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center">
                <span className="mr-3 text-2xl lg:text-3xl">👑</span>
                Editar Perfil do Mestre
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-yellow-300 font-medium">
                {user.nome_completo || user.email}
              </span>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-lg lg:text-xl">🥋</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Título */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-4xl font-bold text-primary-950 mb-2">
            Perfil do Administrador
          </h2>
          <p className="text-primary-700 text-base lg:text-lg">
            Gerencie suas informações no{" "}
            <span className="text-yellow-600 font-semibold">Judô Sandokan</span>
          </p>
        </div>

        {/* Mensagem de Feedback */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Header do Formulário */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🏆</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">
                Informações do Mestre
              </h3>
              <div className="flex items-center justify-center">
                <BeltIcon
                  color={formData.cor_faixa || "Preta"}
                  size={48}
                  className="mr-3"
                />
                <span className="text-yellow-300 font-semibold text-lg">
                  Faixa {formData.cor_faixa || "Preta"}
                </span>
              </div>
            </div>

            <div className="p-6 lg:p-8 space-y-8">
              {/* Seção: Dados Pessoais */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-3 flex items-center">
                  <span className="mr-3 text-2xl">📝</span>
                  Dados Pessoais
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
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Digite seu email"
                      required
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
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
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
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
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
                    />
                  </div>

                  {/* Contato */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Contato (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={formData.contato}
                      onChange={(e) =>
                        handleInputChange("contato", e.target.value)
                      }
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
                    />
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
                      placeholder="175"
                      min="100"
                      max="250"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
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
                      onChange={(e) =>
                        handleInputChange("peso", e.target.value)
                      }
                      placeholder="70.5"
                      min="30"
                      max="200"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
                    />
                  </div>

                  {/* Endereço */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Endereço
                    </label>
                    <textarea
                      value={formData.endereco}
                      onChange={(e) =>
                        handleInputChange("endereco", e.target.value)
                      }
                      rows={3}
                      placeholder="Rua, número, bairro, cidade, CEP..."
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Informações Profissionais */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-3 flex items-center">
                  <span className="mr-3 text-2xl">🥋</span>
                  Informações Profissionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cor da Faixa */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Cor da Faixa
                    </label>
                    <div className="flex items-center space-x-3">
                      <select
                        value={formData.cor_faixa}
                        onChange={(e) =>
                          handleInputChange("cor_faixa", e.target.value)
                        }
                        className="flex-1 px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
                      >
                        <option value="">Selecione</option>
                        {faixas.map((faixa) => (
                          <option key={faixa.nome} value={faixa.nome}>
                            {faixa.nome}
                          </option>
                        ))}
                      </select>
                      {formData.cor_faixa && (
                        <BeltIcon color={formData.cor_faixa} size={48} />
                      )}
                    </div>
                  </div>

                  {/* Anos de Experiência */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Anos de Experiência
                    </label>
                    <input
                      type="number"
                      value={formData.anos_experiencia}
                      onChange={(e) =>
                        handleInputChange("anos_experiencia", e.target.value)
                      }
                      placeholder="10"
                      min="1"
                      max="50"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
                    />
                  </div>

                  {/* Escola/Academia */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Escola/Academia
                    </label>
                    <input
                      type="text"
                      value={formData.escola}
                      onChange={(e) =>
                        handleInputChange("escola", e.target.value)
                      }
                      placeholder="Nome da escola onde treina/ensina"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
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
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
                    >
                      <option value="">Selecione</option>
                      <option value="Ensino Fundamental">
                        Ensino Fundamental
                      </option>
                      <option value="Ensino Médio">Ensino Médio</option>
                      <option value="Ensino Superior">Ensino Superior</option>
                      <option value="Pós-graduação">Pós-graduação</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="Doutorado">Doutorado</option>
                    </select>
                  </div>

                  {/* Especialidade */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Especialidade/Formação
                    </label>
                    <input
                      type="text"
                      value={formData.especialidade}
                      onChange={(e) =>
                        handleInputChange("especialidade", e.target.value)
                      }
                      placeholder="Ex: Educação Física, Artes Marciais, etc."
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
                    />
                  </div>

                  {/* Biografia */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Biografia/Sobre Mim
                    </label>
                    <textarea
                      value={formData.biografia}
                      onChange={(e) =>
                        handleInputChange("biografia", e.target.value)
                      }
                      rows={4}
                      placeholder="Conte um pouco sobre sua trajetória, conquistas e filosofia no judô..."
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Redes Sociais */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-3 flex items-center">
                  <span className="mr-3 text-2xl">📱</span>
                  Redes Sociais
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
                      placeholder="@seu_usuario"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
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
                      placeholder="facebook.com/seu_perfil"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
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
                      placeholder="@seu_usuario"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Informações Médicas */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-6 border-b border-primary-200 pb-3 flex items-center">
                  <span className="mr-3 text-2xl">🏥</span>
                  Informações Médicas
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
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900"
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

                  {/* Uso de Medicamentos */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Medicamentos em uso
                    </label>
                    <textarea
                      value={formData.toma_remedio}
                      onChange={(e) =>
                        handleInputChange("toma_remedio", e.target.value)
                      }
                      rows={3}
                      placeholder="Liste os medicamentos..."
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900 resize-none"
                    />
                  </div>

                  {/* Alergias */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Alergias a medicamentos
                    </label>
                    <textarea
                      value={formData.alergico_remedio}
                      onChange={(e) =>
                        handleInputChange("alergico_remedio", e.target.value)
                      }
                      rows={3}
                      placeholder="Liste as alergias..."
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-primary-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push("/mestre")}
                  className="px-6 py-3 text-primary-700 hover:text-primary-900 font-medium transition-colors border border-primary-300 rounded-lg hover:bg-primary-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
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
                      <span className="mr-2">💾</span>
                      Salvar Perfil
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
