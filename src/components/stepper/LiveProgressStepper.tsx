import React from 'react';
import { CheckCircle2, Loader2, Sparkles, FileSearch, Cpu, CheckSquare, FileDown } from 'lucide-react';
import { GenerationPhase } from '../../types';

interface LiveProgressStepperProps {
  currentPhase: GenerationPhase;
  progressPercentage: number;
  statusMessage: string;
}

const PHASES: { id: GenerationPhase; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'detection', label: 'Detección', icon: FileSearch },
  { id: 'normalization', label: 'Normalización', icon: Cpu },
  { id: 'rubric_analysis', label: 'Rúbrica 100%', icon: CheckSquare },
  { id: 'solution_generation', label: 'Generación', icon: Sparkles },
  { id: 'exporting', label: 'Compilación', icon: FileDown }
];

export const LiveProgressStepper: React.FC<LiveProgressStepperProps> = ({
  currentPhase,
  progressPercentage,
  statusMessage
}) => {
  const getPhaseStatus = (phaseId: GenerationPhase) => {
    const phaseOrder: GenerationPhase[] = ['inbox', 'detection', 'normalization', 'rubric_analysis', 'solution_generation', 'exporting', 'ready'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const thisIndex = phaseOrder.indexOf(phaseId);

    if (currentPhase === 'ready' || thisIndex < currentIndex) return 'completed';
    if (thisIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header del Progreso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-100">
              Motor CISA en Ejecución
            </h4>
            <p className="text-xs text-cyan-400 font-medium animate-pulse">
              {statusMessage || 'Procesando tarea...'}
            </p>
          </div>
        </div>

        <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          {progressPercentage}%
        </span>
      </div>

      {/* Barra de Progreso Continua */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/40"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Stepper de Fases */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {PHASES.map((phase) => {
          const status = getPhaseStatus(phase.id);
          const Icon = phase.icon;

          return (
            <div
              key={phase.id}
              className={`flex flex-col items-center text-center p-2 rounded-xl border transition-all duration-300 ${
                status === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : status === 'active'
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div className="p-1.5 rounded-lg mb-1">
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : status === 'active' ? (
                  <Loader2 className="w-4 h-4 text-cyan-300 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-bold leading-tight">
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
