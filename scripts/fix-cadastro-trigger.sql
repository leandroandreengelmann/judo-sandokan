-- Script para corrigir o problema de cadastro
-- Criar trigger para criar perfil automaticamente quando usuário se registra

-- 1. Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nivel_usuario, aprovado, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    'aluno',
    false,
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger que executa quando usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Função RPC para atualizar perfil (usada no cadastro)
CREATE OR REPLACE FUNCTION public.update_profile_on_signup(
  user_id uuid,
  profile_data jsonb
)
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    nome_completo = COALESCE(profile_data->>'nome_completo', nome_completo),
    data_nascimento = CASE 
      WHEN profile_data->>'data_nascimento' IS NOT NULL 
      THEN (profile_data->>'data_nascimento')::date 
      ELSE data_nascimento 
    END,
    telefone = COALESCE(profile_data->>'telefone', telefone),
    endereco = COALESCE(profile_data->>'endereco', endereco),
    responsavel_nome = COALESCE(profile_data->>'responsavel_nome', responsavel_nome),
    responsavel_telefone = COALESCE(profile_data->>'responsavel_telefone', responsavel_telefone),
    experiencia_anterior = COALESCE((profile_data->>'experiencia_anterior')::boolean, experiencia_anterior),
    observacoes = COALESCE(profile_data->>'observacoes', observacoes),
    aceita_termos = COALESCE((profile_data->>'aceita_termos')::boolean, aceita_termos),
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Garantir RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy para usuários lerem seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy para usuários atualizarem seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy para mestres verem todos os perfis
DROP POLICY IF EXISTS "Masters can view all profiles" ON public.user_profiles;
CREATE POLICY "Masters can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() 
      AND nivel_usuario = 'mestre'
    )
  );

-- Policy para mestres atualizarem perfis de alunos
DROP POLICY IF EXISTS "Masters can update student profiles" ON public.user_profiles;
CREATE POLICY "Masters can update student profiles" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() 
      AND nivel_usuario = 'mestre'
    )
  );

-- Policy para mestres deletarem perfis de alunos
DROP POLICY IF EXISTS "Masters can delete student profiles" ON public.user_profiles;
CREATE POLICY "Masters can delete student profiles" ON public.user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() 
      AND nivel_usuario = 'mestre'
    )
  );

-- Policy para permitir inserção via trigger (bypass RLS)
DROP POLICY IF EXISTS "Allow service role to insert" ON public.user_profiles;
CREATE POLICY "Allow service role to insert" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- Comentários para documentação
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function para criar perfil automaticamente quando usuário se registra';
COMMENT ON FUNCTION public.update_profile_on_signup(uuid, jsonb) IS 'Função RPC para atualizar dados do perfil durante o cadastro, bypassa RLS';

-- Verificar se tudo está funcionando
SELECT 'Trigger criado com sucesso!' as status; 