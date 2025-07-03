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

  // Funções de formatação
  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, "");

    // Aplica a máscara do CPF
    if (cleanValue.length <= 11) {
      return cleanValue
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return cleanValue
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, "");

    // Aplica a máscara do telefone
    if (cleanValue.length <= 10) {
      // Formato: (11) 1234-5678
      return cleanValue
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      // Formato: (11) 91234-5678
      return cleanValue
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

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
      let processedValue = value;

      // Aplicar formatações específicas
      if (name === "cpfResponsavel") {
        processedValue = formatCPF(value);
      } else if (name === "contato" || name === "contatoResponsavel") {
        processedValue = formatPhone(value);
      } else if (name === "email") {
        processedValue = value.trim();
      }

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("🚀 INICIANDO PROCESSO DE CADASTRO...");
    console.log("📌 Verificando Supabase:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseClient: !!supabase,
    });

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
      console.log(
        "📧 Tentando criar usuário com email:",
        formData.email.trim()
      );

      // Adicionar timeout para evitar travamento
      const signUpPromise = supabase.auth.signUp({
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

      // Timeout de 10 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error("Timeout: A requisição demorou muito para responder")
            ),
          10000
        )
      );

      console.log("⏳ Aguardando resposta do Supabase...");

      try {
        const result = (await Promise.race([
          signUpPromise,
          timeoutPromise,
        ])) as { data: any; error: any };

        const { data: authData, error: authError } = result;

        console.log("📊 Resultado do signUp:", {
          success: !!authData?.user,
          userId: authData?.user?.id,
          error: authError?.message,
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
      } catch (timeoutError) {
        if (
          timeoutError instanceof Error &&
          timeoutError.message.includes("Timeout")
        ) {
          console.error("⏰ Timeout na criação do usuário");
          setError(
            "A conexão com o servidor está demorando muito. Por favor, verifique sua internet e tente novamente."
          );
          return;
        }
        throw timeoutError;
      }
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
                    placeholder="(66) 99999-9999"
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
                    placeholder="(66) 99999-9999"
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
              <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto p-6">
                <h3 className="text-2xl font-bold mb-6 text-center text-primary-950">
                  🥋 DOJÔ DE JUDÔ SANDOKAN MATUPÁ-MT
                </h3>

                <div className="text-sm text-gray-700 space-y-4">
                  {/* Informações da Entidade */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold mb-2">INFORMAÇÕES DA ENTIDADE</h4>
                    <p>
                      <strong>Endereço:</strong> Linha do Ranário II, Chácara
                      Campo Cerrado, Matupá-MT
                    </p>
                    <p>
                      <strong>CEP:</strong> 78525-000
                    </p>
                    <p>
                      <strong>CNPJ:</strong> Em processo - Inscrição Estadual:
                      Isento
                    </p>
                    <p>
                      <strong>Contato:</strong> (66) 9 9909-0290
                    </p>
                    <p>
                      <strong>Professor Orientador:</strong> David Richard Servi
                    </p>
                    <p>
                      <strong>Fundação:</strong> 01 de janeiro de 2022
                    </p>
                    <p>
                      <strong>Filiação:</strong> Dojô Sandokan Diamantino-MT,
                      Liga de Judô Portal da Amazônia e Confederação Brasileira
                      de Judô
                    </p>
                  </div>

                  {/* Termo de Responsabilidade */}
                  <div>
                    <h4 className="font-bold mb-2">
                      TERMO DE RESPONSABILIDADE
                    </h4>
                    <p className="mb-2">
                      Ao se cadastrar no sistema do Dojô de Judô Sandokan
                      Matupá-MT, o aluno (ou seu responsável legal, no caso de
                      menor de idade) declara estar ciente das seguintes
                      condições:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mb-3">
                      <li>
                        Estar ciente das condições físicas e de saúde
                        necessárias para a prática do judô
                      </li>
                      <li>
                        Assumir responsabilidade por eventuais problemas de
                        saúde, torções ou lesões decorrentes da prática
                        esportiva
                      </li>
                      <li>
                        Reconhecer que o judô é um esporte de contato com riscos
                        inerentes à modalidade
                      </li>
                      <li>
                        Isentar professores, Dojô Sandokan e demais envolvidos
                        de qualquer ônus decorrente da prática
                      </li>
                      <li>
                        Informar ao professor responsável sobre qualquer
                        impedimento médico ou físico
                      </li>
                      <li>
                        Fornecer informações verdadeiras e atualizadas no
                        cadastro
                      </li>
                    </ul>
                  </div>

                  {/* Termo de Compromisso */}
                  <div>
                    <h4 className="font-bold mb-2">TERMO DE COMPROMISSO</h4>
                    <p className="mb-2">O aluno se compromete a:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-3">
                      <li>
                        Zelar pelo uso adequado dos materiais fornecidos
                        (kimono, camiseta, mochila)
                      </li>
                      <li>
                        Cumprir todas as determinações estabelecidas pelos
                        professores e educadores
                      </li>
                      <li>
                        Respeitar outros alunos, professores e a filosofia do
                        judô
                      </li>
                      <li>
                        Participar das atividades com responsabilidade e
                        dedicação
                      </li>
                      <li>
                        Devolver os materiais em caso de desistência ou
                        desligamento
                      </li>
                    </ul>
                    <p className="text-red-600 font-medium">
                      <strong>Importante:</strong> Em caso de dano, perda ou não
                      devolução dos materiais, o responsável deverá arcar com o
                      custo de R$ 350,00.
                    </p>
                  </div>

                  {/* Termo de Uso de Imagem */}
                  <div>
                    <h4 className="font-bold mb-2">
                      AUTORIZAÇÃO DE USO DE IMAGEM
                    </h4>
                    <p className="mb-2">
                      Ao aceitar estes termos, o aluno (ou responsável) autoriza
                      o uso de sua imagem para:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mb-3">
                      <li>
                        Campanhas promocionais e institucionais do Dojô Sandokan
                        Matupá
                      </li>
                      <li>
                        Documentação de treinamentos, competições e eventos
                      </li>
                      <li>
                        Divulgação em mídias sociais, site, outdoor, folhetos e
                        materiais gráficos
                      </li>
                      <li>Mídia eletrônica (televisão, rádio, internet)</li>
                      <li>Promoção da modalidade de judô</li>
                    </ul>
                    <p className="text-sm">
                      A autorização é concedida gratuitamente, abrangendo
                      território nacional e internacional.
                    </p>
                  </div>

                  {/* Política de Privacidade */}
                  <div>
                    <h4 className="font-bold mb-2">POLÍTICA DE PRIVACIDADE</h4>
                    <p className="mb-2">
                      Seus dados pessoais serão utilizados para:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mb-3">
                      <li>Administração e controle de matrículas</li>
                      <li>Comunicação sobre atividades e eventos</li>
                      <li>Emissão de certificados e documentos</li>
                      <li>Controle de saúde e segurança dos praticantes</li>
                      <li>Relatórios para entidades federativas do judô</li>
                    </ul>
                    <p className="text-sm">
                      Os dados não serão compartilhados com terceiros sem
                      autorização, exceto quando exigido por lei ou para
                      cumprimento das atividades esportivas.
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-center font-medium text-gray-800">
                      柔道 - &quot;Caminho Suave&quot; - Filosofia de vida
                      através da arte marcial
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
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
