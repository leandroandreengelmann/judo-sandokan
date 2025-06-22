const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarCadastroCompleto() {
  console.log("🚀 Testando processo completo de cadastro...\n");

  const emailTeste = `teste${Date.now()}@gmail.com`;
  const senhaTeste = "senha123456";
  const dadosUsuario = {
    nome_completo: "João Silva Teste",
    data_nascimento: "1990-01-01",
    altura: 175,
    peso: 70.5,
    escolaridade: "Ensino Médio",
    cor_faixa: "Branca",
    escola: "Escola Teste",
    contato: "(11) 99999-9999",
    endereco: "Rua Teste, 123",
    instagram: "@joao_teste",
    facebook: "joao.teste",
    tiktok: "@joao_teste",
    tipo_sanguineo: "O+",
    toma_remedio: "Não",
    alergico_remedio: "Não",
    nome_responsavel: "Maria Silva",
    endereco_responsavel: "Rua Responsavel, 456",
    cpf_responsavel: "123.456.789-00",
    contato_responsavel: "(11) 88888-8888",
  };

  try {
    // PASSO 1: Criar usuário na autenticação
    console.log("📝 PASSO 1: Criando usuário na autenticação...");
    console.log(`Email: ${emailTeste}`);
    console.log(`Senha: ${senhaTeste}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailTeste,
      password: senhaTeste,
    });

    if (authError) {
      console.error("❌ Erro na autenticação:", authError.message);
      return;
    }

    if (!authData.user) {
      console.error("❌ Usuário não foi criado");
      return;
    }

    console.log("✅ Usuário criado na autenticação");
    console.log(`ID: ${authData.user.id}`);

    // PASSO 2: Aguardar trigger criar perfil
    console.log("\n⏳ PASSO 2: Aguardando trigger criar perfil básico...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // PASSO 3: Verificar se perfil foi criado automaticamente
    console.log("🔍 PASSO 3: Verificando se perfil foi criado...");
    const { data: perfilBasico, error: perfilError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id);

    if (perfilError) {
      console.error("❌ Erro ao buscar perfil:", perfilError.message);
      return;
    }

    if (!perfilBasico || perfilBasico.length === 0) {
      console.error("❌ PROBLEMA: Perfil básico não foi criado pelo trigger!");
      console.log("   O trigger não está funcionando corretamente.");
      return;
    }

    console.log("✅ Perfil básico criado pelo trigger");
    console.log("Dados básicos:", {
      id: perfilBasico[0].id,
      email: perfilBasico[0].email,
      nivel_usuario: perfilBasico[0].nivel_usuario,
      aprovado: perfilBasico[0].aprovado,
    });

    // PASSO 4: Atualizar perfil com dados completos
    console.log("\n📋 PASSO 4: Atualizando perfil com dados completos...");
    console.log("Dados para atualização:", dadosUsuario);

    const { error: updateError } = await supabase.rpc(
      "update_profile_on_signup",
      {
        user_id: authData.user.id,
        profile_data: dadosUsuario,
      }
    );

    if (updateError) {
      console.error("❌ Erro ao atualizar perfil:", updateError.message);
      console.error("Detalhes:", updateError);
      return;
    }

    console.log("✅ Perfil atualizado com sucesso");

    // PASSO 5: Verificar dados finais
    console.log("\n🔍 PASSO 5: Verificando dados finais...");
    const { data: perfilFinal, error: finalError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (finalError) {
      console.error("❌ Erro ao buscar perfil final:", finalError.message);
      return;
    }

    console.log("✅ CADASTRO COMPLETADO COM SUCESSO!");
    console.log("\n📊 DADOS FINAIS DO USUÁRIO:");
    console.log("ID:", perfilFinal.id);
    console.log("Email:", perfilFinal.email);
    console.log("Nome:", perfilFinal.nome_completo);
    console.log("Data Nascimento:", perfilFinal.data_nascimento);
    console.log("Altura:", perfilFinal.altura);
    console.log("Peso:", perfilFinal.peso);
    console.log("Escola:", perfilFinal.escola);
    console.log("Contato:", perfilFinal.contato);
    console.log("Endereço:", perfilFinal.endereco);
    console.log("Cor da Faixa:", perfilFinal.cor_faixa);
    console.log("Nível:", perfilFinal.nivel_usuario);
    console.log("Aprovado:", perfilFinal.aprovado);

    // PASSO 6: Limpar usuário de teste
    console.log("\n🧹 PASSO 6: Limpando usuário de teste...");
    const { error: deleteError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", authData.user.id);

    if (deleteError) {
      console.log("⚠️ Erro ao limpar usuário de teste:", deleteError.message);
    } else {
      console.log("✅ Usuário de teste removido");
    }
  } catch (error) {
    console.error("💥 Erro inesperado:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Executar teste
testarCadastroCompleto()
  .then(() => {
    console.log("\n🏁 Teste concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erro fatal:", error);
    process.exit(1);
  });
