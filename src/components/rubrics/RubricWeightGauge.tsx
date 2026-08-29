import React from 'react';
import { AlertCircle, CheckCircle2, SlidersHorizontal, Scale } from 'lucide-react';

interface RubricWeightGaugeProps {
  totalWeight: number;
  onAutoBalance: () => void;
}

export const RubricWeightGauge: React.FC<RubricWeightGaugeProps> = ({
  totalWeight,
  onAutoBalance
}) => {
  const isPerfect = totalWeight === 100;
  const isOver = totalWeight > 100;
  const isUnder = totalWeight < 100;

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 ${
        isPerfect
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : isOver
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Estado y Porcentaje */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/20">
            {isPerfect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 animate-bounce" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">
                Ponderación Total: {totalWeight.toFixed(1)}% / 100%
              </span>
              {isPerfect && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  Calibración Óptima
                </span>
              )}
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {isPerfect
                ? 'Los criterios suman exactamente el 100%. La solución cubrirá cada rúbrica con la máxima nota.'
                : isUnder
                ? `Falta un ${(100 - totalWeight).toFixed(1)}% para completar el 100% de la evaluación.`
                : `Exceso de ${(totalWeight - 100).toFixed(1)}%. Ajusta las ponderaciones.`}
            </p>
          </div>
        </div>

        {/* Botón de Auto-Equilibrado */}
        {!isPerfect && (
          <button
            type="button"
            onClick={onAutoBalance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-100 border border-slate-600 hover:border-cyan-400 transition-all active:scale-95 whitespace-nowrap shadow-sm"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto-Equilibrar a 100%</span>
          </button>
        )}

      </div>

      {/* Barra de Progreso Visual */}
      <div className="w-full bg-black/40 h-2 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isPerfect
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
              : isOver
              ? 'bg-gradient-to-r from-amber-400 to-red-500'
              : 'bg-gradient-to-r from-cyan-400 to-amber-400'
          }`}
          style={{ width: `${Math.min(totalWeight, 100)}%` }}
        />
      </div>
    </div>
  );
};
