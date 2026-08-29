import React from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  Layers,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileDown,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { GeneratedSolutionData, GenerationPhase } from '../../types';
import { SolutionPreviewHub } from '../preview/SolutionPreviewHub';
import { LiveProgressStepper } from '../stepper/LiveProgressStepper';

interface ExecutionPreviewPanelProps {
  isGenerating: boolean;
  currentPhase: GenerationPhase;
  progressPercentage: number;
  statusMessage: string;
  solution: GeneratedSolutionData | null;
  onResetTask: () => void;
  onGoToTab: (tab: any) => void;
}

export const ExecutionPreviewPanel: React.FC<ExecutionPreviewPanelProps> = ({
  isGenerating,
  currentPhase,
  progressPercentage,
  statusMessage,
  solution,
  onResetTask,
  onGoToTab
}) => {
  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>5. Procesando Solución Académica...</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            El motor CISA está analizando los enunciados, alineando cada rúbrica al 100% y generando el documento.
          </p>
        </div>

        <LiveProgressStepper
          currentPhase={currentPhase}
          progressPercentage={progressPercentage}
          statusMessage={statusMessage}
        />
      </div>
    );
  }

  if (solution) {
    return (
      <div className="space-y-6">
        <SolutionPreviewHub
          solution={solution}
          onResetTask={onResetTask}
        />
      </div>
    );
  }

  return (
    <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
        <FileCheck2 className="w-6 h-6 text-sky-400" />
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <h3 className="text-sm sm:text-base font-bold text-white">
          Aún no se ha generado ninguna solución
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Completa los pasos previos de Ingesta, Rúbricas y Formato para iniciar la generación optimizada al 100%.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onGoToTab('files')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all duration-150 active:scale-95"
      >
        <span>Comenzar en el Paso 1 (Archivos)</span>
      </button>
    </div>
  );
};
