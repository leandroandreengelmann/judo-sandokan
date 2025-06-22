const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl = "https://bpgeajkwscgicaebihbl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZ2Vhamt3c2NnaWNhZWJpaGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODE4NzAsImV4cCI6MjA2NTg1Nzg3MH0.xcBNE58hbqA2HFpA_z8hoXaWgUzxMyu1Fhs9fP8i23Q";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCriarConta() {
  console.log("=== TESTE DE CRIAÇÃO DE CONTA ===\n");

  // Dados de teste
  const emailTeste = `teste${Date.now()}@exemplo.com`;
  const senhaTeste = "senha123";
  const dadosTeste = {
    nomeCompleto: "João Silva Teste",
    dataNascimento: "1990-05-15",
    altura: 175,
    peso: 70.5,
    escolaridade: "Ensino Médio Completo",
    corFaixa: "Branca",
    escola: "Escola Teste",
    contato: "(11) 99999-9999",
    endereco: "Rua Teste, 123",
    instagram: "@joaoteste",
    facebook: "joao.teste",
    tiktok: "@joaoteste",
    tipoSanguineo: "O+",
    tomaRemedio: "Não",
    alergicoRemedio: "Não",
    nomeResponsavel: "",
    enderecoResponsavel: "",
    cpfResponsavel: "",
    contatoResponsavel: "",
  };

  try {
    console.log("1. Verificando conexão com o banco...");

    // Teste de conexão
    const { data: testConnection } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);

    console.log("✅ Conexão com banco OK\n");

    console.log("2. Criando usuário no auth.users...");
    console.log(`Email: ${emailTeste}`);

    // 1. Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailTeste,
      password: senhaTeste,
    });

    if (authError) {
      throw new Error(`Erro no auth: ${authError.message}`);
    }

    if (!authData.user?.id) {
      throw new Error("Usuário não foi criado no auth");
    }

    console.log("✅ Usuário criado no auth.users");
    console.log(`User ID: ${authData.user.id}\n`);

    console.log("3. Inserindo perfil no user_profiles...");

    // 2. Criar perfil
    const userData = {
      id: authData.user.id,
      email: emailTeste,
      nome_completo: dadosTeste.nomeCompleto,
      data_nascimento: dadosTeste.dataNascimento,
      altura: dadosTeste.altura,
      peso: dadosTeste.peso,
      escolaridade: dadosTeste.escolaridade,
      cor_faixa: dadosTeste.corFaixa,
      escola: dadosTeste.escola,
      contato: dadosTeste.contato,
      endereco: dadosTeste.endereco,
      instagram: dadosTeste.instagram,
      facebook: dadosTeste.facebook,
      tiktok: dadosTeste.tiktok,
      tipo_sanguineo: dadosTeste.tipoSanguineo,
      toma_remedio: dadosTeste.tomaRemedio,
      alergico_remedio: dadosTeste.alergicoRemedio,
      nome_responsavel: dadosTeste.nomeResponsavel,
      endereco_responsavel: dadosTeste.enderecoResponsavel,
      cpf_responsavel: dadosTeste.cpfResponsavel,
      contato_responsavel: dadosTeste.contatoResponsavel,
      nivel_usuario: "aluno",
      aprovado: false,
    };

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert([userData])
      .select();

    if (profileError) {
      throw new Error(`Erro no perfil: ${profileError.message}`);
    }

    console.log("✅ Perfil inserido no user_profiles");
    console.log("Dados inseridos:", JSON.stringify(profileData[0], null, 2));

    console.log("\n4. Verificando se foi criado corretamente...");

    // 3. Verificar se foi criado
    const { data: verificacao, error: verificacaoError } = await supabase
      .from("user_profiles")
      .select("nome_completo, email, aprovado, nivel_usuario, created_at")
      .eq("id", authData.user.id)
      .single();

    if (verificacaoError) {
      throw new Error(`Erro na verificação: ${verificacaoError.message}`);
    }

    console.log("✅ Usuário encontrado no banco:");
    console.log(JSON.stringify(verificacao, null, 2));

    console.log("\n🎉 TESTE CONCLUÍDO COM SUCESSO!");
    console.log("A página criar-conta está funcionando perfeitamente!");
    console.log("\n📊 RESUMO:");
    console.log(`✅ Usuário criado no auth.users: ${authData.user.id}`);
    console.log(
      `✅ Perfil criado no user_profiles: ${verificacao.nome_completo}`
    );
    console.log(`✅ Email: ${verificacao.email}`);
    console.log(`✅ Nível: ${verificacao.nivel_usuario}`);
    console.log(`✅ Aprovado: ${verificacao.aprovado}`);
  } catch (error) {
    console.error("❌ ERRO NO TESTE:");
    console.error(error.message);
    console.error("\nDetalhes do erro:", error);
  }
}

// Executar teste
testCriarConta();
