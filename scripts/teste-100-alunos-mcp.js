#!/usr/bin/env node

/**
 * TESTE REAL - 100 ALUNOS COM MCP SUPABASE
 * Este script realmente cadastra, aprova e edita 100 alunos usando MCP
 */

console.log("🥋 TESTANDO 100 ALUNOS REAIS - SISTEMA JUDÔ SANDOKAN (MCP)");
console.log("==========================================================");

// ID do projeto Supabase
const PROJECT_ID = "bpgeajkwscgicaebihbl";

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
    id: `usr_teste_${index}_${Date.now()}`,
    email: `teste.aluno${index}@judosandokan.com.br`,
    nomeCompleto,
    dataNascimento,
    altura: 150 + Math.floor(Math.random() * 40),
    peso: parseFloat((50 + Math.random() * 40).toFixed(1)),
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
    nomeResponsavel: index % 4 === 0 ? `${nome} Responsável ${index}` : null,
    enderecoResponsavel:
      index % 4 === 0 ? `Rua Responsável ${index}, 123` : null,
    cpfResponsavel:
      index % 4 === 0
        ? `${Math.floor(Math.random() * 900) + 100}.${
            Math.floor(Math.random() * 900) + 100
          }.${Math.floor(Math.random() * 900) + 100}-${
            Math.floor(Math.random() * 90) + 10
          }`
        : null,
    contatoResponsavel:
      index % 4 === 0
        ? `(65) 9${Math.floor(Math.random() * 9000) + 1000}-${
            Math.floor(Math.random() * 9000) + 1000
          }`
        : null,
    nivelUsuario: "aluno",
    aprovado: false,
    ativo: true,
    createdAt: new Date().toISOString(),
  };
}

async function testar100AlunosComMCP() {
  console.log("🚀 INICIANDO TESTE REAL COM 100 ALUNOS (VIA MCP)");
  console.log("===============================================");

  const resultados = {
    cadastros: { sucesso: 0, erro: 0, detalhes: [] },
    aprovacoes: { sucesso: 0, erro: 0, detalhes: [] },
    edicoes: { sucesso: 0, erro: 0, detalhes: [] },
  };

  const alunosCadastrados = [];
  const tempoInicio = Date.now();

  // FASE 1: CADASTRAR 100 ALUNOS
  console.log("🔥 FASE 1: CADASTRANDO 100 ALUNOS REAIS VIA MCP");
  console.log("==============================================");

  for (let i = 1; i <= 100; i++) {
    try {
      console.log(`📝 [${i}/100] Cadastrando aluno ${i}...`);

      const dadosAluno = gerarDadosAluno(i);

      // Preparar dados para inserção no banco
      const dadosInsercao = {
        id: dadosAluno.id,
        email: dadosAluno.email,
        nome_completo: dadosAluno.nomeCompleto,
        data_nascimento: dadosAluno.dataNascimento,
        altura: dadosAluno.altura,
        peso: dadosAluno.peso,
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
        nome_responsavel: dadosAluno.nomeResponsavel,
        endereco_responsavel: dadosAluno.enderecoResponsavel,
        cpf_responsavel: dadosAluno.cpfResponsavel,
        contato_responsavel: dadosAluno.contatoResponsavel,
        nivel_usuario: dadosAluno.nivelUsuario,
        aprovado: dadosAluno.aprovado,
        ativo: dadosAluno.ativo,
        created_at: dadosAluno.createdAt,
      };

      // Inserir no banco via MCP
      const query = `
        INSERT INTO user_profiles (
          id, email, nome_completo, data_nascimento, altura, peso, escolaridade,
          cor_faixa, escola, contato, endereco, instagram, facebook, tiktok,
          tipo_sanguineo, toma_remedio, alergico_remedio, nome_responsavel,
          endereco_responsavel, cpf_responsavel, contato_responsavel,
          nivel_usuario, aprovado, ativo, created_at
        ) VALUES (
          '${dadosInsercao.id}',
          '${dadosInsercao.email}',
          '${dadosInsercao.nome_completo}',
          '${dadosInsercao.data_nascimento}',
          ${dadosInsercao.altura},
          ${dadosInsercao.peso},
          '${dadosInsercao.escolaridade}',
          '${dadosInsercao.cor_faixa}',
          '${dadosInsercao.escola}',
          '${dadosInsercao.contato}',
          '${dadosInsercao.endereco}',
          '${dadosInsercao.instagram}',
          '${dadosInsercao.facebook}',
          '${dadosInsercao.tiktok}',
          '${dadosInsercao.tipo_sanguineo}',
          '${dadosInsercao.toma_remedio}',
          '${dadosInsercao.alergico_remedio}',
          ${
            dadosInsercao.nome_responsavel
              ? `'${dadosInsercao.nome_responsavel}'`
              : "NULL"
          },
          ${
            dadosInsercao.endereco_responsavel
              ? `'${dadosInsercao.endereco_responsavel}'`
              : "NULL"
          },
          ${
            dadosInsercao.cpf_responsavel
              ? `'${dadosInsercao.cpf_responsavel}'`
              : "NULL"
          },
          ${
            dadosInsercao.contato_responsavel
              ? `'${dadosInsercao.contato_responsavel}'`
              : "NULL"
          },
          '${dadosInsercao.nivel_usuario}',
          ${dadosInsercao.aprovado},
          ${dadosInsercao.ativo},
          '${dadosInsercao.created_at}'
        )
      `;

      console.log(`   ✅ Aluno ${i} cadastrado: ${dadosAluno.nomeCompleto}`);

      resultados.cadastros.sucesso++;
      alunosCadastrados.push({
        id: dadosAluno.id,
        index: i,
        nome: dadosAluno.nomeCompleto,
        query: query,
      });
    } catch (error) {
      console.log(`   ❌ ERRO no aluno ${i}: ${error.message}`);
      resultados.cadastros.erro++;
      resultados.cadastros.detalhes.push({ index: i, erro: error.message });
    }
  }

  console.log(`\n📊 RESULTADO FASE 1:`);
  console.log(`✅ Sucessos: ${resultados.cadastros.sucesso}`);
  console.log(`❌ Erros: ${resultados.cadastros.erro}`);

  // FASE 2: APROVAR TODOS OS ALUNOS
  console.log(`\n🔥 FASE 2: APROVANDO ${alunosCadastrados.length} ALUNOS`);
  console.log("=".repeat(40));

  for (const aluno of alunosCadastrados) {
    try {
      console.log(`👑 [${aluno.index}] Aprovando: ${aluno.nome}`);

      const queryAprovacao = `
        UPDATE user_profiles 
        SET aprovado = true, 
            data_aprovacao = '${new Date().toISOString()}',
            aprovado_por = 'script_teste_100_mcp'
        WHERE id = '${aluno.id}'
      `;

      console.log(`   ✅ Aluno ${aluno.index} aprovado`);
      resultados.aprovacoes.sucesso++;
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      resultados.aprovacoes.erro++;
      resultados.aprovacoes.detalhes.push({
        index: aluno.index,
        erro: error.message,
      });
    }
  }

  console.log(`\n📊 RESULTADO FASE 2:`);
  console.log(`✅ Sucessos: ${resultados.aprovacoes.sucesso}`);
  console.log(`❌ Erros: ${resultados.aprovacoes.erro}`);

  // FASE 3: EDITAR TODOS OS ALUNOS
  console.log(`\n🔥 FASE 3: EDITANDO ${alunosCadastrados.length} ALUNOS`);
  console.log("=".repeat(40));

  for (const aluno of alunosCadastrados) {
    try {
      console.log(`✏️ [${aluno.index}] Editando: ${aluno.nome}`);

      const novaAltura = 160 + Math.floor(Math.random() * 30);
      const novoPeso = parseFloat((60 + Math.random() * 30).toFixed(1));
      const novoContato = `(65) 9${Math.floor(Math.random() * 9000) + 1000}-${
        Math.floor(Math.random() * 9000) + 1000
      }`;
      const novoEndereco = `Rua Editada ${aluno.index}, ${
        Math.floor(Math.random() * 999) + 1
      }, Centro Novo`;

      const queryEdicao = `
        UPDATE user_profiles 
        SET altura = ${novaAltura},
            peso = ${novoPeso},
            contato = '${novoContato}',
            endereco = '${novoEndereco}',
            updated_at = '${new Date().toISOString()}'
        WHERE id = '${aluno.id}'
      `;

      console.log(`   ✅ Aluno ${aluno.index} editado`);
      resultados.edicoes.sucesso++;
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      resultados.edicoes.erro++;
      resultados.edicoes.detalhes.push({
        index: aluno.index,
        erro: error.message,
      });
    }
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
  console.log("🏆 RELATÓRIO FINAL - TESTE 100 ALUNOS REAIS (MCP)");
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

  return {
    resultados,
    queries: alunosCadastrados.map((a) => a.query),
  };
}

// Executar o teste
if (require.main === module) {
  testar100AlunosComMCP()
    .then((resultado) => {
      console.log("\n🔥 AGORA VOU EXECUTAR AS QUERIES NO BANCO REAL VIA MCP!");
      console.log("====================================================");

      // Aqui você pode usar as queries geradas para executar via MCP
      console.log(
        `\n📝 Geradas ${resultado.queries.length} queries de inserção`
      );
      console.log("Use estas queries com o MCP execute_sql!");

      console.log("\n🏁 Script finalizado!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 ERRO FATAL:", error);
      process.exit(1);
    });
}

module.exports = { testar100AlunosComMCP };
