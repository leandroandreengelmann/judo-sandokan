const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCriarConta() {
  console.log("🧪 TESTE DO NOVO FLUXO DE CADASTRO");
  console.log("=====================================");

  const testEmail = `teste.${Date.now()}@example.com`;
  const testPassword = "senha123456";

  console.log(`📧 Email de teste: ${testEmail}`);
  console.log(`🔐 Senha: ${testPassword}`);

  try {
    // 1. Criar usuário
    console.log("\n1️⃣ Criando usuário no auth.users...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined,
        data: {
          nome_completo: "Teste Usuario",
          email_confirm: false,
        },
      },
    });

    if (authError) {
      throw authError;
    }

    console.log("✅ Usuário criado com ID:", authData.user?.id);

    // 2. Verificar se trigger criou perfil
    console.log("\n2️⃣ Verificando se trigger criou perfil básico...");
    const { data: checkProfile, error: checkError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (checkError) {
      console.error("❌ Erro ao verificar perfil:", checkError);
    } else {
      console.log("✅ Perfil básico criado pelo trigger!");
      console.log("   - Email:", checkProfile.email);
      console.log("   - Nível:", checkProfile.nivel_usuario);
      console.log("   - Aprovado:", checkProfile.aprovado);
    }

    // 3. Atualizar perfil com dados completos
    console.log("\n3️⃣ Atualizando perfil com dados completos...");
    const userData = {
      nome_completo: "João Silva Teste",
      data_nascimento: "1990-01-01",
      altura: 175,
      peso: 75.5,
      escolaridade: "Ensino Médio Completo",
      cor_faixa: "Branca",
      escola: "Escola Teste",
      contato: "(11) 99999-9999",
      endereco: "Rua Teste, 123",
      instagram: "@teste",
      facebook: "teste.facebook",
      tiktok: "@teste.tiktok",
      tipo_sanguineo: "O+",
      toma_remedio: "Não",
      alergico_remedio: "Não",
      nome_responsavel: "",
      endereco_responsavel: "",
      cpf_responsavel: "",
      contato_responsavel: "",
    };

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update(userData)
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("❌ Erro ao atualizar perfil:", updateError);
    } else {
      console.log("✅ Perfil atualizado com sucesso!");
    }

    // 4. Verificar dados finais
    console.log("\n4️⃣ Verificando dados finais...");
    const { data: finalProfile, error: finalError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (finalError) {
      console.error("❌ Erro ao buscar perfil final:", finalError);
    } else {
      console.log("✅ Dados do perfil completo:");
      console.log("   - Nome:", finalProfile.nome_completo);
      console.log("   - Data Nascimento:", finalProfile.data_nascimento);
      console.log("   - Faixa:", finalProfile.cor_faixa);
      console.log("   - Escola:", finalProfile.escola);
    }

    console.log("\n🎉 TESTE CONCLUÍDO COM SUCESSO!");
    console.log("=====================================");
  } catch (error) {
    console.error("\n❌ ERRO NO TESTE:", error.message);
    if (error.status) {
      console.error("   Status:", error.status);
    }
    if (error.code) {
      console.error("   Código:", error.code);
    }
  }
}

// Executar teste
testCriarConta();
