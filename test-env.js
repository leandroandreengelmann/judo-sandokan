// Testar se as variáveis de ambiente estão configuradas
console.log("🔍 Verificando variáveis de ambiente...\n");

// Verificar arquivo .env.local
const fs = require("fs");
const path = require("path");

const envLocalPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envLocalPath)) {
  console.log("✅ Arquivo .env.local encontrado");
  const envContent = fs.readFileSync(envLocalPath, "utf8");
  console.log("\n📄 Conteúdo do .env.local:");
  console.log("--------------------------------");
  // Mostrar apenas as primeiras linhas sem expor as chaves completas
  const lines = envContent.split("\n");
  lines.forEach((line) => {
    if (line.includes("SUPABASE_URL")) {
      console.log(line);
    } else if (line.includes("SUPABASE_ANON_KEY")) {
      const parts = line.split("=");
      if (parts.length > 1) {
        console.log(`${parts[0]}=${parts[1].substring(0, 20)}...`);
      }
    }
  });
  console.log("--------------------------------");
} else {
  console.log("❌ Arquivo .env.local NÃO encontrado!");
  console.log("\n🔧 SOLUÇÃO:");
  console.log("1. Crie um arquivo .env.local na raiz do projeto");
  console.log("2. Adicione as seguintes variáveis:");
  console.log(
    "\nNEXT_PUBLIC_SUPABASE_URL=https://bpgeajkwscgicaebihbl.supabase.co"
  );
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZ2Vhamt3c2NnaWNhZWJpaGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODE4NzAsImV4cCI6MjA2NTg1Nzg3MH0.xcBNE58hbqA2HFpA_z8hoXaWgUzxMyu1Fhs9fP8i23Q"
  );
}
