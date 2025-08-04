"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProximoVencimento {
  id: string;
  data_vencimento: string;
  valor_mensalidade: number;
  aluno: {
    nome_completo: string;
    email: string;
    contato: string;
  };
}

interface FaturamentoMes {
  mes: string;
  ano: number;
  valor: number;
}

interface FormaPagamento {
  forma: string;
  quantidade: number;
  valor: number;
}

interface RelatorioFinanceiro {
  faturamentoTotal: number;
  faturamentoMensal: number;
  faturamentoAnual: number;
  mensalidadesPendentes: number;
  valorPendente: number;
  mensalidadesPagas: number;
  valorPago: number;
  mensalidadesAtrasadas: number;
  valorAtrasado: number;
  alunosParticulares: number;
  ticketMedio: number;
  taxaRecebimento: number;
  proximosVencimentos: ProximoVencimento[];
  faturamentoPorMes: FaturamentoMes[];
  formasPagamento: FormaPagamento[];
}

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function RelatoriosPage() {
  const { user, loading, isMestre } = useAuth();
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiro | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [tipoRelatorio, setTipoRelatorio] = useState<"mensal" | "anual">(
    "mensal"
  );
  const router = useRouter();

  const gerarRelatorio = useCallback(async () => {
    setLoadingData(true);
    try {
      const dataInicio =
        tipoRelatorio === "mensal"
          ? new Date(filtroAno, filtroMes - 1, 1)
          : new Date(filtroAno, 0, 1);

      const dataFim =
        tipoRelatorio === "mensal"
          ? new Date(filtroAno, filtroMes, 0)
          : new Date(filtroAno, 11, 31);

      // Buscar todas as mensalidades
      const { data: mensalidades, error: errorMensalidades } = await supabase
        .from("mensalidades")
        .select(
          `
          *,
          aluno:user_profiles(nome_completo, email)
        `
        )
        .gte("data_vencimento", dataInicio.toISOString().split("T")[0])
        .lte("data_vencimento", dataFim.toISOString().split("T")[0]);

      if (errorMensalidades) {
        console.error("Erro ao buscar mensalidades:", errorMensalidades);
        return;
      }

      // Buscar alunos particulares
      const { data: alunosParticulares, error: errorAlunos } = await supabase
        .from("user_profiles")
        .select("id, nome_completo, valor_mensalidade")
        .eq("aluno_particular", true)
        .eq("aprovado", true);

      if (errorAlunos) {
        console.error("Erro ao buscar alunos:", errorAlunos);
        return;
      }

      // Calcular métricas
      const mensalidadesPagas =
        mensalidades?.filter((m) => m.status === "pago") || [];
      const mensalidadesPendentes =
        mensalidades?.filter((m) => m.status === "pendente") || [];
      const mensalidadesAtrasadas =
        mensalidades?.filter((m) => {
          const hoje = new Date();
          const vencimento = new Date(m.data_vencimento);
          return m.status === "pendente" && vencimento < hoje;
        }) || [];

      const valorPago = mensalidadesPagas.reduce(
        (sum, m) => sum + m.valor_mensalidade,
        0
      );
      const valorPendente = mensalidadesPendentes.reduce(
        (sum, m) => sum + m.valor_mensalidade,
        0
      );
      const valorAtrasado = mensalidadesAtrasadas.reduce(
        (sum, m) => sum + m.valor_mensalidade,
        0
      );

      // Faturamento por mês (últimos 12 meses)
      const faturamentoPorMes = [];
      for (let i = 11; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const ano = data.getFullYear();
        const mes = data.getMonth() + 1;

        const { data: mensalidadesMes } = await supabase
          .from("mensalidades")
          .select("valor_mensalidade")
          .eq("status", "pago")
          .eq("mes_referencia", mes)
          .eq("ano_referencia", ano);

        const valorMes =
          mensalidadesMes?.reduce((sum, m) => sum + m.valor_mensalidade, 0) ||
          0;

        faturamentoPorMes.push({
          mes: meses[mes - 1],
          ano,
          valor: valorMes,
        });
      }

      // Formas de pagamento
      const formasPagamento = await supabase
        .from("mensalidades")
        .select("forma_pagamento, valor_mensalidade")
        .eq("status", "pago")
        .not("forma_pagamento", "is", null);

      const formasAgrupadas: Record<
        string,
        { quantidade: number; valor: number }
      > =
        formasPagamento.data?.reduce((acc, m) => {
          const forma = m.forma_pagamento || "Não informado";
          if (!acc[forma]) {
            acc[forma] = { quantidade: 0, valor: 0 };
          }
          acc[forma].quantidade++;
          acc[forma].valor += m.valor_mensalidade;
          return acc;
        }, {} as Record<string, { quantidade: number; valor: number }>) || {};

      const formasArray = Object.entries(formasAgrupadas).map(
        ([forma, dados]) => ({
          forma,
          quantidade: dados.quantidade,
          valor: dados.valor,
        })
      );

      // Próximos vencimentos (próximos 7 dias)
      const proximaSemanadata = new Date();
      proximaSemanadata.setDate(proximaSemanadata.getDate() + 7);

      const { data: proximosVencimentos } = await supabase
        .from("mensalidades")
        .select(
          `
          *,
          aluno:user_profiles(nome_completo, email, contato)
        `
        )
        .eq("status", "pendente")
        .gte("data_vencimento", new Date().toISOString().split("T")[0])
        .lte("data_vencimento", proximaSemanadata.toISOString().split("T")[0])
        .order("data_vencimento");

      const ticketMedio =
        alunosParticulares?.length > 0
          ? alunosParticulares.reduce(
              (sum, a) => sum + a.valor_mensalidade,
              0
            ) / alunosParticulares.length
          : 0;

      const taxaRecebimento =
        mensalidades?.length > 0
          ? (mensalidadesPagas.length / mensalidades.length) * 100
          : 0;

      const relatorioData: RelatorioFinanceiro = {
        faturamentoTotal: valorPago,
        faturamentoMensal: valorPago,
        faturamentoAnual: faturamentoPorMes.reduce(
          (sum, m) => sum + m.valor,
          0
        ),
        mensalidadesPendentes: mensalidadesPendentes.length,
        valorPendente,
        mensalidadesPagas: mensalidadesPagas.length,
        valorPago,
        mensalidadesAtrasadas: mensalidadesAtrasadas.length,
        valorAtrasado,
        alunosParticulares: alunosParticulares?.length || 0,
        ticketMedio,
        taxaRecebimento,
        proximosVencimentos: proximosVencimentos || [],
        faturamentoPorMes,
        formasPagamento: formasArray,
      };

      setRelatorio(relatorioData);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    }
    setLoadingData(false);
  }, [filtroAno, filtroMes, tipoRelatorio]);

  useEffect(() => {
    if (!loading && (!user || !isMestre())) {
      router.push("/login");
    }
  }, [user, loading, isMestre, router]);

  useEffect(() => {
    if (user && isMestre()) {
      gerarRelatorio();
    }
  }, [user, isMestre, gerarRelatorio]);

  const exportarRelatorioPDF = async () => {
    if (!relatorio) return;

    // Buscar todas as mensalidades do período para detalhar no PDF
    const dataInicio = tipoRelatorio === "mensal" 
      ? new Date(filtroAno, filtroMes - 1, 1)
      : new Date(filtroAno, 0, 1);
    
    const dataFim = tipoRelatorio === "mensal"
      ? new Date(filtroAno, filtroMes, 0)
      : new Date(filtroAno, 11, 31);

    const { data: mensalidadesDetalhadas } = await supabase
      .from("mensalidades")
      .select(`
        *,
        aluno:user_profiles(nome_completo, email, cor_faixa)
      `)
      .gte("data_vencimento", dataInicio.toISOString().split("T")[0])
      .lte("data_vencimento", dataFim.toISOString().split("T")[0])
      .order("data_vencimento", { ascending: true });

    const doc = new jsPDF();
    let yPosition = 20;

    // Header simples
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO DE MENSALIDADES", 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const periodoTexto = tipoRelatorio === "mensal" 
      ? `${meses[filtroMes - 1]} de ${filtroAno}` 
      : `Ano de ${filtroAno}`;
    doc.text(`Período: ${periodoTexto}`, 20, yPosition);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 120, yPosition);
    
    yPosition += 20;

    // Resumo simples
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMO GERAL", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Mensalidades: ${mensalidadesDetalhadas?.length || 0}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total de Alunos Particulares: ${relatorio.alunosParticulares}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Taxa de Recebimento: ${relatorio.taxaRecebimento.toFixed(1)}%`, 20, yPosition);
    yPosition += 15;

    // Situação resumida
    autoTable(doc, {
      startY: yPosition,
      head: [['Status', 'Quantidade', 'Valor Total']],
      body: [
        ['Pagas', relatorio.mensalidadesPagas.toString(), `R$ ${relatorio.valorPago.toFixed(2)}`],
        ['Pendentes', relatorio.mensalidadesPendentes.toString(), `R$ ${relatorio.valorPendente.toFixed(2)}`],
        ['Atrasadas', relatorio.mensalidadesAtrasadas.toString(), `R$ ${relatorio.valorAtrasado.toFixed(2)}`]
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: 10,
        textColor: [52, 73, 94]
      },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : yPosition + 50;

    // TODAS AS MENSALIDADES DETALHADAS
    if (mensalidadesDetalhadas && mensalidadesDetalhadas.length > 0) {
      // Nova página se necessário
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TODAS AS MENSALIDADES DO PERÍODO", 20, yPosition);
      yPosition += 10;

      // Preparar dados para a tabela
      const mensalidadesData = mensalidadesDetalhadas.map(mens => {
        const status = mens.status === 'pago' ? 'Paga' : 
                     mens.status === 'pendente' ? 'Pendente' : 'Atrasada';
        
        const dataPagamento = mens.data_pagamento 
          ? new Date(mens.data_pagamento).toLocaleDateString("pt-BR")
          : '-';

        return [
          mens.aluno.nome_completo,
          new Date(mens.data_vencimento).toLocaleDateString("pt-BR"),
          `R$ ${mens.valor_mensalidade.toFixed(2)}`,
          status,
          dataPagamento
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Aluno', 'Vencimento', 'Valor', 'Status', 'Dt. Pagamento']],
        body: mensalidadesData,
        theme: 'striped',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          textColor: [52, 73, 94]
        },
        columnStyles: {
          0: { cellWidth: 60 }, // Nome do aluno
          1: { cellWidth: 25 }, // Data vencimento
          2: { cellWidth: 25 }, // Valor
          3: { cellWidth: 25 }, // Status
          4: { cellWidth: 25 }  // Data pagamento
        },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
          // Colorir linha baseado no status
          if (data.section === 'body') {
            const status = data.row.raw[3];
            if (status === 'Paga') {
              data.doc.setFillColor(232, 245, 233); // Verde claro
            } else if (status === 'Atrasada') {
              data.doc.setFillColor(255, 235, 238); // Vermelho claro
            } else if (status === 'Pendente') {
              data.doc.setFillColor(255, 248, 225); // Amarelo claro
            }
          }
        }
      });
    }

    // Rodapé simples
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, 20, 285);
      doc.text(`Sistema Judô - ${new Date().toLocaleDateString("pt-BR")}`, 150, 285);
    }

    // Salvar o PDF
    const nomeArquivo = `mensalidades-completo-${tipoRelatorio}-${filtroAno}${tipoRelatorio === 'mensal' ? `-${filtroMes.toString().padStart(2, '0')}` : ''}.pdf`;
    doc.save(nomeArquivo);
  };

  const exportarRelatorioTXT = () => {
    if (!relatorio) return;

    const dados = [
      `RELATÓRIO FINANCEIRO - ${tipoRelatorio.toUpperCase()}`,
      `Período: ${
        tipoRelatorio === "mensal" ? meses[filtroMes - 1] : "Ano"
      } ${filtroAno}`,
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
      "",
      "RESUMO GERAL:",
      `Alunos Particulares: ${relatorio.alunosParticulares}`,
      `Ticket Médio: R$ ${relatorio.ticketMedio.toFixed(2)}`,
      `Taxa de Recebimento: ${relatorio.taxaRecebimento.toFixed(1)}%`,
      "",
      "FATURAMENTO:",
      `Total Pago: R$ ${relatorio.valorPago.toFixed(2)} (${
        relatorio.mensalidadesPagas
      } mensalidades)`,
      `Total Pendente: R$ ${relatorio.valorPendente.toFixed(2)} (${
        relatorio.mensalidadesPendentes
      } mensalidades)`,
      `Total Atrasado: R$ ${relatorio.valorAtrasado.toFixed(2)} (${
        relatorio.mensalidadesAtrasadas
      } mensalidades)`,
      "",
      "FORMAS DE PAGAMENTO:",
      ...relatorio.formasPagamento.map(
        (f) =>
          `${f.forma}: ${f.quantidade} pagamentos - R$ ${f.valor.toFixed(2)}`
      ),
      "",
      "PRÓXIMOS VENCIMENTOS:",
      ...relatorio.proximosVencimentos.map(
        (v) =>
          `${new Date(v.data_vencimento).toLocaleDateString("pt-BR")} - ${
            v.aluno.nome_completo
          } - R$ ${v.valor_mensalidade.toFixed(2)}`
      ),
    ];

    const conteudo = dados.join("\n");
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-financeiro-${tipoRelatorio}-${filtroAno}-${filtroMes}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl text-primary-950 animate-spin">🔄</span>
          <span className="text-primary-950 font-semibold">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-3 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-primary-950 mb-2">
            📊 Relatórios Financeiros
          </h1>
          <p className="text-primary-700 text-sm lg:text-base">
            Acompanhe o desempenho financeiro e métricas de mensalidades
          </p>
        </div>

        {/* Filtros e Controles */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-primary-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-xs font-medium text-primary-900 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={tipoRelatorio}
                  onChange={(e) =>
                    setTipoRelatorio(e.target.value as "mensal" | "anual")
                  }
                  className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              {tipoRelatorio === "mensal" && (
                <div>
                  <label className="block text-xs font-medium text-primary-900 mb-2">
                    Mês
                  </label>
                  <select
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(parseInt(e.target.value))}
                    className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {meses.map((mes, index) => (
                      <option key={index} value={index + 1}>
                        {mes}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-primary-900 mb-2">
                  Ano
                </label>
                <select
                  value={filtroAno}
                  onChange={(e) => setFiltroAno(parseInt(e.target.value))}
                  className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={exportarRelatorioPDF}
                disabled={loadingData || !relatorio}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              >
                <span className="mr-2">📄</span>
                PDF - Mensalidades
              </button>
              <button
                onClick={exportarRelatorioTXT}
                disabled={loadingData || !relatorio}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              >
                <span className="mr-2">📥</span>
                Exportar TXT
              </button>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <span className="text-4xl animate-spin">🔄</span>
            <p className="text-primary-700 mt-4">Gerando relatório...</p>
          </div>
        ) : relatorio ? (
          <>
            {/* Métricas Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                    <span className="text-white text-xl lg:text-2xl font-bold">
                      💰
                    </span>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-primary-600">
                      Faturamento
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-primary-950">
                      R$ {relatorio.valorPago.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                    <span className="text-white text-xl lg:text-2xl font-bold">
                      ⏰
                    </span>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-primary-600">
                      Pendente
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-primary-950">
                      R$ {relatorio.valorPendente.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                    <span className="text-white text-xl lg:text-2xl font-bold">
                      ❌
                    </span>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-primary-600">
                      Atrasado
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-primary-950">
                      R$ {relatorio.valorAtrasado.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-primary-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                    <span className="text-white text-xl lg:text-2xl font-bold">
                      📊
                    </span>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-primary-600">
                      Taxa Recebimento
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-primary-950">
                      {relatorio.taxaRecebimento.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicadores Detalhados */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 lg:mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
                <h3 className="text-lg font-semibold text-primary-950 mb-4">
                  📈 Indicadores
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-primary-700">
                      Alunos Particulares:
                    </span>
                    <span className="font-semibold text-primary-950">
                      {relatorio.alunosParticulares}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-700">Ticket Médio:</span>
                    <span className="font-semibold text-primary-950">
                      R$ {relatorio.ticketMedio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-700">
                      Mensalidades Pagas:
                    </span>
                    <span className="font-semibold text-green-600">
                      {relatorio.mensalidadesPagas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-700">
                      Mensalidades Pendentes:
                    </span>
                    <span className="font-semibold text-yellow-600">
                      {relatorio.mensalidadesPendentes}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-700">
                      Mensalidades Atrasadas:
                    </span>
                    <span className="font-semibold text-red-600">
                      {relatorio.mensalidadesAtrasadas}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
                <h3 className="text-lg font-semibold text-primary-950 mb-4">
                  💳 Formas de Pagamento
                </h3>
                <div className="space-y-3">
                  {relatorio.formasPagamento.length > 0 ? (
                    relatorio.formasPagamento.map((forma, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <span className="text-primary-700 capitalize">
                            {forma.forma.replace("_", " ")}
                          </span>
                          <div className="text-xs text-primary-500">
                            {forma.quantidade} pagamentos
                          </div>
                        </div>
                        <span className="font-semibold text-primary-950">
                          R$ {forma.valor.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-primary-500 text-center">
                      Nenhum pagamento registrado
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200">
                <h3 className="text-lg font-semibold text-primary-950 mb-4">
                  📅 Próximos Vencimentos
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {relatorio.proximosVencimentos.length > 0 ? (
                    relatorio.proximosVencimentos.map((vencimento, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-yellow-400 pl-3"
                      >
                        <div className="font-medium text-primary-950 text-sm">
                          {vencimento.aluno.nome_completo}
                        </div>
                        <div className="text-xs text-primary-600">
                          {new Date(
                            vencimento.data_vencimento
                          ).toLocaleDateString("pt-BR")}{" "}
                          - R$ {vencimento.valor_mensalidade.toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-primary-500 text-center">
                      Nenhum vencimento próximo
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Gráfico de Faturamento por Mês */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-200 mb-6 lg:mb-8">
              <h3 className="text-lg font-semibold text-primary-950 mb-6">
                📈 Faturamento dos Últimos 12 Meses
              </h3>
              <div className="space-y-3">
                {relatorio.faturamentoPorMes.map((item, index) => {
                  const valorMaximo = Math.max(
                    ...relatorio.faturamentoPorMes.map((m) => m.valor)
                  );
                  const largura =
                    valorMaximo > 0 ? (item.valor / valorMaximo) * 100 : 0;

                  return (
                    <div key={index} className="flex items-center">
                      <div className="w-20 text-sm text-primary-700 font-medium">
                        {item.mes.slice(0, 3)}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-primary-100 rounded-full h-6 relative">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                            style={{
                              width: `${largura}%`,
                              minWidth: item.valor > 0 ? "60px" : "0",
                            }}
                          >
                            {item.valor > 0 && (
                              <span className="text-white text-xs font-medium">
                                R$ {item.valor.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm font-semibold text-primary-950">
                        R$ {item.valor.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-primary-200 text-center py-12">
            <span className="text-5xl mb-4 block">📊</span>
            <h3 className="text-xl font-semibold text-primary-950 mb-2">
              Nenhum dado encontrado
            </h3>
            <p className="text-primary-600">
              Ajuste os filtros para gerar o relatório
            </p>
          </div>
        )}

        {/* Link Voltar */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/mestre")}
            className="text-primary-800 hover:text-primary-950 font-medium transition-colors flex items-center"
          >
            <svg
              width={20}
              height={20}
              fill="currentColor"
              className="mr-2"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M7.28 7.72a.75.75 0 010 1.06l-2.47 2.47H21a.75.75 0 010 1.5H4.81l2.47 2.47a.75.75 0 11-1.06 1.06L2.47 12.53a.75.75 0 010-1.06l3.75-3.75a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
            Voltar ao Painel do Mestre
          </button>
        </div>
      </div>
    </div>
  );
}
