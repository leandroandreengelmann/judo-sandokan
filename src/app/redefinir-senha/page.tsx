"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import ClientOnly from "@/components/ClientOnly";

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Verificar se há parâmetros de recuperação na URL
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // Definir a sessão do usuário com os tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Validações
      if (!senha.trim()) {
        setError("Por favor, digite uma nova senha.");
        return;
      }

      if (!confirmarSenha.trim()) {
        setError("Por favor, confirme sua nova senha.");
        return;
      }

      const passwordError = validatePassword(senha);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      if (senha !== confirmarSenha) {
        setError("As senhas não coincidem. Verifique e tente novamente.");
        return;
      }

      console.log("🔄 Atualizando senha...");

      // Atualizar senha no Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: senha,
      });

      if (updateError) {
        console.error("Erro ao atualizar senha:", updateError);

        if (updateError.message.includes("session_not_found")) {
          setError(
            "Link de recuperação expirado ou inválido. Solicite um novo link de recuperação."
          );
        } else if (updateError.message.includes("weak_password")) {
          setError("Senha muito fraca. Use uma senha mais forte.");
        } else {
          setError("Erro ao atualizar senha. Tente novamente.");
        }
        return;
      }

      console.log("✅ Senha atualizada com sucesso!");
      setMessage(
        "Senha redefinida com sucesso! Você será redirecionado para o login."
      );

      // Limpar campos
      setSenha("");
      setConfirmarSenha("");

      // Fazer logout para limpar a sessão
      await supabase.auth.signOut();

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push(
          "/login?message=Senha redefinida com sucesso! Faça login com sua nova senha."
        );
      }, 3000);
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
              <Icon
                icon="heroicons:lock-closed"
                className="h-6 w-6 text-primary-600"
              />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-primary-950">
              Redefinir Senha
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Digite sua nova senha abaixo
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

              {/* Campo Nova Senha */}
              <div>
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-primary-900 mb-2"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon
                      icon="heroicons:lock-closed"
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                  <input
                    id="senha"
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-primary-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Digite sua nova senha"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      icon={
                        showPassword ? "heroicons:eye-slash" : "heroicons:eye"
                      }
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo de 6 caracteres
                </p>
              </div>

              {/* Campo Confirmar Senha */}
              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="block text-sm font-medium text-primary-900 mb-2"
                >
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon
                      icon="heroicons:lock-closed"
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-primary-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Confirme sua nova senha"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      icon={
                        showConfirmPassword
                          ? "heroicons:eye-slash"
                          : "heroicons:eye"
                      }
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    />
                  </button>
                </div>
              </div>

              {/* Indicador de Força da Senha */}
              {senha && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">Força da senha:</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          senha.length >= level * 2
                            ? senha.length >= 8
                              ? "bg-green-500"
                              : senha.length >= 6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {senha.length < 6 && "Senha muito fraca"}
                    {senha.length >= 6 && senha.length < 8 && "Senha fraca"}
                    {senha.length >= 8 && "Senha forte"}
                  </div>
                </div>
              )}

              {/* Botão de Submit */}
              <div>
                <button
                  type="submit"
                  disabled={loading || !senha.trim() || !confirmarSenha.trim()}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Icon icon="heroicons:check" className="w-5 h-5 mr-2" />
                      Redefinir Senha
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Informações de Segurança */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <Icon
                icon="heroicons:shield-check"
                className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
              />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">Dicas de Segurança:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use uma senha única que você não usa em outros sites</li>
                  <li>Combine letras, números e símbolos</li>
                  <li>Evite informações pessoais óbvias</li>
                  <li>Considere usar um gerenciador de senhas</li>
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

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <RedefinirSenhaForm />
    </Suspense>
  );
}
