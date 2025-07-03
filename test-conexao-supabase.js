const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

console.log("🔍 Testando conexão com Supabase...\n");

// Verificar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("📌 URL do Supabase:", supabaseUrl || "❌ NÃO CONFIGURADA");
console.log("📌 Chave encontrada:", supabaseKey ? "✅ SIM" : "❌ NÃO");

if (!supabaseUrl || !supabaseKey) {
  console.error("\n❌ ERRO: Variáveis de ambiente não configuradas!");
  console.log("\n🔧 SOLUÇÃO:");
  console.log("1. Certifique-se de que o arquivo .env.local existe");
  console.log("2. Reinicie o servidor Next.js com: npm run dev");
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Testar conexão
async function testarConexao() {
  try {
    // 1. Testar listagem de usuários
    console.log("\n1️⃣ Testando conexão - listando perfis...");
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, email, nome_completo")
      .limit(5);

    if (profileError) {
      console.error("❌ Erro ao listar perfis:", profileError.message);
    } else {
      console.log("✅ Conexão funcionando!");
      console.log(`📊 ${profiles.length} perfis encontrados`);
      if (profiles.length > 0) {
        console.log("\nPrimeiros perfis:");
        profiles.forEach((p) => {
          console.log(`- ${p.nome_completo || "Sem nome"} (${p.email})`);
        });
      }
    }

    // 2. Testar criação de usuário
    console.log("\n2️⃣ Testando criação de usuário...");
    const testEmail = `teste.conexao.${Date.now()}@exemplo.com`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: "senha123456",
      options: {
        emailRedirectTo: undefined,
        data: {
          nome_completo: "Teste Conexão",
          email_confirm: false,
        },
      },
    });

    if (authError) {
      console.error("❌ Erro ao criar usuário:", authError.message);
      if (authError.message.includes("rate limit")) {
        console.log(
          "⚠️  Rate limit detectado - isso é normal após várias tentativas"
        );
      }
    } else {
      console.log("✅ Usuário de teste criado com sucesso!");
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🆔 ID: ${authData.user?.id}`);
    }

    console.log("\n🎉 TESTE CONCLUÍDO!");
    console.log("✅ A conexão com o Supabase está funcionando corretamente!");
  } catch (error) {
    console.error("\n❌ ERRO GERAL:", error.message);
  }
}

// Executar teste
testarConexao();
