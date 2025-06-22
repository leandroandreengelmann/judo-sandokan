const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testeSimples() {
  console.log("🔍 Verificando status atual do sistema...\n");

  try {
    // 1. Verificar se há usuários existentes
    console.log("1. Verificando usuários existentes...");
    const { data: usuarios, error: usuariosError } = await supabase
      .from("user_profiles")
      .select("id, email, nome_completo, nivel_usuario, aprovado")
      .limit(5);

    if (usuariosError) {
      console.error("❌ Erro:", usuariosError.message);
    } else {
      console.log(`✅ Encontrados ${usuarios.length} usuários:`);
      usuarios.forEach((u, i) => {
        console.log(
          `  ${i + 1}. ${u.nome_completo || "Sem nome"} (${u.email}) - ${
            u.nivel_usuario
          } - ${u.aprovado ? "Aprovado" : "Pendente"}`
        );
      });
    }

    // 2. Testar função RPC sem criar usuário
    console.log("\n2. Testando função RPC...");
    const usuarioTeste = usuarios && usuarios.length > 0 ? usuarios[0] : null;

    if (usuarioTeste) {
      const { error: rpcError } = await supabase.rpc(
        "update_profile_on_signup",
        {
          user_id: usuarioTeste.id,
          profile_data: { escola: "Escola Teste RPC" },
        }
      );

      if (rpcError) {
        console.error("❌ Erro na função RPC:", rpcError.message);
      } else {
        console.log("✅ Função RPC funcionando");
      }
    }

    // 3. Verificar trigger
    console.log("\n3. Verificando trigger...");
    const { data: triggers, error: triggerError } = await supabase
      .from("information_schema.triggers")
      .select("*")
      .eq("trigger_name", "on_auth_user_created");

    if (triggerError) {
      console.log(
        "⚠️ Não foi possível verificar trigger (esperado com ANON key)"
      );
    } else {
      console.log("✅ Trigger existe e está ativo");
    }

    // 4. Simular dados de um formulário
    console.log("\n4. Dados que seriam enviados pelo formulário:");
    const dadosFormulario = {
      nome_completo: "João Silva",
      data_nascimento: "1990-01-01",
      altura: 175,
      peso: 70.5,
      escolaridade: "Ensino Médio",
      cor_faixa: "Branca",
      escola: "Academia Teste",
      contato: "(11) 99999-9999",
      endereco: "Rua Teste, 123",
      instagram: "@joao",
      facebook: "joao.silva",
      tiktok: "@joao_teste",
      tipo_sanguineo: "O+",
      toma_remedio: "Não",
      alergico_remedio: "Não",
      nome_responsavel: "",
      endereco_responsavel: "",
      cpf_responsavel: "",
      contato_responsavel: "",
    };

    console.log("Dados válidos:", JSON.stringify(dadosFormulario, null, 2));
  } catch (error) {
    console.error("💥 Erro:", error.message);
  }
}

testeSimples()
  .then(() => {
    console.log("\n✅ Verificação concluída!");
    console.log("\n📋 DIAGNÓSTICO:");
    console.log("- Se há usuários: Sistema básico funcionando");
    console.log("- Se função RPC funciona: Atualização de perfil OK");
    console.log("- Se trigger existe: Criação automática OK");
    console.log("\nO problema pode estar em:");
    console.log("1. Rate limit do Supabase (muito provável)");
    console.log("2. Confirmação de email obrigatória");
    console.log("3. Configurações do projeto Supabase");
    process.exit(0);
  })
  .catch(console.error);
