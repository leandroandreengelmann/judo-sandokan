"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TesteSupabasePage() {
  const [resultado, setResultado] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testarConexao = async () => {
    setLoading(true);
    setResultado("");

    try {
      // Teste 1: Verificar configuração
      const config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseExists: !!supabase,
      };

      setResultado(
        (prev) =>
          prev + "📌 Configuração:\n" + JSON.stringify(config, null, 2) + "\n\n"
      );

      // Teste 2: Listar perfis
      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, email, nome_completo")
        .limit(3);

      if (profileError) {
        setResultado(
          (prev) =>
            prev + "❌ Erro ao listar perfis: " + profileError.message + "\n\n"
        );
      } else {
        setResultado(
          (prev) => prev + `✅ ${profiles?.length || 0} perfis encontrados\n\n`
        );
      }

      // Teste 3: Criar usuário teste
      const testEmail = `teste.pagina.${Date.now()}@exemplo.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: "senha123456",
        options: {
          emailRedirectTo: undefined,
          data: {
            nome_completo: "Teste Página",
            email_confirm: false,
          },
        },
      });

      if (authError) {
        setResultado(
          (prev) =>
            prev + "❌ Erro ao criar usuário: " + authError.message + "\n\n"
        );
      } else {
        setResultado(
          (prev) => prev + `✅ Usuário criado! ID: ${authData.user?.id}\n\n`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setResultado((prev) => prev + "❌ Erro geral: " + errorMessage + "\n\n");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste de Conexão Supabase</h1>

        <button
          onClick={testarConexao}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 mb-8"
        >
          {loading ? "Testando..." : "Testar Conexão"}
        </button>

        {resultado && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Resultado:</h2>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {resultado}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
