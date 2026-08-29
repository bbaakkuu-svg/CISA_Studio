import React from 'react';
import { CheckCircle2, Loader2, Sparkles, FileSearch, Cpu, CheckSquare, FileDown, Terminal } from 'lucide-react';
import { GenerationPhase } from '../../types';

interface LiveProgressStepperProps {
  currentPhase: GenerationPhase;
  progressPercentage: number;
  statusMessage: string;
}

const PHASES: { id: GenerationPhase; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'detection', label: '1. Detección', icon: FileSearch },
  { id: 'normalization', label: '2. Normalización', icon: Cpu },
  { id: 'rubric_analysis', label: '3. Rúbricas 100%', icon: CheckSquare },
  { id: 'solution_generation', label: '4. Generación CoT', icon: Sparkles },
  { id: 'exporting', label: '5. Compilación', icon: FileDown }
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
    <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-cyan-500/40 shadow-2xl space-y-6 animate-pulse-glow">
      
      {/* Header del Progreso Neuronal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-500/30">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Inferencia Activa
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Engine CISA 2.0
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-100 mt-1">
              {statusMessage || 'Alineando solución al 100% de la rúbrica...'}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-400 bg-clip-text text-transparent font-mono">
            {progressPercentage}%
          </span>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Progreso
          </p>
        </div>
      </div>

      {/* Barra de Progreso con Gradiente Dinámico */}
      <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/50"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Stepper de Fases Visual */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {PHASES.map((phase) => {
          const status = getPhaseStatus(phase.id);
          const Icon = phase.icon;

          return (
            <div
              key={phase.id}
              className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all duration-300 ${
                status === 'completed'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : status === 'active'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/30 scale-105'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-500 opacity-50'
              }`}
            >
              <div className="p-2 rounded-xl mb-1.5 bg-black/30">
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : status === 'active' ? (
                  <Loader2 className="w-4 h-4 text-cyan-300 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-bold leading-tight">
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Terminal de Eventos en Tiempo Real */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
        <span className="truncate">
          [LOG]: {statusMessage}
        </span>
      </div>

    </div>
  );
};
