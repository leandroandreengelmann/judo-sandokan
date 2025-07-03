const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Configuração do Supabase (usando as mesmas variáveis que o Next.js)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🌐 SIMULANDO CRIAÇÃO DE CONTA VIA WEB");
console.log("=====================================\n");

// Dados simulando o formulário web
const formData = {
  nomeCompleto: "Teste Web User",
  email: `teste.web.${Date.now()}@exemplo.com`,
  senha: "senha123456",
  dataNascimento: "1990-01-01",
  altura: "175",
  peso: "70.5",
  escolaridade: "Ensino Médio Completo",
  corFaixa: "Branca",
  escola: "Escola Teste Web",
  contato: "(11) 99999-8888",
  endereco: "Rua Web, 123",
  instagram: "@testeweb",
  facebook: "teste.web",
  tiktok: "@teste_web",
  tipoSanguineo: "O+",
  tomaRemedio: "Não",
  alergicoRemedio: "Não",
  nomeResponsavel: "",
  enderecoResponsavel: "",
  cpfResponsavel: "",
  contatoResponsavel: "",
};

async function simularCriacaoConta() {
  try {
    console.log("📝 Dados do formulário:");
    console.log(`- Nome: ${formData.nomeCompleto}`);
    console.log(`- Email: ${formData.email}`);
    console.log(`- Faixa: ${formData.corFaixa}`);

    // 1. Criar usuário (exatamente como o código da página)
    console.log("\n1️⃣ Criando usuário no auth.users...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.senha,
      options: {
        emailRedirectTo: undefined,
        data: {
          nome_completo: formData.nomeCompleto.trim(),
          email_confirm: false,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("rate limit")) {
        console.error("❌ Rate limit detectado!");
        console.log("⚠️  Aguarde alguns minutos antes de tentar novamente");
        return;
      }
      throw authError;
    }

    console.log(`✅ Usuário criado! ID: ${authData.user?.id}`);

    // 2. Aguardar trigger criar perfil básico
    console.log("\n2️⃣ Aguardando trigger criar perfil básico...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Atualizar perfil com dados completos
    console.log("3️⃣ Atualizando perfil com dados completos...");
    const userData = {
      nome_completo: formData.nomeCompleto.trim(),
      data_nascimento: formData.dataNascimento,
      altura: formData.altura ? parseInt(formData.altura) : null,
      peso: formData.peso ? parseFloat(formData.peso) : null,
      escolaridade: formData.escolaridade || "",
      cor_faixa: formData.corFaixa || "",
      escola: formData.escola?.trim() || "",
      contato: formData.contato || "",
      endereco: formData.endereco || "",
      instagram: formData.instagram || "",
      facebook: formData.facebook || "",
      tiktok: formData.tiktok || "",
      tipo_sanguineo: formData.tipoSanguineo || "",
      toma_remedio: formData.tomaRemedio || "",
      alergico_remedio: formData.alergicoRemedio || "",
      nome_responsavel: formData.nomeResponsavel || "",
      endereco_responsavel: formData.enderecoResponsavel || "",
      cpf_responsavel: formData.cpfResponsavel || "",
      contato_responsavel: formData.contatoResponsavel || "",
      nivel_usuario: "aluno",
      aprovado: false,
    };

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update(userData)
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("❌ Erro ao atualizar perfil:", profileError);

      // Tentar método RPC como fallback
      console.log("4️⃣ Tentando método RPC como fallback...");
      const { error: rpcError } = await supabase.rpc(
        "update_profile_on_signup",
        {
          user_id: authData.user.id,
          profile_data: userData,
        }
      );

      if (rpcError) {
        console.error("❌ Erro no RPC também:", rpcError);
        throw new Error("Erro ao salvar dados do perfil");
      }
    }

    console.log("✅ Perfil atualizado com sucesso!");

    // 4. Verificar dados finais
    console.log("\n5️⃣ Verificando dados salvos...");
    const { data: finalProfile, error: finalError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (finalError) {
      console.error("❌ Erro ao buscar perfil:", finalError);
    } else {
      console.log("\n✅ CONTA CRIADA COM SUCESSO!");
      console.log("📊 Dados salvos:");
      console.log(`- Nome: ${finalProfile.nome_completo}`);
      console.log(`- Email: ${finalProfile.email}`);
      console.log(`- Faixa: ${finalProfile.cor_faixa}`);
      console.log(`- Escola: ${finalProfile.escola}`);
      console.log(`- Aprovado: ${finalProfile.aprovado}`);
    }
  } catch (error) {
    console.error("\n❌ ERRO AO CRIAR CONTA:", error.message);
    console.error("Detalhes:", error);
  }
}

// Executar simulação
simularCriacaoConta();
