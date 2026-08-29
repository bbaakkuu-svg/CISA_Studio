import { jsPDF } from 'jspdf';
import { GeneratedSolutionData } from '../../types';

export async function generateSolutionPdf(solution: GeneratedSolutionData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // --- PORTADA Y ENCABEZADO PROFESIONAL ---
  // Barra superior decorativa
  doc.setFillColor(14, 165, 233); // Cyan
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Insignia CISA
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');
  
  doc.setTextColor(56, 189, 248); // Cyan text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CISA STUDIO — INGENIERÍA DE SOLUCIONES ACADÉMICAS', margin + 8, y + 10);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(solution.title.substring(0, 48), margin + 8, y + 20);

  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Calificación Estimada: ${solution.scoreEstimated}/10 (100% Rúbricas) | Fecha: ${new Date(solution.createdAt).toLocaleDateString('es-ES')}`, margin + 8, y + 27);

  y += 42;

  // --- RESUMEN EJECUTIVO ---
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('1. Resumen Ejecutivo de la Solución', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(solution.executiveSummary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 8;

  // --- MATRIZ DE AUTO-EVALUACIÓN Y RÚBRICAS ---
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Matriz de Cumplimiento de Rúbricas (Auditoría 100%)', margin, y);
  y += 7;

  // Tabla de Rúbricas
  solution.autoEvalMatrix.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 18, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 18, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`Criterio: ${item.criteriaName} (${item.weight}% - Nota: ${item.scoreAchieved}/10)`, margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const justLines = doc.splitTextToSize(`Justificación: ${item.justification}`, contentWidth - 8);
    doc.text(justLines, margin + 4, y + 12);

    y += 22;
  });

  y += 5;

  // --- SECCIONES DE CONTENIDO DESARROLLADO ---
  solution.sections.forEach((sec, idx) => {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 3}. ${sec.title}`, margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const contentLines = doc.splitTextToSize(sec.content, contentWidth);
    doc.text(contentLines, margin, y);
    y += contentLines.length * 4.8 + 6;

    if (sec.subsections) {
      sec.subsections.forEach((sub) => {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`• ${sub.subtitle}`, margin + 4, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const subLines = doc.splitTextToSize(sub.text, contentWidth - 8);
        doc.text(subLines, margin + 6, y);
        y += subLines.length * 4.5 + 4;
      });
    }
  });

  // Pie de página en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CISA Studio • Solución Académica Certificada • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      288,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}
