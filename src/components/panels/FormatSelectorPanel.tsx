import React from 'react';
import { 
  FileType, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FileDown, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TargetOutputFormat, TaskFileItem, RubricCriteria } from '../../types';
import { calculateTotalRubricWeight } from '../../utils/validators';

interface FormatSelectorPanelProps {
  targetFormat: TargetOutputFormat;
  onChangeFormat: (format: TargetOutputFormat) => void;
  title: string;
  files: TaskFileItem[];
  rubrics: RubricCriteria[];
  onExecuteResolution: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export const FormatSelectorPanel: React.FC<FormatSelectorPanelProps> = ({
  targetFormat,
  onChangeFormat,
  title,
  files,
  rubrics,
  onExecuteResolution,
  onBack,
  isGenerating
}) => {
  const totalWeight = calculateTotalRubricWeight(rubrics);
  const isPerfect100 = totalWeight === 100;

  const formats = [
    {
      id: 'pdf' as TargetOutputFormat,
      label: 'Documento PDF',
      icon: FileText,
      color: 'text-red-400',
      description: 'Maquetación formal para entrega académica o ejecutiva con portada y normas de presentación.'
    },
    {
      id: 'xlsx' as TargetOutputFormat,
      label: 'Libro Excel (.xlsx)',
      icon: FileSpreadsheet,
      color: 'text-emerald-400',
      description: 'Hojas de cálculo con fórmulas dinámicas, tablas de datos analíticos y modelos estructurados.'
    },
    {
      id: 'pptx' as TargetOutputFormat,
      label: 'Presentación PowerPoint (.pptx)',
      icon: Presentation,
      color: 'text-amber-400',
      description: 'Diapositivas 16:9 organizadas por fases, conceptos clave, diagramas y conclusiones.'
    },
    {
      id: 'docx' as TargetOutputFormat,
      label: 'Documento Word (.docx)',
      icon: FileDown,
      color: 'text-sky-400',
      description: 'Documento de texto editable completo estructurado según el estándar APA / IEEE.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileType className="w-5 h-5 text-sky-400" />
            <span>4. Formato de Salida & Resumen Previo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Selecciona el tipo de archivo que necesitas generar y revisa los datos antes de iniciar la inferencia.
          </p>
        </div>
      </div>

      {/* Grid de Formatos */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 block">
          Formato de Entrega Requerido
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formats.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = targetFormat === fmt.id;

            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => onChangeFormat(fmt.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-150 ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-400 shadow-sm'
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {fmt.label}
                    </p>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {fmt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta de Resumen Pre-Vuelo */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
        <span className="font-semibold text-slate-200 block">
          Resumen de la Tarea
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Título</span>
            <span className="font-medium truncate block">{title || 'Tarea Académica'}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Archivos</span>
            <span className="font-medium">{files.length} adjuntos</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Rúbricas</span>
            <span className="font-medium">{rubrics.length} criterios</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Calibración</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                isPerfect100 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isPerfect100 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {totalWeight}%
            </span>
          </div>
        </div>
      </div>

      {/* Botón Principal CTA y Navegación */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>

        <button
          type="button"
          disabled={isGenerating}
          onClick={onExecuteResolution}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-md disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>Generar Solución al 100% de la Nota</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
