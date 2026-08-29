import React from 'react';
import { AlertCircle, CheckCircle2, Scale, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface RubricWeightGaugeProps {
  totalWeight: number;
  onAutoBalance: () => void;
}

export const RubricWeightGauge: React.FC<RubricWeightGaugeProps> = ({
  totalWeight,
  onAutoBalance
}) => {
  const isPerfect = Math.abs(totalWeight - 100) < 0.01;
  const isOver = totalWeight > 100;
  const isUnder = totalWeight < 100;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-500 shadow-xl ${
        isPerfect
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-teal-950/60 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
          : isOver
          ? 'bg-gradient-to-r from-red-950/60 via-slate-900/90 to-amber-950/60 border-red-500/40 text-red-300 shadow-red-500/10'
          : 'bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-cyan-950/60 border-amber-500/40 text-amber-300 shadow-amber-500/10'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Medidor Radial y Texto */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
              isPerfect ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              {isPerfect ? (
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
              ) : (
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                Ponderación Total: <span className={isPerfect ? 'text-emerald-400' : isOver ? 'text-red-400' : 'text-amber-400'}>{totalWeight.toFixed(1)}%</span> / 100%
              </span>
              {isPerfect && (
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Óptimo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300/80 mt-0.5 leading-relaxed">
              {isPerfect
                ? 'Alineación perfecta al 100%. La solución responderá estrictamente al criterio de nota máxima.'
                : isUnder
                ? `Falta un ${(100 - totalWeight).toFixed(1)}% para completar el 100% de la evaluación del docente.`
                : `Exceso de ${(totalWeight - 100).toFixed(1)}%. Ajusta las ponderaciones para calibrar.`}
            </p>
          </div>
        </div>

        {/* Botón de Auto-Equilibrado con Micro-animación */}
        {!isPerfect && (
          <button
            type="button"
            onClick={onAutoBalance}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-black text-white border border-cyan-400/40 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <Scale className="w-4 h-4" />
            <span>Auto-Equilibrar a 100%</span>
          </button>
        )}

      </div>

      {/* Barra de Energía Continua */}
      <div className="w-full bg-slate-950/80 h-2.5 rounded-full mt-3.5 overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isPerfect
              ? 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 shadow-md shadow-emerald-500/50'
              : isOver
              ? 'bg-gradient-to-r from-amber-400 to-red-500 shadow-md shadow-red-500/50'
              : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 shadow-md shadow-cyan-500/50'
          }`}
          style={{ width: `${Math.min(totalWeight, 100)}%` }}
        />
      </div>
    </div>
  );
};
