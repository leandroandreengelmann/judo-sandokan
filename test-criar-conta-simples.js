console.log("=== TESTE SIMPLES DE CADASTRO ===");

// URL da página de criar conta
const URL = "http://localhost:3001/criar-conta";

console.log(`✅ Página disponível em: ${URL}`);
console.log(`📝 Agora você pode testar manualmente:`);
console.log(`   1. Abra ${URL} no seu navegador`);
console.log(`   2. Preencha o formulário`);
console.log(`   3. O sistema não deve mais enviar email`);
console.log(`   4. O usuário deve ser criado diretamente`);
console.log(`   5. Redirecionamento para /login após sucesso`);
console.log("");
console.log("⚠️  Se ainda der rate limit, aguarde alguns minutos");
console.log("    O Supabase tem rate limit de email que pode persistir");
console.log("    por alguns minutos mesmo após as mudanças.");
