import { supabase } from "../lib/supabase";

async function createMasterAccount() {
  try {
    console.log("🔑 Criando conta do mestre admin...");

    // Criar usuário via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: "leandroandreengelmann@gmail.com",
      password: "mestre123",
    });

    if (error) {
      console.error("❌ Erro ao criar usuário:", error.message);
      return;
    }

    if (data.user) {
      console.log("✅ Usuário criado com ID:", data.user.id);

      // Atualizar o perfil para ser mestre aprovado
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          nome_completo: "Mestre Admin",
          nivel_usuario: "mestre",
          aprovado: true,
          data_aprovacao: new Date().toISOString(),
        })
        .eq("id", data.user.id);

      if (profileError) {
        console.error("❌ Erro ao atualizar perfil:", profileError.message);
        return;
      }

      console.log("🎉 Conta do mestre admin criada com sucesso!");
      console.log("📧 Email: leandroandreengelmann@gmail.com");
      console.log("🔒 Senha: mestre123");
    }
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  createMasterAccount();
}

export { createMasterAccount };
