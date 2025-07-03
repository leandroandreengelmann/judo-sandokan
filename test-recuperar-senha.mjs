import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não encontradas!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarRecuperarSenha() {
  console.log("🔄 Testando funcionalidade de recuperação de senha...\n");

  // Email de teste (use um dos alunos criados anteriormente)
  const emailTeste = "andre.silva@judo.com.br";

  try {
    console.log(`📧 Enviando email de recuperação para: ${emailTeste}`);

    // Enviar email de recuperação
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      emailTeste,
      {
        redirectTo: "http://localhost:3000/redefinir-senha",
      }
    );

    if (error) {
      console.error("❌ Erro ao enviar email:", error.message);
      return;
    }

    console.log("✅ Email de recuperação enviado com sucesso!");
    console.log("📋 Dados retornados:", data);

    console.log("\n📝 Instruções para teste:");
    console.log("1. Verifique o email do usuário teste");
    console.log("2. Clique no link de recuperação");
    console.log("3. Defina uma nova senha");
    console.log("4. Teste o login com a nova senha");
  } catch (error) {
    console.error("❌ Erro inesperado:", error.message);
  }
}

// Executar teste
testarRecuperarSenha();
