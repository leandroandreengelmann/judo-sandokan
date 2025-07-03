"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CriarContaAlternativaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    console.log(log);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${log}`]);
  };

  const testeCriarConta = async () => {
    setLoading(true);
    setMensagem("");
    setLogs([]);

    try {
      // 1. Verificar configuração
      addLog("🔍 Verificando configuração do Supabase...");
      const config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseClientExists: !!supabase,
      };
      addLog(`📌 Config: ${JSON.stringify(config)}`);

      // 2. Testar conexão básica
      addLog("🔗 Testando conexão com o banco...");
      try {
        const { error } = await supabase
          .from("user_profiles")
          .select("count")
          .limit(1);

        if (error) {
          addLog(`❌ Erro de conexão: ${error.message}`);
        } else {
          addLog("✅ Conexão com banco OK!");
        }
      } catch (connError) {
        addLog(`❌ Erro ao conectar: ${connError}`);
      }

      // 3. Tentar criar usuário
      addLog(`📧 Tentando criar usuário: ${email}`);

      // Método 1: Com Promise.race e timeout
      const signUpPromise = supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          emailRedirectTo: undefined,
          data: {
            nome_completo: nome.trim(),
            email_confirm: false,
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout após 15 segundos")), 15000);
      });

      addLog("⏳ Aguardando resposta (máx 15s)...");

      try {
        const result = await Promise.race([signUpPromise, timeoutPromise]);
        const { data: authData, error: authError } = result as {
          data: any;
          error: any;
        };

        if (authError) {
          addLog(`❌ Erro do Supabase: ${authError.message}`);
          setMensagem(`Erro: ${authError.message}`);
        } else if (authData?.user) {
          addLog(`✅ Usuário criado! ID: ${authData.user.id}`);
          setMensagem("Conta criada com sucesso!");

          // Redirecionar após 2 segundos
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          addLog("❓ Resposta sem erro mas sem usuário");
          setMensagem("Resposta inesperada do servidor");
        }
      } catch (timeoutError) {
        addLog("⏰ TIMEOUT - A requisição travou!");
        setMensagem(
          "A conexão travou. Possíveis causas: Firewall, VPN, ou problema de rede."
        );

        // Teste adicional de rede
        addLog("🌐 Testando conexão com a internet...");
        try {
          const response = await fetch("https://www.google.com", {
            mode: "no-cors",
          });
          addLog("✅ Internet funcionando");
        } catch {
          addLog("❌ Problema de conexão com a internet");
        }
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Erro desconhecido";
      addLog(`❌ Erro geral: ${errorMsg}`);
      setMensagem(`Erro: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 pt-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          🧪 Teste de Criação de Conta
        </h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button
              onClick={testeCriarConta}
              disabled={loading || !email || !senha || !nome}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Testando..." : "Testar Criação de Conta"}
            </button>
          </div>

          {mensagem && (
            <div
              className={`mt-4 p-3 rounded ${
                mensagem.includes("Erro")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {mensagem}
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <h3 className="text-white font-bold mb-2">📋 Logs de Debug:</h3>
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/criar-conta")}
            className="text-blue-500 hover:underline"
          >
            Voltar para página original
          </button>
        </div>
      </div>
    </div>
  );
}
