"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import ClientOnly from "@/components/ClientOnly";

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Validação básica
      if (!email.trim()) {
        setError("Por favor, digite seu email.");
        return;
      }

      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Por favor, digite um email válido.");
        return;
      }

      console.log("🔄 Enviando email de recuperação para:", email.trim());

      // Enviar email de recuperação usando Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        }
      );

      if (resetError) {
        console.error("Erro ao enviar email:", resetError);

        // Mensagens de erro mais amigáveis
        if (resetError.message.includes("rate limit")) {
          setError(
            "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."
          );
        } else if (resetError.message.includes("not found")) {
          setError(
            "Email não encontrado. Verifique se o email está correto ou crie uma conta."
          );
        } else {
          setError("Erro ao enviar email de recuperação. Tente novamente.");
        }
        return;
      }

      console.log("✅ Email de recuperação enviado com sucesso!");
      setMessage(
        "Email de recuperação enviado! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha."
      );

      // Limpar o campo de email
      setEmail("");
    } catch (error) {
      console.error("Erro inesperado:", error);
      setError("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Botão Voltar */}
          <div className="text-left">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 border border-primary-300 rounded-lg shadow-sm transition-colors duration-200 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
              Voltar ao Login
            </button>
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon icon="heroicons:key" className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-primary-950">
              Recuperar Senha
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Digite seu email para receber as instruções de recuperação
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mensagens */}
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <Icon
                    icon="heroicons:exclamation-circle"
                    className="w-5 h-5 mr-2 flex-shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center">
                  <Icon
                    icon="heroicons:check-circle"
                    className="w-5 h-5 mr-2 flex-shrink-0"
                  />
                  <span>{message}</span>
                </div>
              )}

              {/* Campo de Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-primary-900 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon
                      icon="heroicons:envelope"
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-primary-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Botão de Submit */}
              <div>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="heroicons:paper-airplane"
                        className="w-5 h-5 mr-2"
                      />
                      Enviar Email de Recuperação
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Links Adicionais */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Lembrou da senha?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Fazer Login
                </button>
              </p>

              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  onClick={() => router.push("/criar-conta")}
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Criar Conta
                </button>
              </p>
            </div>
          </div>

          {/* Informações de Ajuda */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Icon
                icon="heroicons:information-circle"
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Como funciona:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Digite seu email cadastrado no sistema</li>
                  <li>Você receberá um link de recuperação por email</li>
                  <li>Clique no link para redefinir sua senha</li>
                  <li>O link expira em 1 hora por segurança</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🥋 Dojô de Judô Sandokan - Matupá-MT
            </p>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
