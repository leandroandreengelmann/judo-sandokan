"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientOnly from "@/components/ClientOnly";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { BeltIcon } from "@/components/BeltIcon";

interface Faixa {
  nome: string;
  cor: string;
  ordem: number;
}

export default function Cadastro2Page() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    // Dados pessoais - TODOS OBRIGATÓRIOS
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

    // Redes sociais - TODAS OBRIGATÓRIAS
    instagram: "",
    facebook: "",
    tiktok: "",

    // Saúde - TODAS OBRIGATÓRIAS
    tipoSanguineo: "",
    tomaRemedio: "",
    alergicoRemedio: "",

    // Responsável - TODOS OBRIGATÓRIOS
    nomeResponsavel: "",
    enderecoResponsavel: "",
    cpfResponsavel: "",
    contatoResponsavel: "",

    // Termos
    aceitaTermos: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const validateForm = () => {
    const requiredFields = [
      { field: "nomeCompleto", label: "Nome Completo" },
      { field: "email", label: "Email" },
      { field: "senha", label: "Senha" },
      { field: "dataNascimento", label: "Data de Nascimento" },
      { field: "altura", label: "Altura" },
      { field: "peso", label: "Peso" },
      { field: "escolaridade", label: "Escolaridade" },
      { field: "corFaixa", label: "Cor da Faixa" },
      { field: "escola", label: "Escola" },
      { field: "contato", label: "Contato" },
      { field: "endereco", label: "Endereço" },
      { field: "instagram", label: "Instagram" },
      { field: "facebook", label: "Facebook" },
      { field: "tiktok", label: "TikTok" },
      { field: "tipoSanguineo", label: "Tipo Sanguíneo" },
      { field: "tomaRemedio", label: "Toma Remédio" },
      { field: "alergicoRemedio", label: "Alérgico a Remédio" },
      { field: "nomeResponsavel", label: "Nome do Responsável" },
      { field: "enderecoResponsavel", label: "Endereço do Responsável" },
      { field: "cpfResponsavel", label: "CPF do Responsável" },
      { field: "contatoResponsavel", label: "Contato do Responsável" },
    ];

    const emptyFields = requiredFields.filter(({ field }) => {
      const value = formData[field as keyof typeof formData];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(({ label }) => label).join(", ");
      setError(`Os seguintes campos são obrigatórios: ${fieldNames}`);
      return false;
    }

    // Validações específicas
    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido.");
      return false;
    }

    if (parseInt(formData.altura) <= 0 || parseInt(formData.altura) > 300) {
      setError("Altura deve ser um valor válido entre 1 e 300 cm.");
      return false;
    }

    if (parseFloat(formData.peso) <= 0 || parseFloat(formData.peso) > 500) {
      setError("Peso deve ser um valor válido entre 1 e 500 kg.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log("=== DEBUG FORMULÁRIO CADASTRO2 ===");
    console.log("Dados do formulário antes do envio:", formData);

    // Verificar se os termos foram aceitos
    if (!formData.aceitaTermos) {
      setError(
        "Você deve aceitar os termos e condições para prosseguir com o cadastro."
      );
      return;
    }

    // Validar todos os campos obrigatórios
    if (!validateForm()) {
      return;
    }

    try {
      setError(""); // Limpar erro anterior
      console.log("🚀 INICIANDO CADASTRO COMPLETO...");

      // Preparar dados para o perfil do usuário - TODOS OS CAMPOS PREENCHIDOS
      const userData = {
        nome_completo: formData.nomeCompleto.trim(),
        data_nascimento: formData.dataNascimento,
        altura: parseInt(formData.altura),
        peso: parseFloat(formData.peso),
        escolaridade: formData.escolaridade,
        cor_faixa: formData.corFaixa,
        escola: formData.escola.trim(),
        contato: formData.contato,
        endereco: formData.endereco,
        instagram: formData.instagram,
        facebook: formData.facebook,
        tiktok: formData.tiktok,
        tipo_sanguineo: formData.tipoSanguineo,
        toma_remedio: formData.tomaRemedio,
        alergico_remedio: formData.alergicoRemedio,
        nome_responsavel: formData.nomeResponsavel,
        endereco_responsavel: formData.enderecoResponsavel,
        cpf_responsavel: formData.cpfResponsavel,
        contato_responsavel: formData.contatoResponsavel,
      };

      console.log("=== DEBUG FORMULÁRIO CADASTRO2 DETALHADO ===");
      console.log("📧 Email:", formData.email.trim());
      console.log("🔐 Senha:", formData.senha ? "✓ Preenchida" : "❌ Vazia");
      console.log("📝 Campos preenchidos:", Object.keys(userData).length);
      console.log("📋 Dados completos:", userData);

      // Exibir loading mais cedo
      console.log("⏳ Chamando função signUp...");

      const result = await signUp(
        formData.email.trim(),
        formData.senha,
        userData
      );

      console.log("✅ Resultado do signUp recebido:", result);

      if (result.error) {
        console.error("❌ ERRO no cadastro:", result.error);
        setError(`❌ Erro no cadastro: ${result.error}`);

        // Scroll para mostrar o erro
        document
          .querySelector(".bg-red-50")
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        console.log("🎉 CADASTRO REALIZADO COM SUCESSO!");
        setSuccess(
          "✅ Cadastro completo realizado com sucesso! Verifique seu email para confirmar sua conta."
        );

        // Scroll para mostrar o sucesso
        document
          .querySelector(".bg-green-50")
          ?.scrollIntoView({ behavior: "smooth" });

        setTimeout(() => {
          console.log("🔄 Redirecionando para login...");
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("💥 ERRO CRÍTICO durante o cadastro:", error);
      setError(
        `💥 Erro crítico: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );

      // Scroll para mostrar o erro
      setTimeout(() => {
        document
          .querySelector(".bg-red-50")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
                🥋{" "}
                <span className="text-yellow-600 text-red-600">
                  JUDÔ SANDOKAN
                </span>{" "}
                - CADASTRO COMPLETO
              </h1>
              <p className="text-lg text-primary-800">
                ⚠️ <strong>ATENÇÃO:</strong> Todos os campos são obrigatórios
                neste formulário
              </p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  📝 Este é o formulário de cadastro completo onde nenhum campo
                  pode ficar em branco
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados Pessoais */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6 flex items-center">
                📋 Dados Pessoais{" "}
                <span className="text-red-500 ml-2">*Todos Obrigatórios*</span>
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
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Digite seu nome completo"
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
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="seu@email.com"
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
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Digite sua senha (mín. 6 caracteres)"
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
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Altura (cm) *
                  </label>
                  <input
                    type="number"
                    name="altura"
                    value={formData.altura}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="300"
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Ex: 170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="500"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Ex: 70.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Escolaridade *
                  </label>
                  <select
                    name="escolaridade"
                    value={formData.escolaridade}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                  >
                    <option value="">Selecione...</option>
                    <option value="fundamental-incompleto">
                      Ensino Fundamental Incompleto
                    </option>
                    <option value="fundamental-completo">
                      Ensino Fundamental Completo
                    </option>
                    <option value="medio-incompleto">
                      Ensino Médio Incompleto
                    </option>
                    <option value="medio-completo">
                      Ensino Médio Completo
                    </option>
                    <option value="superior-incompleto">
                      Ensino Superior Incompleto
                    </option>
                    <option value="superior-completo">
                      Ensino Superior Completo
                    </option>
                    <option value="pos-graduacao">Pós-graduação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Cor da Faixa Atual *
                  </label>
                  <div className="flex items-center space-x-3">
                    <select
                      name="corFaixa"
                      value={formData.corFaixa}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    >
                      <option value="">Escolha a cor da faixa</option>
                      {faixas.map((faixa) => (
                        <option key={faixa.nome} value={faixa.nome}>
                          {faixa.nome}
                        </option>
                      ))}
                    </select>
                    {formData.corFaixa && (
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <BeltIcon
                          color={formData.corFaixa}
                          size={28}
                          className="drop-shadow-sm mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {formData.corFaixa}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Escola *
                  </label>
                  <input
                    type="text"
                    name="escola"
                    value={formData.escola}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Nome da escola/dojo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Contato *
                  </label>
                  <input
                    type="tel"
                    name="contato"
                    value={formData.contato}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Endereço *
                  </label>
                  <textarea
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Rua, número, bairro, cidade, CEP"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6 flex items-center">
                <Icon
                  icon="iron:share"
                  width={32}
                  height={32}
                  className="mr-3 text-primary-950"
                />
                Redes Sociais{" "}
                <span className="text-red-500 ml-2">*Todas Obrigatórias*</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Instagram *
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="https://instagram.com/seu_usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Facebook *
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="https://facebook.com/seu_perfil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    TikTok *
                  </label>
                  <input
                    type="url"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="https://tiktok.com/@seu_usuario"
                  />
                </div>
              </div>
            </div>

            {/* Informações de Saúde */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6 flex items-center">
                <Icon
                  icon="iron:medical"
                  width={32}
                  height={32}
                  className="mr-3 text-primary-950"
                />
                Informações de Saúde{" "}
                <span className="text-red-500 ml-2">*Todas Obrigatórias*</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Tipo Sanguíneo *
                  </label>
                  <select
                    name="tipoSanguineo"
                    value={formData.tipoSanguineo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                  >
                    <option value="">Selecione...</option>
                    {tiposSanguineos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Toma algum remédio? *
                  </label>
                  <input
                    type="text"
                    name="tomaRemedio"
                    value={formData.tomaRemedio}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Se SIM, qual o nome | Se NÃO, digite 'Não'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Alérgico a algum remédio? *
                  </label>
                  <input
                    type="text"
                    name="alergicoRemedio"
                    value={formData.alergicoRemedio}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Se SIM, qual o nome | Se NÃO, digite 'Não'"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Responsável */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6 flex items-center">
                👨‍👩‍👧‍👦 Dados dos Pais ou Responsável{" "}
                <span className="text-red-500 ml-2">*Todos Obrigatórios*</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    name="nomeResponsavel"
                    value={formData.nomeResponsavel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Nome completo do responsável"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Endereço do Responsável *
                  </label>
                  <textarea
                    name="enderecoResponsavel"
                    value={formData.enderecoResponsavel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Rua, número, bairro, cidade, CEP"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    CPF do Responsável *
                  </label>
                  <input
                    type="text"
                    name="cpfResponsavel"
                    value={formData.cpfResponsavel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Contato do Responsável *
                  </label>
                  <input
                    type="tel"
                    name="contatoResponsavel"
                    value={formData.contatoResponsavel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Mensagens de Erro e Sucesso */}
            {(error || success) && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <Icon
                        icon="iron:warning"
                        width={20}
                        height={20}
                        className="text-red-600 mr-2"
                      />
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Icon
                        icon="iron:check"
                        width={20}
                        height={20}
                        className="text-green-600 mr-2"
                      />
                      <p className="text-green-800 font-medium">{success}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Termos e Condições */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6 flex items-center">
                📜 Termos e Condições
              </h2>

              <div className="flex items-start space-x-4 mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  id="aceitaTermos"
                  name="aceitaTermos"
                  checked={formData.aceitaTermos}
                  onChange={handleInputChange}
                  className="h-6 w-6 text-blue-600 bg-white border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2 mt-1 cursor-pointer checked:bg-blue-600 checked:border-blue-600 accent-blue-600"
                  required
                />
                <label
                  htmlFor="aceitaTermos"
                  className="text-base text-gray-900 cursor-pointer leading-relaxed"
                >
                  Li e aceito os{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 underline hover:text-blue-800 font-semibold"
                  >
                    Termos de Recebimento e Compromisso
                  </button>{" "}
                  do Projeto Judô Sandokan *
                </label>
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading || !formData.aceitaTermos}
                  className={`px-12 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl ${
                    loading || !formData.aceitaTermos
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processando Cadastro Completo...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Icon
                        icon="iron:check"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      ✅ Finalizar Cadastro Completo
                    </div>
                  )}
                </button>
                <p className="mt-4 text-sm text-primary-700">
                  {!formData.aceitaTermos
                    ? "Você deve aceitar os termos para finalizar a inscrição"
                    : "Clique para finalizar seu cadastro completo no dojo"}
                </p>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium text-sm">
                    ⚠️ Lembre-se: Todos os campos devem estar preenchidos!
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal dos Termos */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowTermsModal(false)}
              ></div>

              {/* Modal */}
              <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-2xl leading-6 font-bold text-primary-950 mb-4">
                        TERMO DE RECEBIMENTO E COMPROMISSO – PROJETO JUDÔ
                        SANDOKAN
                      </h3>
                      <div className="text-center mb-4">
                        <p className="text-lg font-semibold text-primary-800">
                          Matupá - MT
                        </p>
                      </div>

                      <div className="max-h-96 overflow-y-auto text-sm text-gray-700 space-y-4 border rounded-lg p-4 bg-gray-50">
                        <p>
                          Eu, integrante do Dojô de Judô Sandokan – Matupá/MT,
                          declaro que recebi os seguintes materiais destinados à
                          prática da modalidade:
                        </p>

                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>
                            <strong>01 (um) Kimono Reforçado</strong>, cor
                            branca, personalizado (frente e verso) com logotipos
                            coloridos dos patrocinadores;
                          </li>
                          <li>
                            <strong>01 (uma) Camiseta 100% algodão</strong>, com
                            estampas do projeto e patrocinadores;
                          </li>
                          <li>
                            <strong>01 (uma) Mochila de Nylon</strong>,
                            destinada ao transporte do Judogui (Kimono).
                          </li>
                        </ul>

                        <p>
                          Declaro ainda estar ciente de que, ao participar deste
                          importante projeto social, assumo – juntamente com
                          meus responsáveis, quando for o caso – o{" "}
                          <strong>
                            compromisso de seguir todas as normas e orientações
                            estabelecidas pelos professores e educadores do
                            projeto
                          </strong>
                          .
                        </p>

                        <p className="font-semibold text-primary-950">
                          Fica informado que:
                        </p>

                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>
                            O judoca que não cumprir as determinações
                            pré-estabelecidas receberá uma{" "}
                            <strong>advertência verbal</strong>.
                          </li>
                          <li>
                            Em caso de reincidência, deverá{" "}
                            <strong>
                              devolver os materiais recebidos e será desligado
                              do projeto
                            </strong>
                            .
                          </li>
                          <li>
                            O judoca é{" "}
                            <strong>
                              responsável pelo uso e conservação do material
                              recebido
                            </strong>
                            .
                          </li>
                          <li>
                            Caso o material seja danificado ou não seja
                            devolvido, o responsável legal (ou o próprio judoca,
                            se maior de idade) deverá{" "}
                            <strong>ressarcir o valor de R$ 350,00</strong>,
                            correspondente ao custo dos materiais.
                          </li>
                          <li>
                            Em caso de desligamento, outro judoca será convidado
                            a ocupar a vaga disponível.
                          </li>
                        </ul>

                        <p className="font-semibold text-primary-950 text-center mt-6">
                          Declaro estar de acordo com todos os termos acima
                          descritos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-950 text-base font-medium text-white hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
