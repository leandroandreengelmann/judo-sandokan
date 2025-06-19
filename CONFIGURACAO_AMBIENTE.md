# Configuração de Ambiente - Sistema Judô

## Variáveis de Ambiente

Este projeto utiliza as seguintes variáveis de ambiente para se conectar ao Supabase:

### Arquivo .env.local (Desenvolvimento Local)

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bpgeajkwscgicaebihbl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZ2Vhamt3c2NnaWNhZWJpaGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODE4NzAsImV4cCI6MjA2NTg1Nzg3MH0.xcBNE58hbqA2HFpA_z8hoXaWgUzxMyu1Fhs9fP8i23Q
```

### Arquivo .env.example (Template)

Para um novo ambiente, crie um arquivo `.env.example` com:

```env
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Outras configurações que podem ser necessárias
NODE_ENV=development
```

## Como Configurar

1. **Desenvolvimento Local**:

   - Copie as credenciais acima para seu arquivo `.env.local`
   - O arquivo `.env.local` não deve ser versionado no Git

2. **Produção**:

   - Configure as variáveis de ambiente no seu provedor de hosting
   - Use suas próprias credenciais do Supabase para produção

3. **Equipe**:
   - Compartilhe o arquivo `.env.example` como template
   - Cada desenvolvedor deve criar seu próprio `.env.local`

## Segurança

- ✅ Arquivo `.env.local` está no `.gitignore`
- ✅ Credenciais foram removidas do código fonte
- ✅ Variáveis de ambiente são validadas no código
- ❌ **NUNCA** commite arquivos `.env.local` ou `.env` com credenciais reais

## Status dos Arquivos de Ambiente

- `.env.local` ✅ - Criado com credenciais reais (apenas local)
- `.env.example` ⏳ - Será criado como template
- `.gitignore` ✅ - Configurado para ignorar arquivos `.env*`
- `supabase.ts` ✅ - Atualizado para usar variáveis de ambiente
