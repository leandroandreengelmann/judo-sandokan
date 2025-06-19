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

export default function CadastroPage() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
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
    enderecoIgualResponsavel: false,

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
      setFormData((prev) => ({ ...prev, [name]: value.trim() })); // Remove espaços em branco
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Verificar se os termos foram aceitos
    if (!formData.aceitaTermos) {
      setError(
        "Você deve aceitar os termos e condições para prosseguir com o cadastro."
      );
      return;
    }

    try {
      // Preparar dados para o perfil do usuário
      const userData = {
        nome_completo: formData.nomeCompleto,
        data_nascimento: formData.dataNascimento,
        altura: parseInt(formData.altura) || undefined,
        peso: parseFloat(formData.peso) || undefined,
        escolaridade: formData.escolaridade,
        cor_faixa: formData.corFaixa,
        escola: formData.escola,
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

      const result = await signUp(formData.email, formData.senha, userData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(
          "Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta."
        );
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch {
      setError("Erro inesperado ao realizar cadastro. Tente novamente.");
    }
  };

  // Array removido - agora usando faixas do banco de dados

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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 pt-20">
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
                FICHA DE INSCRIÇÃO
              </h1>
              <p className="text-lg text-primary-800">
                Preencha todos os campos para se juntar ao nosso dojo
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
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
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Digite sua senha"
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
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
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
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Ex: 170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Ex: 70"
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
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="enderecoIgualResponsavel"
                      checked={formData.enderecoIgualResponsavel}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-950 border-primary-300 rounded"
                    />
                    <label className="ml-2 text-sm text-primary-900">
                      Mesmo endereço do responsável
                    </label>
                  </div>
                  {!formData.enderecoIgualResponsavel && (
                    <>
                      <label className="block text-sm font-medium text-primary-900 mb-2">
                        Endereço *
                      </label>
                      <textarea
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleInputChange}
                        required={!formData.enderecoIgualResponsavel}
                        className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                        placeholder="Rua, número, bairro, cidade, CEP"
                        rows={3}
                      />
                    </>
                  )}
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
                Redes Sociais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="https://instagram.com/seu_usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="https://facebook.com/seu_perfil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    TikTok
                  </label>
                  <input
                    type="url"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleInputChange}
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
                    Toma algum remédio?
                  </label>
                  <input
                    type="text"
                    name="tomaRemedio"
                    value={formData.tomaRemedio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Se SIM, qual o nome | Se NÃO, digite 'Não'"
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
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Se SIM, qual o nome | Se NÃO, digite 'Não'"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Responsável */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
              <h2 className="text-2xl font-semibold text-primary-950 mb-6 flex items-center">
                Dados dos Pais ou Responsável
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Nome do Responsável
                  </label>
                  <input
                    type="text"
                    name="nomeResponsavel"
                    value={formData.nomeResponsavel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Nome completo do responsável"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Endereço do Responsável
                  </label>
                  <textarea
                    name="enderecoResponsavel"
                    value={formData.enderecoResponsavel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
                    placeholder="Rua, número, bairro, cidade, CEP"
                    rows={3}
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
                    className="w-full px-4 py-3 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-colors"
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
                Termos e Condições
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
                      : "bg-primary-950 hover:bg-primary-900 text-white"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Icon
                        icon="iron:check"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      Finalizar Inscrição
                    </div>
                  )}
                </button>
                <p className="mt-4 text-sm text-primary-700">
                  {!formData.aceitaTermos
                    ? "Você deve aceitar os termos para finalizar a inscrição"
                    : "Clique para finalizar sua inscrição no dojo"}
                </p>
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
