#!/usr/bin/env node

/**
 * TESTE REAL - 100 ALUNOS NO SISTEMA JUDÔ SANDOKAN
 * Este script realmente cadastra, aprova e edita 100 alunos no Supabase
 */

const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variáveis de ambiente do Supabase não configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("🥋 TESTANDO 100 ALUNOS REAIS - SISTEMA JUDÔ SANDOKAN");
console.log("==================================================");

// Dados para gerar alunos
const nomes = [
  "João Silva",
  "Maria Santos",
  "Pedro Oliveira",
  "Ana Costa",
  "Carlos Mendes",
  "Lucia Ferreira",
  "Roberto Lima",
  "Fernanda Souza",
  "Marcos Rocha",
  "Julia Alves",
  "Ricardo Barbosa",
  "Camila Ramos",
  "Diego Cardoso",
  "Beatriz Gomes",
  "Felipe Dias",
  "Gabriela Martins",
  "Thiago Nascimento",
  "Larissa Castro",
  "Bruno Pereira",
  "Rafaela Moura",
  "Gustavo Ribeiro",
  "Mariana Correia",
  "Leonardo Campos",
  "Isabela Teixeira",
  "Rodrigo Azevedo",
  "Amanda Nunes",
  "Daniel Carvalho",
  "Leticia Pinto",
  "Vinicius Melo",
  "Natalia Freitas",
  "Gabriel Torres",
  "Carolina Vieira",
  "Mateus Duarte",
  "Bianca Machado",
  "Andre Fernandes",
  "Vanessa Lopes",
  "Lucas Monteiro",
  "Priscila Silva",
  "Fabio Costa",
  "Tatiane Rodrigues",
  "Henrique Batista",
  "Renata Araujo",
  "Caio Santana",
  "Monica Reis",
  "Eduardo Xavier",
  "Patricia Nogueira",
  "Otavio Cruz",
  "Sandra Medeiros",
  "Claudio Soares",
  "Vera Miranda",
];

const sobrenomes = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Costa",
  "Pereira",
  "Rodrigues",
];
const escolas = [
  "EMEF José de Alencar",
  "Colégio São Paulo",
  "Instituto Federal",
  "Colégio Objetivo",
];
const tiposSanguineos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const escolaridades = ["Fundamental", "Médio", "Superior"];
const faixas = ["branca", "cinza", "azul", "amarela", "laranja", "verde"];

// Função para gerar dados de aluno
function gerarDadosAluno(index) {
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  const nomeCompleto = `${nome} ${sobrenome} TESTE${index
    .toString()
    .padStart(3, "0")}`;

  const ano = 1980 + Math.floor(Math.random() * 25); // 1980-2005
  const mes = Math.floor(Math.random() * 12) + 1;
  const dia = Math.floor(Math.random() * 28) + 1;
  const dataNascimento = `${ano}-${mes.toString().padStart(2, "0")}-${dia
    .toString()
    .padStart(2, "0")}`;

  return {
    nomeCompleto,
    email: `teste.aluno${index}@judosandokan.com.br`,
    senha: "Teste123!@#",
    dataNascimento,
    altura: (150 + Math.floor(Math.random() * 40)).toString(),
    peso: (50 + Math.random() * 40).toFixed(1),
    escolaridade:
      escolaridades[Math.floor(Math.random() * escolaridades.length)],
    corFaixa: faixas[Math.floor(Math.random() * faixas.length)],
    escola: escolas[Math.floor(Math.random() * escolas.length)],
    contato: `(65) 9${Math.floor(Math.random() * 9000) + 1000}-${
      Math.floor(Math.random() * 9000) + 1000
    }`,
    endereco: `Rua Teste ${index}, ${
      Math.floor(Math.random() * 999) + 1
    }, Centro, Matupá-MT`,
    instagram: `@teste_judo_${index}`,
    facebook: `${nome} Teste ${index}`,
    tiktok: `@judo_teste_${index}`,
    tipoSanguineo:
      tiposSanguineos[Math.floor(Math.random() * tiposSanguineos.length)],
    tomaRemedio: Math.random() > 0.8 ? "Sim - Vitamina D" : "Não",
    alergicoRemedio: Math.random() > 0.9 ? "Sim - Penicilina" : "Não",
    nomeResponsavel: index % 4 === 0 ? `${nome} Responsável ${index}` : "",
    enderecoResponsavel: index % 4 === 0 ? `Rua Responsável ${index}, 123` : "",
    cpfResponsavel:
      index % 4 === 0
        ? `${Math.floor(Math.random() * 900) + 100}.${
            Math.floor(Math.random() * 900) + 100
          }.${Math.floor(Math.random() * 900) + 100}-${
            Math.floor(Math.random() * 90) + 10
          }`
        : "",
    contatoResponsavel:
      index % 4 === 0
        ? `(65) 9${Math.floor(Math.random() * 9000) + 1000}-${
            Math.floor(Math.random() * 9000) + 1000
          }`
        : "",
  };
}

// Função para cadastrar aluno REAL
async function cadastrarAlunoReal(dadosAluno, index) {
  try {
    console.log(`📝 [${index}/100] Cadastrando: ${dadosAluno.nomeCompleto}`);

    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dadosAluno.email,
      password: dadosAluno.senha,
    });

    if (authError) {
      throw new Error(`Auth: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("Usuário não foi criado");
    }

    console.log(`   ✅ Auth criado: ${authData.user.id}`);

    // 2. Aguardar trigger criar perfil
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Preparar dados do perfil
    const userData = {
      nome_completo: dadosAluno.nomeCompleto,
      data_nascimento: dadosAluno.dataNascimento,
      altura: parseInt(dadosAluno.altura),
      peso: parseFloat(dadosAluno.peso),
      escolaridade: dadosAluno.escolaridade,
      cor_faixa: dadosAluno.corFaixa,
      escola: dadosAluno.escola,
      contato: dadosAluno.contato,
      endereco: dadosAluno.endereco,
      instagram: dadosAluno.instagram,
      facebook: dadosAluno.facebook,
      tiktok: dadosAluno.tiktok,
      tipo_sanguineo: dadosAluno.tipoSanguineo,
      toma_remedio: dadosAluno.tomaRemedio,
      alergico_remedio: dadosAluno.alergicoRemedio,
      nome_responsavel: dadosAluno.nomeResponsavel || null,
      endereco_responsavel: dadosAluno.enderecoResponsavel || null,
      cpf_responsavel: dadosAluno.cpfResponsavel || null,
      contato_responsavel: dadosAluno.contatoResponsavel || null,
    };

    // Filtrar campos vazios
    const dadosFiltrados = {};
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        dadosFiltrados[key] = value;
      }
    });

    // 4. Atualizar perfil
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .update(dadosFiltrados)
      .eq("id", authData.user.id)
      .select();

    if (profileError) {
      throw new Error(`Profile: ${profileError.message}`);
    }

    console.log(`   ✅ Perfil atualizado`);

    return {
      success: true,
      userId: authData.user.id,
      data: profileData,
    };
  } catch (error) {
    console.log(`   ❌ ERRO: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Função para aprovar aluno REAL
async function aprovarAlunoReal(userId, index) {
  try {
    console.log(`👑 [${index}] Aprovando aluno...`);

    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        aprovado: true,
        data_aprovacao: new Date().toISOString(),
        aprovado_por: "script_teste_100",
      })
      .eq("id", userId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    console.log(`   ✅ Aluno aprovado`);
    return { success: true, data };
  } catch (error) {
    console.log(`   ❌ ERRO: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função para editar aluno REAL
async function editarAlunoReal(userId, index) {
  try {
    console.log(`✏️ [${index}] Editando aluno...`);

    const novosDados = {
      altura: 160 + Math.floor(Math.random() * 30),
      peso: parseFloat((60 + Math.random() * 30).toFixed(1)),
      contato: `(65) 9${Math.floor(Math.random() * 9000) + 1000}-${
        Math.floor(Math.random() * 9000) + 1000
      }`,
      endereco: `Rua Editada ${index}, ${
        Math.floor(Math.random() * 999) + 1
      }, Centro Novo`,
    };

    const { data, error } = await supabase
      .from("user_profiles")
      .update(novosDados)
      .eq("id", userId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    console.log(`   ✅ Aluno editado`);
    return { success: true, data };
  } catch (error) {
    console.log(`   ❌ ERRO: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função para limpar dados de teste
async function limparDadosTeste() {
  console.log("🧹 Limpando dados de teste anteriores...");

  try {
    // Buscar usuários de teste
    const { data: usuarios, error: searchError } = await supabase
      .from("user_profiles")
      .select("id, email, nome_completo")
      .or("email.like.%@judosandokan.com.br,nome_completo.like.%TESTE%");

    if (searchError) {
      console.log(`Erro ao buscar: ${searchError.message}`);
      return;
    }

    if (usuarios && usuarios.length > 0) {
      console.log(
        `Encontrados ${usuarios.length} usuários de teste para remover`
      );

      // Remover perfis
      const { error: deleteError } = await supabase
        .from("user_profiles")
        .delete()
        .or("email.like.%@judosandokan.com.br,nome_completo.like.%TESTE%");

      if (deleteError) {
        console.log(`Erro ao remover: ${deleteError.message}`);
      } else {
        console.log(`✅ ${usuarios.length} usuários de teste removidos`);
      }
    } else {
      console.log("Nenhum usuário de teste encontrado");
    }
  } catch (error) {
    console.log(`Erro durante limpeza: ${error.message}`);
  }
}

// FUNÇÃO PRINCIPAL - TESTAR 100 ALUNOS REAIS
async function testar100AlunosReais() {
  console.log("🚀 INICIANDO TESTE REAL COM 100 ALUNOS");
  console.log("======================================");

  const resultados = {
    cadastros: { sucesso: 0, erro: 0, detalhes: [] },
    aprovacoes: { sucesso: 0, erro: 0, detalhes: [] },
    edicoes: { sucesso: 0, erro: 0, detalhes: [] },
  };

  const alunosCadastrados = [];
  const tempoInicio = Date.now();

  // Limpar dados anteriores
  await limparDadosTeste();
  console.log("");

  // FASE 1: CADASTRAR 100 ALUNOS
  console.log("🔥 FASE 1: CADASTRANDO 100 ALUNOS REAIS");
  console.log("=======================================");

  for (let i = 1; i <= 100; i++) {
    const dadosAluno = gerarDadosAluno(i);
    const resultado = await cadastrarAlunoReal(dadosAluno, i);

    if (resultado.success) {
      resultados.cadastros.sucesso++;
      alunosCadastrados.push({
        userId: resultado.userId,
        index: i,
        nome: dadosAluno.nomeCompleto,
      });
    } else {
      resultados.cadastros.erro++;
      resultados.cadastros.detalhes.push({ index: i, erro: resultado.error });
    }

    // Pausa para não sobrecarregar
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`\n📊 RESULTADO FASE 1:`);
  console.log(`✅ Sucessos: ${resultados.cadastros.sucesso}`);
  console.log(`❌ Erros: ${resultados.cadastros.erro}`);

  if (alunosCadastrados.length === 0) {
    console.log("❌ NENHUM ALUNO FOI CADASTRADO! Abortando teste.");
    return;
  }

  // FASE 2: APROVAR TODOS OS ALUNOS
  console.log(`\n🔥 FASE 2: APROVANDO ${alunosCadastrados.length} ALUNOS`);
  console.log("=".repeat(40));

  for (const aluno of alunosCadastrados) {
    const resultado = await aprovarAlunoReal(aluno.userId, aluno.index);

    if (resultado.success) {
      resultados.aprovacoes.sucesso++;
    } else {
      resultados.aprovacoes.erro++;
      resultados.aprovacoes.detalhes.push({
        index: aluno.index,
        erro: resultado.error,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n📊 RESULTADO FASE 2:`);
  console.log(`✅ Sucessos: ${resultados.aprovacoes.sucesso}`);
  console.log(`❌ Erros: ${resultados.aprovacoes.erro}`);

  // FASE 3: EDITAR TODOS OS ALUNOS
  console.log(`\n🔥 FASE 3: EDITANDO ${alunosCadastrados.length} ALUNOS`);
  console.log("=".repeat(40));

  for (const aluno of alunosCadastrados) {
    const resultado = await editarAlunoReal(aluno.userId, aluno.index);

    if (resultado.success) {
      resultados.edicoes.sucesso++;
    } else {
      resultados.edicoes.erro++;
      resultados.edicoes.detalhes.push({
        index: aluno.index,
        erro: resultado.error,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n📊 RESULTADO FASE 3:`);
  console.log(`✅ Sucessos: ${resultados.edicoes.sucesso}`);
  console.log(`❌ Erros: ${resultados.edicoes.erro}`);

  // RELATÓRIO FINAL
  const tempoTotal = (Date.now() - tempoInicio) / 1000;
  const totalOperacoes =
    resultados.cadastros.sucesso +
    resultados.aprovacoes.sucesso +
    resultados.edicoes.sucesso;
  const totalPossivel =
    100 + resultados.cadastros.sucesso + resultados.cadastros.sucesso;
  const taxaSucesso = ((totalOperacoes / totalPossivel) * 100).toFixed(1);

  console.log("\n" + "=".repeat(50));
  console.log("🏆 RELATÓRIO FINAL - TESTE 100 ALUNOS REAIS");
  console.log("=".repeat(50));
  console.log(`⏱️  Tempo total: ${tempoTotal.toFixed(1)}s`);
  console.log(`📝 Cadastros: ${resultados.cadastros.sucesso}/100`);
  console.log(
    `👑 Aprovações: ${resultados.aprovacoes.sucesso}/${resultados.cadastros.sucesso}`
  );
  console.log(
    `✏️  Edições: ${resultados.edicoes.sucesso}/${resultados.cadastros.sucesso}`
  );
  console.log(`🎯 Taxa de sucesso: ${taxaSucesso}%`);

  // Exibir erros se houver
  const totalErros =
    resultados.cadastros.erro +
    resultados.aprovacoes.erro +
    resultados.edicoes.erro;
  if (totalErros > 0) {
    console.log(`\n❌ TOTAL DE ERROS: ${totalErros}`);

    if (resultados.cadastros.detalhes.length > 0) {
      console.log("\nErros de Cadastro:");
      resultados.cadastros.detalhes.slice(0, 5).forEach((erro) => {
        console.log(`  ${erro.index}: ${erro.erro}`);
      });
    }

    if (resultados.aprovacoes.detalhes.length > 0) {
      console.log("\nErros de Aprovação:");
      resultados.aprovacoes.detalhes.slice(0, 5).forEach((erro) => {
        console.log(`  ${erro.index}: ${erro.erro}`);
      });
    }

    if (resultados.edicoes.detalhes.length > 0) {
      console.log("\nErros de Edição:");
      resultados.edicoes.detalhes.slice(0, 5).forEach((erro) => {
        console.log(`  ${erro.index}: ${erro.erro}`);
      });
    }
  }

  if (parseFloat(taxaSucesso) >= 95) {
    console.log("\n🎉 TESTE CONCLUÍDO COM SUCESSO!");
    console.log("   Sistema aprovado para produção!");
  } else {
    console.log("\n⚠️  TESTE CONCLUÍDO COM PROBLEMAS");
    console.log("   Revise os erros antes de usar em produção");
  }

  console.log(
    `\n✅ TESTE FINALIZADO - ${alunosCadastrados.length} alunos processados no total`
  );

  return resultados;
}

// Executar o teste
if (require.main === module) {
  testar100AlunosReais()
    .then(() => {
      console.log("\n🏁 Script finalizado!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 ERRO FATAL:", error);
      process.exit(1);
    });
}

module.exports = { testar100AlunosReais };
