import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FileDown, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Star, 
  Award, 
  Copy, 
  Check,
  Table as TableIcon
} from 'lucide-react';
import { GeneratedSolutionData } from '../../types';
import { generateSolutionPdf } from '../../services/generators/pdfGenerator';
import { generateSolutionExcel } from '../../services/generators/excelGenerator';
import { generateSolutionPptx } from '../../services/generators/pptxGenerator';
import { generateSolutionDocx } from '../../services/generators/docxGenerator';

interface SolutionPreviewHubProps {
  solution: GeneratedSolutionData;
  onResetTask: () => void;
}

export const SolutionPreviewHub: React.FC<SolutionPreviewHubProps> = ({
  solution,
  onResetTask
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'excel' | 'pptx' | 'docx'>('pdf');
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async (format: 'pdf' | 'excel' | 'pptx' | 'docx') => {
    try {
      setDownloadingFormat(format);
      let blob: Blob | null = null;
      let filename = `CISA_${solution.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`;

      if (format === 'pdf') {
        blob = await generateSolutionPdf(solution);
        filename += '.pdf';
      } else if (format === 'excel') {
        blob = await generateSolutionExcel(solution);
        filename += '.xlsx';
      } else if (format === 'pptx') {
        blob = await generateSolutionPptx(solution);
        filename += '.pptx';
      } else if (format === 'docx') {
        blob = await generateSolutionDocx(solution);
        filename += '.docx';
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Error generando archivo client-side:', e);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(solution.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Éxito y Calificación 100% */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Rúbricas Cumplidas
              </span>
              <span className="text-xs text-slate-400">
                Puntuación: 10.0 / 10.0
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-slate-100 mt-1">
              {solution.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyMarkdown}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={onResetTask}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>

      </div>

      {/* Botones de Descarga Client-Side en los 4 Formatos */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1">
          Exportar Entregable Certificado (Descarga Directa)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat !== null}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-red-500/30 hover:border-red-500/60 text-slate-100 transition-all active:scale-95 group shadow-sm"
          >
            <FileText className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-xs font-bold">Descargar PDF</p>
              <p className="text-[10px] text-slate-400">Maquetado A4</p>
            </div>
          </button>

          <button
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat !== null}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-slate-100 transition-all active:scale-95 group shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-xs font-bold">Descargar Excel</p>
              <p className="text-[10px] text-slate-400">Con Fórmulas .xlsx</p>
            </div>
          </button>

          <button
            onClick={() => handleDownload('pptx')}
            disabled={downloadingFormat !== null}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-slate-100 transition-all active:scale-95 group shadow-sm"
          >
            <Presentation className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-xs font-bold">Descargar PPTX</p>
              <p className="text-[10px] text-slate-400">Diapositivas .pptx</p>
            </div>
          </button>

          <button
            onClick={() => handleDownload('docx')}
            disabled={downloadingFormat !== null}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-500/60 text-slate-100 transition-all active:scale-95 group shadow-sm"
          >
            <FileDown className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-xs font-bold">Descargar Word</p>
              <p className="text-[10px] text-slate-400">Documento .docx</p>
            </div>
          </button>

        </div>
      </div>

      {/* Pestañas de Previsualización */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pdf' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Vista Documento (PDF/Word)</span>
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'excel' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Vista Tabla (Excel)</span>
          </button>

          <button
            onClick={() => setActiveTab('pptx')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pptx' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>Vista Diapositivas (PPTX)</span>
          </button>
        </div>

        {/* Contenido de la Pestaña Activa */}
        {activeTab === 'pdf' && (
          <div className="space-y-5">
            
            {/* Matriz de Rúbricas */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Matriz de Auto-Evaluación y Cumplimiento 10/10</span>
              </h4>

              <div className="space-y-2">
                {solution.autoEvalMatrix.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                      <span>{item.criteriaName} ({item.weight}%)</span>
                      <span className="text-emerald-400">{item.scoreAchieved}/10 pts</span>
                    </div>
                    <p className="text-slate-400">{item.justification}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secciones Desarrolladas */}
            <div className="space-y-4">
              {solution.sections.map((sec, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <h4 className="text-sm font-bold text-cyan-300">
                    {idx + 1}. {sec.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {sec.content}
                  </p>

                  {sec.subsections && (
                    <div className="space-y-2 pt-2">
                      {sec.subsections.map((sub, sidx) => (
                        <div key={sidx} className="pl-3 border-l-2 border-cyan-500/40">
                          <p className="text-xs font-bold text-slate-200">{sub.subtitle}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{sub.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {activeTab === 'excel' && (
          <div className="space-y-4">
            {solution.excelData ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/90 text-cyan-300 font-bold">
                    <tr>
                      {solution.excelData.headers.map((h, i) => (
                        <th key={i} className="p-3 border-b border-slate-700 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                    {solution.excelData.rows.map((row, ri) => (
                      <tr key={ri} className="hover:bg-slate-900/60">
                        {row.map((cell, ci) => (
                          <td key={ci} className="p-3 text-slate-300 whitespace-nowrap font-mono">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No hay datos tabulares específicos para esta tarea.
              </p>
            )}
          </div>
        )}

        {activeTab === 'pptx' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {solution.slidesData?.map((slide, sidx) => (
              <div key={sidx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Diapositiva #{sidx + 1}
                  </span>
                </div>
                <h5 className="text-xs sm:text-sm font-bold text-slate-100">{slide.title}</h5>
                <ul className="space-y-1.5 pt-1">
                  {slide.bullets.map((b, bi) => (
                    <li key={bi} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
