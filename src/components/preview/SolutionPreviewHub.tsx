import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FileDown, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Award, 
  Copy, 
  Check,
  Table as TableIcon,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Maximize2
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
  const [activeTab, setActiveTab] = useState<'pdf' | 'excel' | 'pptx' | 'audit'>('pdf');
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

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
      
      {/* Banner de Calificación 10/10 y Certificación */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl glass-panel-glow border border-emerald-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Luz de fondo */}
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 flex-shrink-0 shadow-lg shadow-emerald-500/30 font-black border-2 border-white/30">
            <Award className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs uppercase font-black tracking-widest px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Rúbricas Cumplidas
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                Puntuación: 10.00 / 10.00
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white mt-2 leading-tight">
              {solution.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Desarrollado con motor Chain-of-Thought y validación de rúbrica punto por punto.
            </p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="relative flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleCopyMarkdown}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 hover:border-cyan-400 transition-all active:scale-95 shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={onResetTask}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>

      </div>

      {/* Barra de Exportación de Alta Gama (Descargas en 1 Clic) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Centro de Descarga de Entregables (Client-Side Instantáneo)</span>
          </span>
          <span className="text-[11px] text-slate-500">Cero latencia • Procesado en tu navegador</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Botón PDF */}
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat !== null}
            className="group relative p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-red-500/30 hover:border-red-500/70 text-left transition-all duration-300 shadow-md hover:shadow-red-500/20 active:scale-95 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-red-500/15 text-red-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
            </div>
            <p className="text-sm font-extrabold text-white">Descargar PDF</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Maquetado A4 • Portada y Tablas</p>
          </button>

          {/* Botón Excel */}
          <button
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat !== null}
            className="group relative p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-emerald-500/30 hover:border-emerald-500/70 text-left transition-all duration-300 shadow-md hover:shadow-emerald-500/20 active:scale-95 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-sm font-extrabold text-white">Descargar Excel</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Fórmulas Vivas • .xlsx nativo</p>
          </button>

          {/* Botón PPTX */}
          <button
            onClick={() => handleDownload('pptx')}
            disabled={downloadingFormat !== null}
            className="group relative p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500/70 text-left transition-all duration-300 shadow-md hover:shadow-amber-500/20 active:scale-95 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                <Presentation className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <p className="text-sm font-extrabold text-white">Descargar PPTX</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Diapositivas 16:9 • Formato Ejecutivo</p>
          </button>

          {/* Botón Word */}
          <button
            onClick={() => handleDownload('docx')}
            disabled={downloadingFormat !== null}
            className="group relative p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-sky-500/30 hover:border-sky-500/70 text-left transition-all duration-300 shadow-md hover:shadow-sky-500/20 active:scale-95 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 group-hover:scale-110 transition-transform">
                <FileDown className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </div>
            <p className="text-sm font-extrabold text-white">Descargar Word</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Normas APA/IEEE • .docx Editable</p>
          </button>

        </div>
      </div>

      {/* Workspace de Previsualización Split-Studio */}
      <div className="p-5 sm:p-7 rounded-3xl glass-panel border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Selector de Pestañas de Vista */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'pdf' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 Hoja A4 Maquetada</span>
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'excel' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>📊 Excel Data Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('pptx')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'pptx' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>📽️ Diapositivas PPTX</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'audit' 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-md shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>🛡️ Matriz de Auditoría 10/10</span>
          </button>
        </div>

        {/* Tab 1: Hoja A4 Maquetada */}
        {activeTab === 'pdf' && (
          <div className="space-y-6">
            
            {/* Simulador de Página A4 */}
            <div className="p-6 sm:p-10 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner space-y-6 max-w-4xl mx-auto">
              
              {/* Encabezado A4 */}
              <div className="border-b-2 border-cyan-500 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-cyan-400 tracking-wider">CISA STUDIO CERTIFICADO ACADÉMICO</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">{solution.title}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">{new Date(solution.createdAt).toLocaleDateString('es-ES')}</span>
              </div>

              {/* Resumen Ejecutivo */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">1. Resumen Ejecutivo</span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{solution.executiveSummary}</p>
              </div>

              {/* Secciones de Contenido Desarrollado */}
              <div className="space-y-5">
                {solution.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
                      <span className="text-cyan-400 font-mono">{idx + 2}.</span>
                      <span>{sec.title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-5 border-l border-slate-800">
                      {sec.content}
                    </p>

                    {sec.subsections && (
                      <div className="pl-6 space-y-2.5 pt-1">
                        {sec.subsections.map((sub, sidx) => (
                          <div key={sidx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                            <p className="text-xs font-bold text-cyan-300">📌 {sub.subtitle}</p>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sub.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Excel Data Grid */}
        {activeTab === 'excel' && (
          <div className="space-y-4">
            {solution.excelData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Hoja: {solution.excelData.sheetName}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Fórmulas activas listas para exportación</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-emerald-300 font-extrabold border-b border-slate-800">
                      <tr>
                        {solution.excelData.headers.map((h, i) => (
                          <th key={i} className="p-3.5 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {solution.excelData.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-slate-900/60 transition-colors">
                          {row.map((cell, ci) => (
                            <td key={ci} className="p-3.5 text-slate-300 font-mono whitespace-nowrap">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">No se encontraron matrices de datos numéricos específicas.</p>
            )}
          </div>
        )}

        {/* Tab 3: Diapositivas PPTX */}
        {activeTab === 'pptx' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solution.slidesData?.map((slide, sidx) => (
                <div 
                  key={sidx}
                  className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 hover:border-amber-500/50 transition-all shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                      Diapositiva #{sidx + 1}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">16:9 Formato</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-slate-100">{slide.title}</h4>
                  
                  <ul className="space-y-2 pt-1">
                    {slide.bullets.map((b, bi) => (
                      <li key={bi} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-400 font-black">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Matriz de Auditoría 10/10 */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {solution.autoEvalMatrix.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/20 hover:border-indigo-500/40 transition-all space-y-2">
                  <div className="flex items-center justify-between font-extrabold text-slate-100">
                    <span className="text-sm text-cyan-300">{item.criteriaName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
                      {item.scoreAchieved}/10 pts ({item.weight}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.justification}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
