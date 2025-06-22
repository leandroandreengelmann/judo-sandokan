-- Script para resolver problema de rate limit no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Confirmar automaticamente todos os usuários existentes não confirmados
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 2. Criar função para auto-confirmar novos usuários
CREATE OR REPLACE FUNCTION auto_confirm_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Auto confirma o email do usuário imediatamente
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger para auto-confirmar novos usuários
DROP TRIGGER IF EXISTS auto_confirm_on_signup ON auth.users;
CREATE TRIGGER auto_confirm_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- 4. Verificar usuários e status de confirmação
SELECT 
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmados,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as nao_confirmados,
  COUNT(*) as total_usuarios
FROM auth.users;

-- 5. Listar últimos 10 usuários criados
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmado'
    ELSE 'Não Confirmado'
  END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 10; 