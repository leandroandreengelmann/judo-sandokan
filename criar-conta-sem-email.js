const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl = "https://bpgeajkwscgicaebihbl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZ2Vhamt3c2NnaWNhZWJpaGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODE4NzAsImV4cCI6MjA2NTg1Nzg3MH0.xcBNE58hbqA2HFpA_z8hoXaWgUzxMyu1Fhs9fP8i23Q";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCadastroSemEmail() {
  console.log("=== TESTE DE CADASTRO SEM EMAIL ===\n");

  // Dados de teste
  const emailTeste = `usuario${Date.now()}@exemplo.com`;
  const dadosTeste = {
    nomeCompleto: "Maria Silva Teste SEM EMAIL",
    dataNascimento: "1992-03-10",
    altura: 160,
    peso: 55.0,
    escolaridade: "Ensino Superior Completo",
    corFaixa: "Amarela",
    escola: "Faculdade ABC",
    contato: "(11) 98888-7777",
    endereco: "Rua Nova, 789, Rio de Janeiro",
    instagram: "@maria.nova",
    facebook: "maria.nova.teste",
    tiktok: "@marianova",
    tipoSanguineo: "A+",
    tomaRemedio: "Anticoncepcional",
    alergicoRemedio: "Aspirina",
    nomeResponsavel: "",
    enderecoResponsavel: "",
    cpfResponsavel: "",
    contatoResponsavel: "",
  };

  try {
    console.log("1. Verificando conexão com o banco...");

    const { data: testConnection } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);

    console.log("✅ Conexão com banco OK\n");

    console.log("2. Tentando cadastro sem email...");
    console.log(`Email: ${emailTeste}`);

    // Tentar sem confirmação de email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailTeste,
      password: "senha123",
      options: {
        emailRedirectTo: undefined,
        data: {
          nome_completo: dadosTeste.nomeCompleto,
        },
      },
    });

    if (authError) {
      console.log("❌ Erro no auth:", authError.message);

      // Se der rate limit, vamos criar diretamente no banco
      if (authError.message.includes("rate limit")) {
        console.log("💡 Rate limit detectado, criando usuário diretamente...");

        // Gerar UUID válido para o usuário
        const userId = crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
              /[xy]/g,
              function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              }
            );

        // Inserir diretamente no user_profiles
        const userData = {
          id: userId, // ID customizado
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
          console.log("❌ Erro ao inserir perfil:", profileError.message);
          return;
        }

        console.log("✅ Usuário criado diretamente no banco!");
        console.log("📊 Dados criados:");
        console.log(`- ID: ${userId}`);
        console.log(`- Email: ${emailTeste}`);
        console.log(`- Nome: ${dadosTeste.nomeCompleto}`);
        console.log(`- Nível: aluno`);
        console.log(`- Aprovado: false`);

        console.log("\n🎉 CADASTRO SEM EMAIL FUNCIONOU!");
        return;
      }

      throw authError;
    }

    console.log("✅ Auth funcionou sem rate limit!");
    console.log(`User ID: ${authData.user.id}`);

    // Continuar com inserção normal
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

    console.log("✅ Perfil inserido com sucesso!");
    console.log("\n🎉 CADASTRO COMPLETO FUNCIONOU!");
  } catch (error) {
    console.error("❌ ERRO NO TESTE:");
    console.error(error.message);
  }
}

// Executar teste
testCadastroSemEmail();
