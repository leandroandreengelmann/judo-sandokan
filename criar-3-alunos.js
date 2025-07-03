const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl = "https://bpgeajkwscgicaebihbl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZ2Vhamt3c2NnaWNhZWJpaGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODE4NzAsImV4cCI6MjA2NTg1Nzg3MH0.xcBNE58hbqA2HFpA_z8hoXaWgUzxMyu1Fhs9fP8i23Q";

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados dos 3 alunos
const alunos = [
  {
    email: "andre.silva@judo.com.br",
    nome: "André Silva",
    dadosCompletos: {
      nome_completo: "André Silva",
      data_nascimento: "1995-05-15",
      altura: 175,
      peso: 78.5,
      escolaridade: "Superior",
      cor_faixa: "azul",
      escola: "EMEF José de Alencar",
      contato: "(65) 99111-2222",
      endereco: "Rua das Palmeiras 123, Centro, Matupá-MT",
      instagram: "@andre_judo",
      facebook: "André Silva Judô",
      tiktok: "@andre_judo_mt",
      tipo_sanguineo: "O+",
      toma_remedio: "Não",
      alergico_remedio: "Não",
      nome_responsavel: "",
      endereco_responsavel: "",
      cpf_responsavel: "",
      contato_responsavel: "",
    },
  },
  {
    email: "beatriz.santos@judo.com.br",
    nome: "Beatriz Santos",
    dadosCompletos: {
      nome_completo: "Beatriz Santos",
      data_nascimento: "1998-08-22",
      altura: 165,
      peso: 62.0,
      escolaridade: "Médio",
      cor_faixa: "verde",
      escola: "Colégio São Paulo",
      contato: "(65) 99333-4444",
      endereco: "Avenida Brasil 456, Jardim Primavera, Matupá-MT",
      instagram: "@bia_judo",
      facebook: "Beatriz Santos",
      tiktok: "@bia_judo_oficial",
      tipo_sanguineo: "A+",
      toma_remedio: "Sim - Vitamina D",
      alergico_remedio: "Não",
      nome_responsavel: "",
      endereco_responsavel: "",
      cpf_responsavel: "",
      contato_responsavel: "",
    },
  },
  {
    email: "carlos.pereira@judo.com.br",
    nome: "Carlos Pereira",
    dadosCompletos: {
      nome_completo: "Carlos Pereira",
      data_nascimento: "1992-11-10",
      altura: 180,
      peso: 85.0,
      escolaridade: "Fundamental",
      cor_faixa: "amarela",
      escola: "Instituto Federal",
      contato: "(65) 99555-6666",
      endereco: "Rua Mato Grosso 789, Vila Nova, Matupá-MT",
      instagram: "@carlos_judo_mt",
      facebook: "Carlos Pereira Judô",
      tiktok: "@carlos_judoka",
      tipo_sanguineo: "B+",
      toma_remedio: "Não",
      alergico_remedio: "Sim - Penicilina",
      nome_responsavel: "",
      endereco_responsavel: "",
      cpf_responsavel: "",
      contato_responsavel: "",
    },
  },
];

async function criarAlunos() {
  console.log("🥋 CRIANDO 3 ALUNOS NO SISTEMA JUDÔ");
  console.log("====================================\n");

  for (let i = 0; i < alunos.length; i++) {
    const aluno = alunos[i];
    console.log(`\n${i + 1}. Criando aluno: ${aluno.nome}`);
    console.log(`   Email: ${aluno.email}`);

    try {
      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: aluno.email,
        password: "senha123456", // Senha padrão para teste
        options: {
          emailRedirectTo: undefined,
          data: {
            nome_completo: aluno.nome,
            email_confirm: false,
          },
        },
      });

      if (authError) {
        console.error(`❌ Erro ao criar usuário: ${authError.message}`);

        // Se for rate limit, aguardar um pouco
        if (authError.message.includes("rate limit")) {
          console.log("⏰ Aguardando 3 segundos devido ao rate limit...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        continue;
      }

      console.log(`✅ Usuário criado com ID: ${authData.user?.id}`);

      // 2. Aguardar trigger criar perfil básico
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Atualizar perfil com dados completos
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update(aluno.dadosCompletos)
        .eq("id", authData.user.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar perfil: ${updateError.message}`);
      } else {
        console.log("✅ Perfil atualizado com dados completos!");
      }
    } catch (error) {
      console.error(`❌ Erro geral: ${error.message}`);
    }
  }

  console.log("\n🎉 PROCESSO CONCLUÍDO!");
  console.log("====================================");
  console.log("📝 Resumo:");
  console.log("- 3 alunos foram criados no sistema");
  console.log("- Senha padrão: senha123456");
  console.log("- Status: Aguardando aprovação");
}

// Executar
criarAlunos();
