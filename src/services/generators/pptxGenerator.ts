import pptxgen from 'pptxgenjs';
import { GeneratedSolutionData } from '../../types';

export async function generateSolutionPptx(solution: GeneratedSolutionData): Promise<Blob> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Tema CISA Studio
  pptx.defineSlideMaster({
    title: 'CISA_MASTER',
    background: { color: '0A0F1D' },
    objects: [
      {
        rect: { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: '0284C7' } }
      },
      {
        text: {
          text: 'CISA STUDIO • GENERADOR BASADO EN RÚBRICAS',
          options: { x: 0.5, y: 7.0, w: 9.0, h: 0.3, color: '64748B', fontSize: 10, fontFace: 'Arial' }
        }
      }
    ]
  });

  // Slide 1: Portada
  const coverSlide = pptx.addSlide({ masterName: 'CISA_MASTER' });
  coverSlide.addText(solution.title, {
    x: 0.8,
    y: 2.2,
    w: 11.5,
    h: 1.5,
    fontSize: 28,
    bold: true,
    color: '38BDF8',
    fontFace: 'Arial'
  });

  coverSlide.addText(`Resolución Completa de Tarea • Puntuación Estimada: ${solution.scoreEstimated}/10 (100% de la Rúbrica)`, {
    x: 0.8,
    y: 3.8,
    w: 11.5,
    h: 0.6,
    fontSize: 16,
    color: 'E2E8F0',
    fontFace: 'Arial'
  });

  // Slide 2: Resumen Ejecutivo y Matriz de Rúbricas
  const summarySlide = pptx.addSlide({ masterName: 'CISA_MASTER' });
  summarySlide.addText('1. Resumen Ejecutivo y Alineación de Rúbricas', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.8,
    fontSize: 22,
    bold: true,
    color: '38BDF8'
  });

  summarySlide.addText(solution.executiveSummary, {
    x: 0.8,
    y: 1.5,
    w: 11.5,
    h: 1.8,
    fontSize: 13,
    color: 'CBD5E1',
    lineSpacing: 22
  });

  const rubricBullets = solution.autoEvalMatrix.map(
    (m) => `✔ Criterio "${m.criteriaName}" (${m.weight}%): ${m.scoreAchieved}/10 - ${m.justification.substring(0, 75)}...`
  );

  summarySlide.addText(rubricBullets.join('\n'), {
    x: 0.8,
    y: 3.5,
    w: 11.5,
    h: 3.0,
    fontSize: 12,
    color: '10B981',
    bullet: true
  });

  // Slides de Contenido
  if (solution.slidesData && solution.slidesData.length > 0) {
    solution.slidesData.forEach((sd) => {
      const slide = pptx.addSlide({ masterName: 'CISA_MASTER' });
      slide.addText(sd.title, {
        x: 0.8,
        y: 0.6,
        w: 11.5,
        h: 0.8,
        fontSize: 22,
        bold: true,
        color: '38BDF8'
      });

      slide.addText(sd.bullets.join('\n\n'), {
        x: 0.8,
        y: 1.6,
        w: 11.5,
        h: 4.8,
        fontSize: 14,
        color: 'E2E8F0',
        bullet: true
      });
    });
  } else {
    // Si no hay slidesData pre-renderizadas, generar a partir de las secciones
    solution.sections.forEach((sec) => {
      const slide = pptx.addSlide({ masterName: 'CISA_MASTER' });
      slide.addText(sec.title, {
        x: 0.8,
        y: 0.6,
        w: 11.5,
        h: 0.8,
        fontSize: 22,
        bold: true,
        color: '38BDF8'
      });

      slide.addText(sec.content, {
        x: 0.8,
        y: 1.6,
        w: 11.5,
        h: 4.8,
        fontSize: 13,
        color: 'E2E8F0',
        lineSpacing: 22
      });
    });
  }

  const output = await pptx.write({ outputType: 'blob' });
  return output as Blob;
}
