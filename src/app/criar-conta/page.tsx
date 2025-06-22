"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientOnly from "@/components/ClientOnly";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
// import { BeltIcon } from "@/components/BeltIcon"; // Removido - não usado

interface Faixa {
  nome: string;
  cor: string;
  ordem: number;
}

export default function CriarContaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Dados pessoais
    nomeCompleto: "",
    email: "",
    senha: "",
    dataNascimento: "",
    altura: "",
    peso: "",
    escolaridade: "",
    corFaixa: "",
    escola: "",
    contato: "",
    endereco: "",

    // Redes sociais
    instagram: "",
    facebook: "",
    tiktok: "",

    // Saúde
    tipoSanguineo: "",
    tomaRemedio: "",
    alergicoRemedio: "",

    // Responsável
    nomeResponsavel: "",
    enderecoResponsavel: "",
    cpfResponsavel: "",
    contatoResponsavel: "",

    // Termos
    aceitaTermos: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [faixas, setFaixas] = useState<Faixa[]>([]);

  // Função para carregar faixas do banco
  const loadFaixas = async () => {
    try {
      const { data, error } = await supabase
        .from("faixas")
        .select("nome, cor, ordem")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Erro ao carregar faixas:", error);
        return;
      }

      setFaixas(data || []);
    } catch (error) {
      console.error("Erro inesperado ao carregar faixas:", error);
    }
  };

  // Carregar faixas quando o componente montar
  useEffect(() => {
    loadFaixas();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Aplicar trim apenas em campos específicos
      const shouldTrim = ["email", "nomeCompleto", "escola"].includes(name);
      setFormData((prev) => ({
        ...prev,
        [name]: shouldTrim ? value.trim() : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("🚀 INICIANDO PROCESSO DE CADASTRO...");

    try {
      // Verificar se os termos foram aceitos
      if (!formData.aceitaTermos) {
        setError("Você deve aceitar os termos e condições para prosseguir.");
        return;
      }

      // Validações básicas
      if (!formData.nomeCompleto?.trim()) {
        setError("Nome completo é obrigatório.");
        return;
      }

      if (!formData.email?.trim()) {
        setError("Email é obrigatório.");
        return;
      }

      if (!formData.senha?.trim()) {
        setError("Senha é obrigatória.");
        return;
      }

      if (!formData.dataNascimento) {
        setError("Data de nascimento é obrigatória.");
        return;
      }

      console.log("✅ Validações básicas OK");
      console.log("📧 Email:", formData.email.trim());
      console.log("👤 Nome:", formData.nomeCompleto.trim());

      // 1. Criar usuário no auth.users (sem confirmação de email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.senha,
        options: {
          emailRedirectTo: undefined, // Remove redirecionamento por email
          data: {
            nome_completo: formData.nomeCompleto.trim(),
            email_confirm: false, // Força não enviar email
          },
        },
      });

      if (authError) {
        // Se der rate limit ou erro de email, mostra mensagem específica
        if (
          authError.message.includes("rate limit") ||
          authError.message.includes("email rate limit") ||
          authError.message.includes("too many requests")
        ) {
          setError(
            "⏰ Muitas tentativas de cadastro detectadas. Por favor, aguarde alguns minutos antes de tentar novamente. Isso é uma proteção de segurança do sistema."
          );
          return;
        }
        throw authError;
      }

      if (!authData.user?.id) {
        throw new Error("Erro ao criar usuário");
      }

      console.log("✅ Usuário criado com sucesso!");
      console.log("🆔 ID do usuário:", authData.user.id);
      console.log("📝 Preparando dados do perfil...");

      // 2. Atualizar dados no user_profiles (trigger já criou o registro básico)
      const userData = {
        nome_completo: formData.nomeCompleto.trim(),
        data_nascimento: formData.dataNascimento,
        altura: formData.altura ? parseInt(formData.altura) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        escolaridade: formData.escolaridade || "",
        cor_faixa: formData.corFaixa || "",
        escola: formData.escola?.trim() || "",
        contato: formData.contato || "",
        endereco: formData.endereco || "",
        instagram: formData.instagram || "",
        facebook: formData.facebook || "",
        tiktok: formData.tiktok || "",
        tipo_sanguineo: formData.tipoSanguineo || "",
        toma_remedio: formData.tomaRemedio || "",
        alergico_remedio: formData.alergicoRemedio || "",
        nome_responsavel: formData.nomeResponsavel || "",
        endereco_responsavel: formData.enderecoResponsavel || "",
        cpf_responsavel: formData.cpfResponsavel || "",
        contato_responsavel: formData.contatoResponsavel || "",
        nivel_usuario: "aluno",
        aprovado: false,
      };

      // Usar UPDATE em vez de INSERT porque o trigger já criou o registro
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update(userData)
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Erro ao atualizar perfil:", profileError);
        // Se falhar o update, tentar o método RPC como fallback
        const { error: rpcError } = await supabase.rpc(
          "update_profile_on_signup",
          {
            user_id: authData.user.id,
            profile_data: userData,
          }
        );

        if (rpcError) {
          console.error("Erro no método RPC também:", rpcError);
          throw new Error("Erro ao salvar dados do perfil. Tente novamente.");
        }
      }

      console.log("✅ Perfil atualizado com sucesso!");
      console.log("🎉 CADASTRO COMPLETO!");

      setSuccess(
        "🎉 Conta criada com sucesso! Você já pode fazer login no sistema."
      );

      // Scroll para mostrar mensagem de sucesso
      setTimeout(() => {
        document.querySelector(".bg-green-50")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      // Limpar formulário
      setFormData({
        nomeCompleto: "",
        email: "",
        senha: "",
        dataNascimento: "",
        altura: "",
        peso: "",
        escolaridade: "",
        corFaixa: "",
        escola: "",
        contato: "",
        endereco: "",
        instagram: "",
        facebook: "",
        tiktok: "",
        tipoSanguineo: "",
        tomaRemedio: "",
        alergicoRemedio: "",
        nomeResponsavel: "",
        enderecoResponsavel: "",
        cpfResponsavel: "",
        contatoResponsavel: "",
        aceitaTermos: false,
      });

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: unknown) {
      console.error("❌ Erro durante o cadastro:", error);

      let errorMessage = "Erro inesperado ao criar conta. Tente novamente.";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Mensagens de erro mais amigáveis
        if (errorMessage.includes("rate limit")) {
          errorMessage =
            "⏰ Muitas tentativas de cadastro. Por favor, aguarde alguns minutos antes de tentar novamente.";
        } else if (errorMessage.includes("already registered")) {
          errorMessage =
            "📧 Este email já está cadastrado. Tente fazer login ou use outro email.";
        } else if (errorMessage.includes("Invalid email")) {
          errorMessage =
            "📧 Email inválido. Verifique se digitou corretamente.";
        } else if (errorMessage.includes("password")) {
          errorMessage = "🔐 Senha muito fraca. Use pelo menos 6 caracteres.";
        }
      }

      setError(errorMessage);

      // Scroll para mostrar mensagem de erro
      setTimeout(() => {
        document.querySelector(".bg-red-50")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const tiposSanguineos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando formulário...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 pt-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Botão Voltar */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 border border-primary-300 rounded-lg shadow-sm transition-colors duration-200 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
              Voltar ao Início
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-primary-200">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary-950 mb-4">
                🥋 <span className="text-yellow-600">JUDÔ SANDOKAN</span> -
                CRIAR CONTA
              </h1>
              <p className="text-lg text-primary-800">
                Preencha os dados abaixo para criar sua conta no sistema
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mensagens de erro e sucesso */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Dados Pessoais */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6 flex items-center">
                Dados Pessoais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Digite sua senha"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    name="altura"
                    value={formData.altura}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Ex: 170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="peso"
                    value={formData.peso}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Ex: 70.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Escolaridade
                  </label>
                  <select
                    name="escolaridade"
                    value={formData.escolaridade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Selecione sua escolaridade</option>
                    <option value="Ensino Fundamental Incompleto">
                      Ensino Fundamental Incompleto
                    </option>
                    <option value="Ensino Fundamental Completo">
                      Ensino Fundamental Completo
                    </option>
                    <option value="Ensino Médio Incompleto">
                      Ensino Médio Incompleto
                    </option>
                    <option value="Ensino Médio Completo">
                      Ensino Médio Completo
                    </option>
                    <option value="Ensino Superior Incompleto">
                      Ensino Superior Incompleto
                    </option>
                    <option value="Ensino Superior Completo">
                      Ensino Superior Completo
                    </option>
                    <option value="Pós-graduação">Pós-graduação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Faixa Atual
                  </label>
                  <select
                    name="corFaixa"
                    value={formData.corFaixa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Selecione sua faixa</option>
                    {faixas.map((faixa) => (
                      <option key={faixa.nome} value={faixa.nome}>
                        {faixa.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Escola
                  </label>
                  <input
                    type="text"
                    name="escola"
                    value={formData.escola}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Nome da escola que estuda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Contato/Telefone
                  </label>
                  <input
                    type="tel"
                    name="contato"
                    value={formData.contato}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6">
                Redes Sociais (Opcional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="@seuusuario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="facebook.com/seuusuario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    TikTok
                  </label>
                  <input
                    type="text"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="@seuusuario"
                  />
                </div>
              </div>
            </div>

            {/* Informações de Saúde */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6">
                Informações de Saúde
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Tipo Sanguíneo
                  </label>
                  <select
                    name="tipoSanguineo"
                    value={formData.tipoSanguineo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Selecione</option>
                    {tiposSanguineos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Toma algum remédio?
                  </label>
                  <input
                    type="text"
                    name="tomaRemedio"
                    value={formData.tomaRemedio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Qual? (ou 'Não' se não toma)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Alérgico a algum remédio?
                  </label>
                  <input
                    type="text"
                    name="alergicoRemedio"
                    value={formData.alergicoRemedio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Qual? (ou 'Não' se não tem alergia)"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Responsável (para menores de idade) */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6">
                Dados do Responsável
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (Obrigatório para menores de 18 anos)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Nome do Responsável
                  </label>
                  <input
                    type="text"
                    name="nomeResponsavel"
                    value={formData.nomeResponsavel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Nome completo do responsável"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    CPF do Responsável
                  </label>
                  <input
                    type="text"
                    name="cpfResponsavel"
                    value={formData.cpfResponsavel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Contato do Responsável
                  </label>
                  <input
                    type="tel"
                    name="contatoResponsavel"
                    value={formData.contatoResponsavel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Endereço do Responsável
                  </label>
                  <input
                    type="text"
                    name="enderecoResponsavel"
                    value={formData.enderecoResponsavel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
            </div>

            {/* Termos e Condições */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="aceitaTermos"
                  checked={formData.aceitaTermos}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded"
                  required
                />
                <div className="text-sm">
                  <label className="font-medium text-primary-900">
                    Aceito os termos e condições *
                  </label>
                  <p className="text-gray-600">
                    Li e concordo com os{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-primary-600 hover:text-primary-800 underline"
                    >
                      termos de uso e política de privacidade
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de Submit */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:user-plus" className="w-5 h-5" />
                    <span>Criar Conta</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Modal de Termos e Condições */}
          {showTermsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl max-h-96 overflow-y-auto p-6">
                <h3 className="text-xl font-bold mb-4">Termos e Condições</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    Ao se cadastrar no sistema do Judô Sandokan, você concorda
                    com:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Fornecer informações verdadeiras e atualizadas</li>
                    <li>Seguir as regras e regulamentos do dojo</li>
                    <li>Respeitar outros alunos e professores</li>
                    <li>Manter a confidencialidade das informações do dojo</li>
                    <li>Participar das atividades com responsabilidade</li>
                  </ul>
                  <p>
                    Seus dados pessoais serão utilizados apenas para fins
                    administrativos e educacionais, conforme nossa política de
                    privacidade.
                  </p>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}
