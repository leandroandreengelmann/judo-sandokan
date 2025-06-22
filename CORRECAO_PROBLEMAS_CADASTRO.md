# Correção de Problemas no Cadastro - Sistema Judô Sandokan

## Problemas Identificados

Durante a análise do formulário de cadastro, foram identificados os seguintes problemas que impediam o salvamento correto dos dados no banco:

### 1. **Aplicação Incorreta do trim()**

- **Problema**: O método `trim()` estava sendo aplicado a TODOS os campos, incluindo campos que poderiam ter espaços válidos no início ou fim
- **Impacto**: Dados como endereços, nomes compostos e outras informações estavam perdendo formatação
- **Solução**: Aplicar `trim()` apenas em campos específicos (email, nomeCompleto, escola)

### 2. **Uso de `undefined` vs `null`**

- **Problema**: O código estava enviando `undefined` para alguns campos, mas tentando usar `null` em outros, causando inconsistência de tipos
- **Impacto**: TypeScript rejeitava os dados por incompatibilidade de tipos
- **Solução**: Padronizar o uso de `undefined` para campos opcionais vazios

### 3. **Tempo Insuficiente para Trigger do Banco**

- **Problema**: O tempo de espera (1 segundo) para o trigger criar o perfil básico era insuficiente
- **Impacto**: O update do perfil falhava porque o registro ainda não existia
- **Solução**: Aumentar para 2 segundos e adicionar logs de debug

### 4. **Falta de Validação Básica**

- **Problema**: Não havia validação adequada dos campos obrigatórios antes do envio
- **Impacto**: Dados incompletos eram enviados, causando falhas silenciosas
- **Solução**: Adicionar validações obrigatórias com mensagens claras

### 5. **Tratamento Inadequado de Campos Vazios**

- **Problema**: Campos vazios (strings vazias) eram enviados como `undefined`, mas depois tratados como valores válidos
- **Impacto**: Dados inconsistentes no banco
- **Solução**: Filtrar campos vazios antes do envio ao banco

## Correções Aplicadas

### 1. **AuthContext.tsx - Função signUp**

```typescript
// ✅ ANTES (problemático)
const { error: profileError } = await supabase
  .from("user_profiles")
  .update(userData)
  .eq("id", data.user.id);

// ✅ DEPOIS (corrigido)
// Filtrar campos undefined para evitar problemas
const dadosFiltrados = Object.entries(userData).reduce((acc, [key, value]) => {
  if (value !== undefined && value !== null && value !== "") {
    (acc as Record<string, unknown>)[key] = value;
  }
  return acc;
}, {} as Partial<UserProfile>);

const { data: updateData, error: profileError } = await supabase
  .from("user_profiles")
  .update(dadosFiltrados)
  .eq("id", data.user.id)
  .select();
```

### 2. **Cadastro.tsx - handleInputChange**

```typescript
// ✅ ANTES (problemático)
setFormData((prev) => ({ ...prev, [name]: value.trim() }));

// ✅ DEPOIS (corrigido)
const shouldTrim = ["email", "nomeCompleto", "escola"].includes(name);
setFormData((prev) => ({
  ...prev,
  [name]: shouldTrim ? value.trim() : value,
}));
```

### 3. **Cadastro.tsx - handleSubmit**

```typescript
// ✅ Validações básicas adicionadas
if (!formData.nomeCompleto?.trim()) {
  setError("Nome completo é obrigatório.");
  return;
}

// ✅ Preparação correta dos dados
const userData = {
  nome_completo: formData.nomeCompleto.trim(),
  altura: formData.altura ? parseInt(formData.altura) : undefined,
  peso: formData.peso ? parseFloat(formData.peso) : undefined,
  // ... outros campos com || undefined em vez de || null
};
```

## Logs de Debug Adicionados

Para facilitar futuras depurações, foram adicionados logs detalhados:

1. **No AuthContext**: Logs numerados de 1 a 10 mostrando cada etapa do processo
2. **No Cadastro**: Logs mostrando dados antes e depois da transformação
3. **Tratamento de erros**: Logs detalhados com informações específicas dos erros

## Como Testar as Correções

1. **Abrir o console do navegador** (F12)
2. **Preencher o formulário** com dados de teste
3. **Submeter o cadastro** e observar os logs
4. **Verificar no banco** se todos os dados foram salvos corretamente

### Exemplo de Dados para Teste

```javascript
{
  nomeCompleto: "João Silva Teste",
  email: "joao.teste@email.com",
  senha: "123456",
  dataNascimento: "1990-01-01",
  altura: "175",
  peso: "70.5",
  escolaridade: "Ensino Médio",
  corFaixa: "branca",
  escola: "Escola Teste",
  contato: "(11) 99999-9999",
  endereco: "Rua Teste, 123",
  // ... outros campos
}
```

## Status das Correções

- ✅ **Trim seletivo implementado**
- ✅ **Tipos corrigidos (undefined vs null)**
- ✅ **Tempo de espera aumentado**
- ✅ **Validações básicas adicionadas**
- ✅ **Filtragem de campos vazios**
- ✅ **Logs de debug implementados**
- ✅ **Tratamento de erros melhorado**

## Próximos Passos

1. **Testar o cadastro** com diferentes tipos de dados
2. **Verificar se todos os campos aparecem no banco**
3. **Remover os logs de debug** após confirmar que está funcionando
4. **Implementar validações adicionais** se necessário

---

**Data da Correção**: $(date)
**Arquivos Modificados**:

- `src/contexts/AuthContext.tsx`
- `src/app/cadastro/page.tsx`
