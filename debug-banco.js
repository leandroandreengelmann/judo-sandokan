const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas");
  console.log(
    "NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? "Configurada" : "Não configurada"
  );
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseKey ? "Configurada" : "Não configurada"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarBanco() {
  console.log("🔍 Testando conexão com o banco...");

  try {
    // 1. Testar conexão básica
    console.log("\n1. Testando conexão...");
    const {
      data: usuarios,
      error: userError,
      count,
    } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact" })
      .limit(1);

    if (userError) {
      console.error("❌ Erro de conexão:", userError.message);
      return;
    }

    console.log("✅ Conexão estabelecida");
    console.log(`📊 Total de usuários: ${count || 0}`);

    // 2. Verificar se há usuários
    console.log("\n2. Listando usuários...");
    const { data: todosUsuarios, error: allUsersError } = await supabase
      .from("user_profiles")
      .select("id, email, nome_completo, nivel_usuario, aprovado, created_at")
      .limit(10);

    if (allUsersError) {
      console.error("❌ Erro ao buscar usuários:", allUsersError.message);
      return;
    }

    if (todosUsuarios && todosUsuarios.length > 0) {
      console.log("✅ Usuários encontrados:");
      todosUsuarios.forEach((user, index) => {
        console.log(
          `  ${index + 1}. ${user.nome_completo || "Sem nome"} (${
            user.email
          }) - ${user.nivel_usuario} - ${
            user.aprovado ? "Aprovado" : "Pendente"
          }`
        );
      });
    } else {
      console.log("⚠️ Nenhum usuário encontrado - ESTE É O PROBLEMA!");
    }

    // 3. Verificar se a função RPC existe
    console.log("\n3. Testando função RPC...");
    const { error: rpcError } = await supabase.rpc("update_profile_on_signup", {
      user_id: "test-id",
      profile_data: { nome_completo: "Teste" },
    });

    if (rpcError) {
      if (
        rpcError.message.includes("function") &&
        rpcError.message.includes("does not exist")
      ) {
        console.log("❌ Função update_profile_on_signup NÃO EXISTE no banco");
        console.log("   Esta pode ser a causa dos problemas de cadastro!");
      } else {
        console.log(
          "⚠️ Erro na função RPC (esperado para teste):",
          rpcError.message
        );
      }
    } else {
      console.log("✅ Função RPC existe e respondeu");
    }

    // 4. Verificar faixas
    console.log("\n4. Verificando faixas...");
    const { data: faixas, error: faixasError } = await supabase
      .from("faixas")
      .select("nome, cor, ordem, ativo")
      .order("ordem");

    if (faixasError) {
      console.error("❌ Erro ao buscar faixas:", faixasError.message);
    } else if (faixas && faixas.length > 0) {
      console.log("✅ Faixas encontradas:");
      faixas.forEach((faixa) => {
        console.log(
          `  - ${faixa.nome} (${faixa.cor}) - ${
            faixa.ativo ? "Ativa" : "Inativa"
          }`
        );
      });
    } else {
      console.log("⚠️ Nenhuma faixa encontrada");
    }
  } catch (error) {
    console.error("❌ Erro inesperado:", error.message);
  }
}

// Testar cadastro simulado
async function testarCadastro() {
  console.log("\n🧪 Testando processo de cadastro...");

  const emailTeste = `teste${Date.now()}@gmail.com`;
  const senhaTeste = "senha123456";

  try {
    // 1. Testar signUp
    console.log("1. Testando signUp...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailTeste,
      password: senhaTeste,
    });

    if (authError) {
      console.error("❌ Erro no signUp:", authError.message);
      return;
    }

    console.log("✅ SignUp realizado, ID:", authData.user?.id);

    if (authData.user) {
      // 2. Aguardar trigger
      console.log("2. Aguardando trigger criar perfil básico...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. Verificar se perfil foi criado
      const { data: perfis, error: perfilError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authData.user.id);

      if (perfilError) {
        console.error("❌ Erro ao buscar perfil:", perfilError.message);
      } else if (perfis && perfis.length > 0) {
        console.log("✅ Perfil criado automaticamente:", perfis[0].email);
        console.log("   Nível:", perfis[0].nivel_usuario);
        console.log("   Aprovado:", perfis[0].aprovado);
      } else {
        console.log("❌ Perfil não foi criado automaticamente");
        console.log("   ESTE É PROVAVELMENTE O PROBLEMA PRINCIPAL!");
      }

      // 4. Limpar usuário de teste
      console.log("3. Limpando usuário de teste...");
      const { error: deleteError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", authData.user.id);

      if (deleteError) {
        console.log(
          "⚠️ Não foi possível limpar usuário de teste:",
          deleteError.message
        );
      } else {
        console.log("✅ Usuário de teste removido");
      }
    }
  } catch (error) {
    console.error("❌ Erro no teste de cadastro:", error.message);
  }
}

// Executar testes
async function main() {
  console.log("🚀 Iniciando diagnóstico do banco de dados...\n");

  await testarBanco();
  await testarCadastro();

  console.log("\n✅ Diagnóstico concluído!");
}

main().catch(console.error);
