const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateProfile() {
  console.log("🧪 Testando atualização de perfil...\n");

  try {
    // 1. Criar um usuário temporário para testar
    console.log("1. Criando usuário temporário...");
    const emailTeste = `teste${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailTeste,
      password: "senha123456",
    });

    if (authError) {
      // Se der erro de rate limit, usar um usuário existente
      if (authError.message.includes("rate limit")) {
        console.log("⚠️ Rate limit atingido, vamos usar query direta...");
        await testUpdateWithoutAuth();
        return;
      }
      console.error("❌ Erro ao criar usuário:", authError.message);
      return;
    }

    console.log("✅ Usuário criado:", authData.user?.id);

    // 2. Aguardar criação do perfil
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Testar diferentes tipos de update que podem causar erro 400
    console.log("\n2. Testando updates que podem causar erro 400...");

    const testCases = [
      {
        name: "Campos vazios",
        data: { nome_completo: "", altura: "", peso: "" },
      },
      {
        name: "Campos com valores inválidos",
        data: { altura: "abc", peso: "xyz", anos_experiencia: "não é número" },
      },
      {
        name: "Campos numéricos como zero",
        data: { altura: "0", peso: "0" },
      },
      {
        name: "Campos com espaços",
        data: { nome_completo: "   ", contato: "  " },
      },
      {
        name: "Update válido",
        data: { nome_completo: "Teste Update", altura: "175", peso: "70.5" },
      },
    ];

    for (const testCase of testCases) {
      console.log(`\n🔬 Testando: ${testCase.name}`);
      console.log("📋 Dados:", testCase.data);

      const { error } = await supabase
        .from("user_profiles")
        .update(testCase.data)
        .eq("id", authData.user.id);

      if (error) {
        console.error(`❌ Erro (${error.code}):`, error.message);
        if (error.details) console.error("   Detalhes:", error.details);
        if (error.hint) console.error("   Dica:", error.hint);
      } else {
        console.log("✅ Update realizado com sucesso");
      }
    }

    // 4. Limpar usuário de teste
    console.log("\n3. Limpando usuário de teste...");
    await supabase.from("user_profiles").delete().eq("id", authData.user.id);
    console.log("✅ Usuário removido");
  } catch (error) {
    console.error("❌ Erro inesperado:", error.message);
  }
}

async function testUpdateWithoutAuth() {
  console.log("🔬 Testando updates sem autenticação...");

  // Testar um update genérico que deve falhar por RLS
  const { error } = await supabase
    .from("user_profiles")
    .update({ nome_completo: "Teste" })
    .eq("email", "teste@test.com");

  if (error) {
    console.log("❌ Erro esperado (RLS):", error.message);
    console.log("   Código:", error.code);

    // Verificar se é erro 400 ou relacionado a RLS
    if (error.code === "42501" || error.message.includes("RLS")) {
      console.log("✅ Este é um erro de RLS/permissão, não erro 400 de dados");
    } else if (error.code === "23505") {
      console.log("✅ Este é um erro de constraint/duplicação");
    } else {
      console.log("⚠️ Erro diferente:", error.code, error.message);
    }
  }
}

testUpdateProfile().catch(console.error);
