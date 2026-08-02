import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Atestado, FilterState, TurnoOption, User } from '../types';

export async function exportAtestadosToPDF(
  atestados: Atestado[],
  filters: FilterState,
  turnosList: TurnoOption[],
  user: User
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const dataEmissao = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Cabeçalho institucional
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA DE GESTÃO DE ATESTADOS ACADÊMICOS', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Oficial de Controle de Afastamentos Médicos', 14, 18);

  // Metadados do Relatório
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DA EMISSÃO:', 14, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Emitido por: ${user.nome} (${user.role === 'admin' ? 'Administrador' : 'Usuário Comum'})`, 14, 37);
  doc.text(`Data/Hora de Emissão: ${dataEmissao}`, 14, 42);
  doc.text(`Total de Atestados Encontrados: ${atestados.length}`, 14, 47);

  // Resumo de Filtros Aplicados
  let filtrosText = [];
  if (filters.busca) filtrosText.push(`Busca: "${filters.busca}"`);
  if (filters.curso !== 'todos') filtrosText.push(`Curso: ${filters.curso}`);
  if (filters.periodo !== 'todos') filtrosText.push(`Período: ${filters.periodo}`);
  if (filters.turnoId !== 'todos') {
    const turnoObj = turnosList.find(t => t.id === filters.turnoId);
    if (turnoObj) filtrosText.push(`Turno: ${turnoObj.nome}`);
  }
  if (filters.dataInicioFiltro) filtrosText.push(`De: ${filters.dataInicioFiltro}`);
  if (filters.dataFiltroTermino) filtrosText.push(`Até: ${filters.dataFiltroTermino}`);

  const strFiltros = filtrosText.length > 0 ? filtrosText.join(' | ') : 'Nenhum (Todos os registros)';

  doc.setFont('helvetica', 'bold');
  doc.text('Filtros Aplicados:', 160, 32);
  doc.setFont('helvetica', 'normal');
  const splitFiltros = doc.splitTextToSize(strFiltros, 120);
  doc.text(splitFiltros, 160, 37);

  // Linha separadora
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.line(14, 52, 283, 52);

  // Tabela de Dados
  const tableHead = [
    [
      'Nº',
      'Nome do Aluno',
      'Curso',
      'Turno / Período',
      'Data Entrega',
      'Afastamento',
      'Horário',
      'Dias',
      'Motivo / CID',
    ],
  ];

  const tableBody = atestados.map((item, index) => {
    const turnoObj = turnosList.find(t => t.id === item.turnoId);
    const turnoText = turnoObj ? `${turnoObj.codigo} (${item.turnoPeriodo})` : item.turnoPeriodo;

    // Calcular diferença de dias
    const dInicio = new Date(item.dataInicio);
    const dTermino = new Date(item.dataTermino);
    const diffTime = Math.abs(dTermino.getTime() - dInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const dataEntregaFmt = formatDateBR(item.dataEntrega);
    const periodoFmt = `${formatDateBR(item.dataInicio)} a ${formatDateBR(item.dataTermino)}`;
    const horaFmt = `${item.horaInicio} às ${item.horaTermino}`;

    return [
      (index + 1).toString(),
      item.nomeAluno,
      item.curso,
      turnoText,
      dataEntregaFmt,
      periodoFmt,
      horaFmt,
      `${diffDays} dia(s)`,
      item.motivo || 'N/I',
    ];
  });

  autoTable(doc, {
    startY: 56,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // Nº
      1: { cellWidth: 42 }, // Nome
      2: { cellWidth: 38 }, // Curso
      3: { cellWidth: 32 }, // Turno
      4: { cellWidth: 22, halign: 'center' }, // Entrega
      5: { cellWidth: 42, halign: 'center' }, // Afastamento
      6: { cellWidth: 25, halign: 'center' }, // Horário
      7: { cellWidth: 16, halign: 'center' }, // Dias
      8: { cellWidth: 'auto' }, // Motivo
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      // Rodapé em todas as páginas
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      // Linha de rodapé
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 200, 283, 200);

      doc.text(
        'Documento gerado eletronicamente pelo Sistema de Gestão de Atestados. Validade institucional.',
        14,
        205
      );
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        283,
        205,
        { align: 'right' }
      );
    },
  });

  // Posição final após a tabela
  let finalY = (doc as any).lastAutoTable.finalY || 120;

  // Inserir Gráfico em Pizza de Distribuição por Turno
  const chartElement = document.getElementById('turno-pie-chart-container');
  let capturedImage = false;

  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Substituir funções de cor oklch(...) não suportadas pelo html2canvas em tags <style>
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((styleEl) => {
            if (styleEl.textContent) {
              styleEl.textContent = styleEl.textContent.replace(/oklch\([^)]+\)/g, '#64748b');
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 269; // Largura total imprimível
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const chartBoxHeight = Math.min(imgHeight, 75);

      // Se não couber na página atual (altura máx do papel é 210mm, margem inferior é 200mm)
      if (finalY + chartBoxHeight + 10 > 190) {
        doc.addPage();
        finalY = 25;
      } else {
        finalY += 10;
      }

      doc.addImage(imgData, 'PNG', 14, finalY, imgWidth, chartBoxHeight);
      capturedImage = true;
    } catch (e) {
      console.warn('Aviso: Utilizando renderização nativa em vetor para o gráfico no PDF.');
    }
  }

  // Se não foi possível capturar via html2canvas, desenha nativamente no PDF
  if (!capturedImage) {
    drawNativePieChartSection(doc, atestados, finalY);
  }

  // Salvar/baixar o arquivo PDF
  const filename = `Relatorio_Atestados_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function drawNativePieChartSection(doc: jsPDF, atestados: Atestado[], startY: number) {
  let finalY = startY;
  if (finalY + 70 > 190) {
    doc.addPage();
    finalY = 25;
  } else {
    finalY += 8;
  }

  const total = atestados.length;

  // Container do Gráfico
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, finalY, 269, 68, 3, 3, 'FD');

  // Título da Seção
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('DISTRIBUIÇÃO DE ATESTADOS POR TURNO', 22, finalY + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Proporção percentual e quantitativo total por turno de atendimento', 22, finalY + 15);

  // Calcular contagens por turno
  const shiftCounts: Record<string, number> = {};
  atestados.forEach(item => {
    const key = item.turnoPeriodo || 'Outros';
    shiftCounts[key] = (shiftCounts[key] || 0) + 1;
  });

  const shifts = ['Matutino', 'Vespertino', 'Noturno', 'EMIEP', 'Outros'];
  const colors: Record<string, [number, number, number]> = {
    Matutino: [245, 158, 11],  // Amber
    Vespertino: [249, 115, 22], // Orange
    Noturno: [99, 102, 241],   // Indigo
    EMIEP: [16, 185, 129],     // Emerald
    Outros: [100, 116, 139],   // Slate
  };

  // Centro do Gráfico em Pizza
  const cx = 75;
  const cy = finalY + 42;
  const radius = 20;

  let currentAngle = -Math.PI / 2;

  shifts.forEach(shift => {
    const count = shiftCounts[shift] || 0;
    if (count === 0 || total === 0) return;

    const sliceAngle = (count / total) * 2 * Math.PI;
    const color = colors[shift] || colors.Outros;

    doc.setFillColor(color[0], color[1], color[2]);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);

    const steps = Math.max(12, Math.ceil((sliceAngle / (2 * Math.PI)) * 50));
    const points: [number, number][] = [[cx, cy]];

    for (let i = 0; i <= steps; i++) {
      const angle = currentAngle + (sliceAngle * i) / steps;
      points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }

    for (let i = 1; i < points.length - 1; i++) {
      doc.triangle(cx, cy, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], 'F');
    }

    currentAngle += sliceAngle;
  });

  // Furo do Donut em Branco
  doc.setFillColor(248, 250, 252);
  doc.circle(cx, cy, 10, 'F');

  // Total no Centro
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${total}`, cx, cy + 1, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Total', cx, cy + 5, { align: 'center' });

  // Legendas à Direita
  let lx = 145;
  let ly = finalY + 22;

  shifts.forEach((shift) => {
    const count = shiftCounts[shift] || 0;
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const color = colors[shift] || colors.Outros;

    // Marcador colorido
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(lx, ly, 4, 4, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Turno ${shift}`, lx + 7, ly + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${count} atestado(s) (${pct}%)`, lx + 50, ly + 3.5);

    // Barra de progresso
    doc.setFillColor(226, 232, 240);
    doc.rect(lx + 95, ly + 1, 30, 2.5, 'F');
    if (Number(pct) > 0) {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(lx + 95, ly + 1, Math.min(30, (30 * Number(pct)) / 100), 2.5, 'F');
    }

    ly += 8.5;
  });
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
