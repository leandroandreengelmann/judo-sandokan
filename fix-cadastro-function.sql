-- Script para verificar e corrigir problemas de cadastro

-- 1. Verificar se a função update_profile_on_signup existe
\df update_profile_on_signup

-- 2. Verificar triggers da tabela user_profiles
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles';

-- 3. Criar ou atualizar a função update_profile_on_signup
CREATE OR REPLACE FUNCTION update_profile_on_signup(
    user_id UUID,
    profile_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atualizar o perfil do usuário com os dados fornecidos
    UPDATE user_profiles 
    SET 
        nome_completo = COALESCE((profile_data->>'nome_completo')::TEXT, nome_completo),
        data_nascimento = COALESCE((profile_data->>'data_nascimento')::DATE, data_nascimento),
        altura = COALESCE((profile_data->>'altura')::INTEGER, altura),
        peso = COALESCE((profile_data->>'peso')::DECIMAL, peso),
        escolaridade = COALESCE((profile_data->>'escolaridade')::TEXT, escolaridade),
        cor_faixa = COALESCE((profile_data->>'cor_faixa')::TEXT, cor_faixa),
        escola = COALESCE((profile_data->>'escola')::TEXT, escola),
        contato = COALESCE((profile_data->>'contato')::TEXT, contato),
        endereco = COALESCE((profile_data->>'endereco')::TEXT, endereco),
        instagram = COALESCE((profile_data->>'instagram')::TEXT, instagram),
        facebook = COALESCE((profile_data->>'facebook')::TEXT, facebook),
        tiktok = COALESCE((profile_data->>'tiktok')::TEXT, tiktok),
        tipo_sanguineo = COALESCE((profile_data->>'tipo_sanguineo')::TEXT, tipo_sanguineo),
        toma_remedio = COALESCE((profile_data->>'toma_remedio')::TEXT, toma_remedio),
        alergico_remedio = COALESCE((profile_data->>'alergico_remedio')::TEXT, alergico_remedio),
        nome_responsavel = COALESCE((profile_data->>'nome_responsavel')::TEXT, nome_responsavel),
        endereco_responsavel = COALESCE((profile_data->>'endereco_responsavel')::TEXT, endereco_responsavel),
        cpf_responsavel = COALESCE((profile_data->>'cpf_responsavel')::TEXT, cpf_responsavel),
        contato_responsavel = COALESCE((profile_data->>'contato_responsavel')::TEXT, contato_responsavel),
        especialidade = COALESCE((profile_data->>'especialidade')::TEXT, especialidade),
        biografia = COALESCE((profile_data->>'biografia')::TEXT, biografia),
        anos_experiencia = COALESCE((profile_data->>'anos_experiencia')::INTEGER, anos_experiencia),
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Verificar se o update foi bem-sucedido
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- 4. Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION update_profile_on_signup(UUID, JSONB) TO authenticated;

-- 5. Verificar se existe trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, nivel_usuario, aprovado, created_at, updated_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        'aluno',  -- Padrão: aluno
        FALSE,    -- Padrão: não aprovado
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$;

-- 6. Criar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 7. Garantir permissões corretas
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- 8. Verificar RLS (Row Level Security)
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 9. Criar política RLS para permitir updates durante cadastro
CREATE POLICY "Users can update own profile during signup" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- 10. Habilitar RLS se não estiver habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Mostrar resumo
SELECT 'Script de correção executado com sucesso!' as status; 