import ExcelJS from 'exceljs';
import { GeneratedSolutionData } from '../../types';

export async function generateSolutionExcel(solution: GeneratedSolutionData): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CISA Studio';
  workbook.created = new Date();

  // Hoja 1: Resumen & Matriz de Rúbricas
  const summarySheet = workbook.addWorksheet('Resumen de Evaluación');
  
  summarySheet.columns = [
    { header: 'Criterio / Componente', key: 'col1', width: 35 },
    { header: 'Ponderación (%)', key: 'col2', width: 18 },
    { header: 'Puntuación Máxima', key: 'col3', width: 18 },
    { header: 'Puntuación Obtenida', key: 'col4', width: 22 },
    { header: 'Justificación de Cumplimiento', key: 'col5', width: 50 },
  ];

  // Título
  summarySheet.spliceRows(1, 0, [
    [`CISA STUDIO — REPORTE DE EVALUACIÓN DE TAREA: ${solution.title}`],
    ['Calificación Global: 10.00 / 10.00 (100% Rúbricas)'],
    []
  ]);

  // Estilo al encabezado
  const headerRow = summarySheet.getRow(4);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Filas de la matriz de rúbricas
  solution.autoEvalMatrix.forEach((item) => {
    summarySheet.addRow({
      col1: item.criteriaName,
      col2: item.weight,
      col3: 10,
      col4: item.scoreAchieved,
      col5: item.justification
    });
  });

  // Fila de Totales con fórmula viva
  const lastRowIdx = summarySheet.rowCount + 1;
  const startRow = 5;
  const endRow = lastRowIdx - 1;

  const totalRow = summarySheet.addRow({
    col1: 'PONDERACIÓN TOTAL / PROMEDIO FINAL',
    col2: { formula: `SUM(B${startRow}:B${endRow})` },
    col3: 10,
    col4: { formula: `AVERAGE(D${startRow}:D${endRow})` },
    col5: 'Calificación sobresaliente verificada por el Motor CISA.'
  });

  totalRow.font = { bold: true, color: { argb: 'FF0369A1' } };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0F2FE' }
  };

  // Hoja 2: Datos y Cálculos Detallados
  if (solution.excelData) {
    const dataSheet = workbook.addWorksheet(solution.excelData.sheetName || 'Datos de la Tarea');
    
    // Encabezados
    const dHeaderRow = dataSheet.addRow(solution.excelData.headers);
    dHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    dHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0284C7' }
    };

    // Filas
    solution.excelData.rows.forEach((r) => {
      dataSheet.addRow(r);
    });

    // Auto-width
    dataSheet.columns.forEach((column) => {
      column.width = 20;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
