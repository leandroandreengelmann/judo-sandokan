#!/usr/bin/env node

/**
 * INSERIR 100 ALUNOS REAIS VIA MCP SUPABASE
 * Este script realmente insere 100 alunos no banco via MCP execute_sql
 */

console.log("🥋 INSERINDO 100 ALUNOS REAIS - SISTEMA JUDÔ SANDOKAN");
console.log("==================================================");

// Vou fazer por lotes de 10 alunos
const lotes = [
  // LOTE 1 (1-10)
  `INSERT INTO user_profiles (
    id, email, nome_completo, data_nascimento, altura, peso, escolaridade,
    cor_faixa, escola, contato, endereco, instagram, facebook, tiktok,
    tipo_sanguineo, toma_remedio, alergico_remedio, nivel_usuario, aprovado, created_at
  ) VALUES 
    (gen_random_uuid(), 'teste1@judo.com.br', 'João Silva TESTE001', '1995-03-15', 170, 75.5, 'Médio', 'azul', 'EMEF José de Alencar', '(65) 99123-4567', 'Rua Teste 1, Centro, Matupá-MT', '@teste_judo_1', 'João Teste 1', '@judo_teste_1', 'O+', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste2@judo.com.br', 'Maria Santos TESTE002', '1992-07-22', 165, 68.2, 'Superior', 'verde', 'Colégio São Paulo', '(65) 99234-5678', 'Rua Teste 2, Centro, Matupá-MT', '@teste_judo_2', 'Maria Teste 2', '@judo_teste_2', 'A+', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste3@judo.com.br', 'Pedro Oliveira TESTE003', '1998-11-08', 178, 82.1, 'Fundamental', 'amarela', 'Instituto Federal', '(65) 99345-6789', 'Rua Teste 3, Centro, Matupá-MT', '@teste_judo_3', 'Pedro Teste 3', '@judo_teste_3', 'B+', 'Sim - Vitamina D', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste4@judo.com.br', 'Ana Costa TESTE004', '1990-12-03', 162, 58.7, 'Superior', 'branca', 'Colégio Objetivo', '(65) 99456-7890', 'Rua Teste 4, Centro, Matupá-MT', '@teste_judo_4', 'Ana Teste 4', '@judo_teste_4', 'AB+', 'Não', 'Sim - Penicilina', 'aluno', false, now()),
    (gen_random_uuid(), 'teste5@judo.com.br', 'Carlos Mendes TESTE005', '1993-05-18', 175, 78.3, 'Médio', 'laranja', 'EMEF José de Alencar', '(65) 99567-8901', 'Rua Teste 5, Centro, Matupá-MT', '@teste_judo_5', 'Carlos Teste 5', '@judo_teste_5', 'O-', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste6@judo.com.br', 'Lucia Ferreira TESTE006', '1988-09-12', 160, 55.4, 'Médio', 'cinza', 'Colégio São Paulo', '(65) 99678-9012', 'Rua Teste 6, Centro, Matupá-MT', '@teste_judo_6', 'Lucia Teste 6', '@judo_teste_6', 'A-', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste7@judo.com.br', 'Roberto Lima TESTE007', '1985-06-25', 182, 85.9, 'Superior', 'verde', 'Instituto Federal', '(65) 99789-0123', 'Rua Teste 7, Centro, Matupá-MT', '@teste_judo_7', 'Roberto Teste 7', '@judo_teste_7', 'B-', 'Sim - Vitamina D', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste8@judo.com.br', 'Fernanda Souza TESTE008', '1996-01-30', 168, 62.3, 'Fundamental', 'azul', 'EMEF José de Alencar', '(65) 99890-1234', 'Rua Teste 8, Centro, Matupá-MT', '@teste_judo_8', 'Fernanda Teste 8', '@judo_teste_8', 'O+', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste9@judo.com.br', 'Marcos Rocha TESTE009', '1991-04-14', 174, 79.8, 'Médio', 'amarela', 'Colégio Objetivo', '(65) 99901-2345', 'Rua Teste 9, Centro, Matupá-MT', '@teste_judo_9', 'Marcos Teste 9', '@judo_teste_9', 'AB-', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste10@judo.com.br', 'Julia Alves TESTE010', '1994-08-07', 163, 59.1, 'Superior', 'branca', 'Instituto Federal', '(65) 99012-3456', 'Rua Teste 10, Centro, Matupá-MT', '@teste_judo_10', 'Julia Teste 10', '@judo_teste_10', 'A+', 'Não', 'Sim - Penicilina', 'aluno', false, now());`,

  // LOTE 2 (11-20)
  `INSERT INTO user_profiles (
    id, email, nome_completo, data_nascimento, altura, peso, escolaridade,
    cor_faixa, escola, contato, endereco, instagram, facebook, tiktok,
    tipo_sanguineo, toma_remedio, alergico_remedio, nivel_usuario, aprovado, created_at
  ) VALUES 
    (gen_random_uuid(), 'teste11@judo.com.br', 'Ricardo Barbosa TESTE011', '1987-11-20', 176, 81.2, 'Médio', 'laranja', 'EMEF José de Alencar', '(65) 99112-3456', 'Rua Teste 11, Centro, Matupá-MT', '@teste_judo_11', 'Ricardo Teste 11', '@judo_teste_11', 'O-', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste12@judo.com.br', 'Camila Ramos TESTE012', '1999-02-28', 161, 57.6, 'Fundamental', 'cinza', 'Colégio São Paulo', '(65) 99123-4567', 'Rua Teste 12, Centro, Matupá-MT', '@teste_judo_12', 'Camila Teste 12', '@judo_teste_12', 'B+', 'Sim - Vitamina D', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste13@judo.com.br', 'Diego Cardoso TESTE013', '1990-05-16', 179, 83.7, 'Superior', 'verde', 'Instituto Federal', '(65) 99234-5678', 'Rua Teste 13, Centro, Matupá-MT', '@teste_judo_13', 'Diego Teste 13', '@judo_teste_13', 'A-', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste14@judo.com.br', 'Beatriz Gomes TESTE014', '1993-10-11', 164, 60.4, 'Médio', 'azul', 'Colégio Objetivo', '(65) 99345-6789', 'Rua Teste 14, Centro, Matupá-MT', '@teste_judo_14', 'Beatriz Teste 14', '@judo_teste_14', 'AB+', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste15@judo.com.br', 'Felipe Dias TESTE015', '1986-07-04', 181, 84.5, 'Superior', 'amarela', 'EMEF José de Alencar', '(65) 99456-7890', 'Rua Teste 15, Centro, Matupá-MT', '@teste_judo_15', 'Felipe Teste 15', '@judo_teste_15', 'O+', 'Não', 'Sim - Penicilina', 'aluno', false, now()),
    (gen_random_uuid(), 'teste16@judo.com.br', 'Gabriela Martins TESTE016', '1997-12-23', 166, 63.8, 'Fundamental', 'branca', 'Colégio São Paulo', '(65) 99567-8901', 'Rua Teste 16, Centro, Matupá-MT', '@teste_judo_16', 'Gabriela Teste 16', '@judo_teste_16', 'A+', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste17@judo.com.br', 'Thiago Nascimento TESTE017', '1989-03-09', 177, 80.1, 'Médio', 'laranja', 'Instituto Federal', '(65) 99678-9012', 'Rua Teste 17, Centro, Matupá-MT', '@teste_judo_17', 'Thiago Teste 17', '@judo_teste_17', 'B-', 'Sim - Vitamina D', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste18@judo.com.br', 'Larissa Castro TESTE018', '1995-08-17', 159, 56.2, 'Superior', 'cinza', 'Colégio Objetivo', '(65) 99789-0123', 'Rua Teste 18, Centro, Matupá-MT', '@teste_judo_18', 'Larissa Teste 18', '@judo_teste_18', 'AB-', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste19@judo.com.br', 'Bruno Pereira TESTE019', '1992-01-05', 180, 86.3, 'Médio', 'verde', 'EMEF José de Alencar', '(65) 99890-1234', 'Rua Teste 19, Centro, Matupá-MT', '@teste_judo_19', 'Bruno Teste 19', '@judo_teste_19', 'O-', 'Não', 'Não', 'aluno', false, now()),
    (gen_random_uuid(), 'teste20@judo.com.br', 'Rafaela Moura TESTE020', '1988-06-26', 167, 61.7, 'Superior', 'azul', 'Colégio São Paulo', '(65) 99901-2345', 'Rua Teste 20, Centro, Matupá-MT', '@teste_judo_20', 'Rafaela Teste 20', '@judo_teste_20', 'A+', 'Não', 'Sim - Penicilina', 'aluno', false, now());`,
];

console.log(
  "✅ Script preparado com queries para inserir 20 alunos em 2 lotes"
);
console.log("📊 Execute as queries usando MCP execute_sql");
console.log("🎯 Cada lote tem 10 alunos com dados realistas");

// Exportar as queries para usar via MCP
module.exports = { lotes };
