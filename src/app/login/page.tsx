"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { signIn, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(), // Remove espaços em branco
    }));
    setError(""); // Limpa erro ao digitar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Garantir que os dados estão limpos
    const email = formData.email.trim();
    const senha = formData.senha.trim();

    if (!email || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const result = await signIn(email, senha);

      if (result.error) {
        setError(result.error);
      } else {
        // Redireciona para o dashboard
        router.push("/dashboard");
      }
    } catch {
      setError("Erro inesperado ao fazer login. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-primary-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary-950 rounded-full flex items-center justify-center">
                <Icon
                  icon="iron:lock"
                  width={40}
                  height={40}
                  className="text-white"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary-950 mb-2">
              <span className="text-yellow-600">Judô Sandokan</span>
            </h1>
            <p className="text-primary-700">
              Entre na sua conta para acessar o dojo
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <Icon
                    icon="iron:warning"
                    width={28}
                    height={28}
                    className="text-red-600 mr-3 mt-1 flex-shrink-0"
                  />
                  <p className="text-red-800 text-lg font-medium leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Icon
                  icon="iron:mail"
                  width={20}
                  height={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  spellCheck="false"
                  className="w-full pl-10 pr-4 py-4 rounded-lg border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-all duration-200 bg-white"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Senha
              </label>
              <div className="relative">
                <Icon
                  icon="iron:lock"
                  width={20}
                  height={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  spellCheck="false"
                  className="w-full pl-10 pr-12 py-4 rounded-lg border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-950 focus:border-primary-950 transition-all duration-200 bg-white"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-800 transition-colors focus:outline-none bg-white rounded-full w-8 h-8 flex items-center justify-center"
                  tabIndex={-1}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <Icon icon="mdi:eye-off" width={18} height={18} />
                  ) : (
                    <Icon icon="mdi:eye" width={18} height={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Link Esqueceu Senha */}
            <div className="text-right">
              <Link
                href="/recuperar-senha"
                className="text-sm text-primary-700 hover:text-primary-950 font-medium transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Botão Login */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-primary-950 hover:bg-primary-900 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {authLoading ? (
                <>
                  <Icon
                    icon="iron:refresh"
                    width={24}
                    height={24}
                    className="mr-2 animate-spin"
                  />
                  Entrando...
                </>
              ) : (
                <>
                  <Icon
                    icon="iron:login"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-primary-700">
              Não tem uma conta?{" "}
              <Link
                href="/cadastro"
                className="text-primary-950 hover:text-primary-800 font-semibold transition-colors"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>

        {/* Link Voltar */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-primary-800 hover:text-primary-950 font-medium transition-colors flex items-center justify-center"
          >
            <Icon
              icon="iron:arrow-left"
              width={20}
              height={20}
              className="mr-2"
            />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
