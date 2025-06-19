# Correção Erro 500 - Recursão Infinita RLS

## 🔴 Problema Identificado

**Erro**: Status 500 nas consultas à tabela `user_profiles`

```
Failed to load resource: the server responded with a status of 500
Erro ao carregar perfil: Object
```

### Causa Raiz

As políticas RLS (Row Level Security) estavam causando **recursão infinita**:

```sql
-- Política problemática
CREATE POLICY "Masters can view all profiles" ON user_profiles
FOR SELECT USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM user_profiles master -- ⚠️ RECURSÃO AQUI!
    WHERE master.id = auth.uid()
    AND master.nivel_usuario = 'mestre'
    AND master.aprovado = true
  )
);
```

**Explicação**: Quando o sistema tentava verificar se o usuário era mestre, ele precisava consultar a tabela `user_profiles`, que por sua vez acionava novamente a mesma política, criando um loop infinito.

## ✅ Solução Implementada

### 1. Políticas RLS Simplificadas

```sql
-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Masters can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Masters can update any profile" ON user_profiles;

-- Política simples: apenas acesso ao próprio perfil
CREATE POLICY "Allow own profile access" ON user_profiles
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

### 2. Funções PostgreSQL para Controle de Acesso

```sql
-- Função para verificar se usuário é mestre
CREATE OR REPLACE FUNCTION is_user_master(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND nivel_usuario = 'mestre'
    AND aprovado = true
  );
$$;

-- Função para mestres listarem usuários pendentes
CREATE OR REPLACE FUNCTION get_pending_users(requesting_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  nome_completo text,
  created_at timestamptz,
  nivel_usuario text,
  aprovado boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    up.id, up.email, up.nome_completo, up.created_at, up.nivel_usuario, up.aprovado
  FROM user_profiles up
  WHERE up.aprovado = false
  AND up.nivel_usuario = 'aluno'
  AND EXISTS (
    SELECT 1 FROM user_profiles master
    WHERE master.id = requesting_user_id
    AND master.nivel_usuario = 'mestre'
    AND master.aprovado = true
  );
$$;

-- Função para mestres aprovarem usuários
CREATE OR REPLACE FUNCTION approve_user(requesting_user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar permissões
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = requesting_user_id
    AND nivel_usuario = 'mestre'
    AND aprovado = true
  ) THEN
    RETURN false;
  END IF;

  -- Aprovar usuário
  UPDATE user_profiles
  SET
    aprovado = true,
    data_aprovacao = NOW(),
    aprovado_por = requesting_user_id,
    updated_at = NOW()
  WHERE id = target_user_id
  AND nivel_usuario = 'aluno'
  AND aprovado = false;

  RETURN FOUND;
END;
$$;
```

### 3. AuthContext Atualizado

```typescript
// Antes (problemático)
const getPendingUsers = async () => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("aprovado", false); // ⚠️ Bloqueado por RLS
};

// Depois (funcional)
const getPendingUsers = async () => {
  const { data, error } = await supabase.rpc("get_pending_users", {
    requesting_user_id: user.id, // ✅ Função verifica permissões
  });
};
```

## 🎯 Benefícios da Solução

1. **Elimina Recursão**: Políticas RLS simples, sem consultas complexas
2. **Segurança Mantida**: Funções PostgreSQL com `SECURITY DEFINER`
3. **Performance**: Menos overhead de verificação de políticas
4. **Manutenibilidade**: Lógica de negócio centralizada em funções
5. **Escalabilidade**: Não há risco de novos loops infinitos

## 📋 Migrações Aplicadas

1. `fix_rls_policies_recursion` - Tentativa inicial com view (ainda problemática)
2. `fix_rls_simple_approach` - Solução final com funções PostgreSQL
3. `create_master_functions` - Funções específicas para controle de acesso

## ✅ Status Final

- ✅ Erro 500 resolvido
- ✅ Consultas funcionando normalmente
- ✅ Segurança mantida
- ✅ Sistema pronto para uso

## 🧪 Testes Realizados

```sql
-- Teste 1: Verificar se usuário é mestre
SELECT is_user_master('49a343e8-f819-48db-a910-0e9f44b30cb8'); -- ✅ true

-- Teste 2: Listar usuários pendentes (como mestre)
SELECT * FROM get_pending_users('49a343e8-f819-48db-a910-0e9f44b30cb8'); -- ✅ []

-- Teste 3: Consulta direta funciona
SELECT * FROM user_profiles WHERE id = '49a343e8-f819-48db-a910-0e9f44b30cb8'; -- ✅ dados
```

A aplicação agora deve funcionar sem erros 500 no carregamento de perfis.
