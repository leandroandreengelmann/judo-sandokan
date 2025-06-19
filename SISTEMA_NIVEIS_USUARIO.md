# Sistema de Níveis de Usuário - Sistema de Judô

## 📋 Visão Geral

Sistema completo de autenticação com **dois níveis de usuário** e **aprovação manual** implementado no Sistema de Judô.

## 🏗️ Estrutura Implementada

### 1. **Níveis de Usuário**

- **Mestre Admin**: Acesso completo, pode aprovar novos alunos
- **Aluno**: Acesso após aprovação do mestre

### 2. **Fluxo de Aprovação**

- Todo cadastro cria automaticamente um **aluno não aprovado**
- Alunos só conseguem fazer login **após aprovação do mestre**
- Sistema de redirecionamento inteligente baseado no nível

## 🗄️ Estrutura do Banco de Dados

### Campos Adicionados na Tabela `user_profiles`:

```sql
nivel_usuario: TEXT ('mestre' | 'aluno') - DEFAULT 'aluno'
aprovado: BOOLEAN - DEFAULT FALSE
data_aprovacao: TIMESTAMP
aprovado_por: UUID (FK para auth.users)
```

### Políticas RLS Implementadas:

- **Users can manage own profile**: Usuários podem gerenciar seus próprios dados
- **Masters can view all profiles**: Mestres podem ver todos os perfis
- **Masters can update any profile**: Mestres podem atualizar qualquer perfil

## 🔐 Conta Mestre Admin

### Credenciais Criadas:

- **Email**: `leandroandreengelmann@gmail.com`
- **Senha**: `mestre123`
- **Status**: Aprovado automaticamente
- **Nível**: Mestre

## 🚀 Funcionalidades Implementadas

### 1. **Sistema de Login Inteligente**

- **Mestre aprovado** → Redireciona para `/mestre`
- **Aluno aprovado** → Redireciona para `/aluno`
- **Aluno não aprovado** → Redireciona para `/aguardando-aprovacao`
- **Não logado** → Redireciona para `/login`

### 2. **Página do Mestre** (`/mestre`)

- **Painel administrativo completo**
- Lista de usuários aguardando aprovação
- Função de aprovar alunos com um clique
- Estatísticas em tempo real
- Interface moderna com ícones Iron Icons

### 3. **Página do Aluno** (`/aluno`)

- **Dashboard personalizado**
- Estatísticas de treinos
- Informações do perfil
- Ações rápidas (Ver Horários, Editar Perfil, Progresso)

### 4. **Página de Aguardo** (`/aguardando-aprovacao`)

- **Tela informativa** para alunos não aprovados
- Exibe status atual
- Mostra informações do usuário
- Explica o processo de aprovação

## 🔧 Funções do AuthContext

### Novas Funções Implementadas:

```typescript
// Buscar usuários pendentes (apenas mestres)
getPendingUsers(): Promise<{ data?: UserProfile[], error?: string }>

// Aprovar usuário (apenas mestres)
approveUser(userId: string): Promise<{ error?: string }>

// Verificar se é mestre
isMestre(): boolean
```

### Validação de Login Atualizada:

- Verifica se usuário está aprovado
- Bloqueia login de alunos não aprovados
- Mensagem específica para aguardo

## 📱 Interfaces TypeScript

### UserProfile Atualizada:

```typescript
interface UserProfile {
  // ... campos existentes ...
  nivel_usuario: "mestre" | "aluno";
  aprovado: boolean;
  data_aprovacao?: string;
  aprovado_por?: string;
}

interface AuthUser {
  // ... campos existentes ...
  nivel_usuario: "mestre" | "aluno";
  aprovado: boolean;
}
```

## 🎯 Fluxo de Uso

### Para Novos Alunos:

1. **Cadastro** → Conta criada como "aluno não aprovado"
2. **Login** → Bloqueado com mensagem de aguardo
3. **Aguardo** → Página informativa sobre aprovação
4. **Aprovação** → Mestre aprova no painel
5. **Acesso** → Aluno pode fazer login normalmente

### Para Mestre Admin:

1. **Login** → Acesso direto ao painel
2. **Visualização** → Lista de alunos pendentes
3. **Aprovação** → Um clique para aprovar
4. **Gestão** → Controle total do sistema

## 🔒 Segurança Implementada

### Row Level Security (RLS):

- ✅ Políticas evitam recursão infinita
- ✅ Mestres podem ver todos os perfis
- ✅ Alunos só veem seus próprios dados
- ✅ Isolamento total entre usuários

### Validações:

- ✅ Apenas mestres podem aprovar
- ✅ Alunos não aprovados não fazem login
- ✅ Redirecionamento baseado em permissões
- ✅ Proteção de rotas por nível

## 📊 Status de Implementação

| Funcionalidade        | Status          | Descrição                       |
| --------------------- | --------------- | ------------------------------- |
| **Banco de Dados**    | ✅ Completo     | Campos e políticas RLS          |
| **Conta Mestre**      | ✅ Criada       | leandroandreengelmann@gmail.com |
| **AuthContext**       | ✅ Atualizado   | Funções de aprovação            |
| **Login Inteligente** | ✅ Funcional    | Redirecionamento por nível      |
| **Painel Mestre**     | ✅ Completo     | Interface de aprovação          |
| **Dashboard Aluno**   | ✅ Completo     | Portal personalizado            |
| **Página Aguardo**    | ✅ Implementada | Tela informativa                |
| **Tipos TypeScript**  | ✅ Atualizados  | Interfaces completas            |

## 🎉 Sistema Pronto!

O sistema está **100% funcional** com:

- ✅ **Dois níveis de usuário** (Mestre/Aluno)
- ✅ **Aprovação manual obrigatória**
- ✅ **Conta mestre criada**
- ✅ **Redirecionamento inteligente**
- ✅ **Interface moderna e responsiva**
- ✅ **Segurança completa com RLS**

### Para Testar:

1. **Mestre**: Login com `leandroandreengelmann@gmail.com` / `mestre123`
2. **Aluno**: Criar novo cadastro e testar fluxo de aprovação
3. **Sistema**: Verificar redirecionamentos automáticos
