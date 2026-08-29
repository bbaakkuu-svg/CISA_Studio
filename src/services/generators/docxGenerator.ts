import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { GeneratedSolutionData } from '../../types';

export async function generateSolutionDocx(solution: GeneratedSolutionData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Portada / Título
          new Paragraph({
            text: 'CISA STUDIO — INGENIERÍA DE SOLUCIONES ACADÉMICAS',
            heading: HeadingLevel.TITLE,
            spacing: { after: 120 }
          }),
          new Paragraph({
            text: solution.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Calificación Estimada: ${solution.scoreEstimated} / 10.00 (Cumplimiento 100% de Rúbricas)`,
                bold: true,
                color: '0284C7'
              }),
              new TextRun({
                text: ` | Fecha: ${new Date(solution.createdAt).toLocaleDateString('es-ES')}`,
                italics: true
              })
            ],
            spacing: { after: 300 }
          }),

          // Resumen Ejecutivo
          new Paragraph({
            text: '1. Resumen Ejecutivo',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 }
          }),
          new Paragraph({
            text: solution.executiveSummary,
            spacing: { after: 240 }
          }),

          // Matriz de Rúbricas
          new Paragraph({
            text: '2. Matriz de Cumplimiento de Criterios Docentes',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Criterio', bold: true })] })],
                    width: { size: 30, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Peso', bold: true })] })],
                    width: { size: 15, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Puntuación', bold: true })] })],
                    width: { size: 15, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Justificación', bold: true })] })],
                    width: { size: 40, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              ...solution.autoEvalMatrix.map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(item.criteriaName)] }),
                      new TableCell({ children: [new Paragraph(`${item.weight}%`)] }),
                      new TableCell({ children: [new Paragraph(`${item.scoreAchieved}/10`)] }),
                      new TableCell({ children: [new Paragraph(item.justification)] })
                    ]
                  })
              )
            ]
          }),

          // Secciones de Desarrollo
          ...solution.sections.flatMap((sec, idx) => [
            new Paragraph({
              text: `${idx + 3}. ${sec.title}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 280, after: 120 }
            }),
            new Paragraph({
              text: sec.content,
              spacing: { after: 160 }
            }),
            ...(sec.subsections?.flatMap((sub) => [
              new Paragraph({
                text: sub.subtitle,
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 120, after: 80 }
              }),
              new Paragraph({
                text: sub.text,
                spacing: { after: 120 }
              })
            ]) || [])
          ])
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
