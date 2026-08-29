import React from 'react';
import { 
  Scale, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Zap
} from 'lucide-react';
import { RubricCriteria } from '../../types';
import { calculateTotalRubricWeight, autoBalanceRubrics } from '../../utils/validators';

interface RubricsCalibratorPanelProps {
  rubrics: RubricCriteria[];
  onUpdateRubric: (id: string, updated: Partial<RubricCriteria>) => void;
  onSetRubrics: (rubrics: RubricCriteria[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const RubricsCalibratorPanel: React.FC<RubricsCalibratorPanelProps> = ({
  rubrics,
  onUpdateRubric,
  onSetRubrics,
  onNext,
  onBack
}) => {
  const totalWeight = calculateTotalRubricWeight(rubrics);
  const isPerfect100 = totalWeight === 100;
  const isUnder = totalWeight < 100;
  const isOver = totalWeight > 100;

  const handleAutoBalance = () => {
    const balanced = autoBalanceRubrics(rubrics);
    if (balanced.length > 0) {
      onSetRubrics(balanced);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-sky-400" />
            <span>3. Calibrador de Rúbricas (Suma 100%)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajusta los porcentajes de cada criterio para garantizar el 100% de la calificación docente.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoBalance}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-colors self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span>Auto-Balancear al 100%</span>
        </button>
      </div>

      {/* Barra de Balance Semántico */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPerfect100 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-xs font-semibold text-slate-200">
              {isPerfect100
                ? 'Ponderación Perfecta (100%)'
                : isUnder
                ? `Faltan ${100 - totalWeight}% para completar el 100%`
                : `Excede en ${totalWeight - 100}% el total`}
            </span>
          </div>

          <span
            className={`font-mono text-sm font-bold ${
              isPerfect100 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {totalWeight}%
          </span>
        </div>

        {/* Barra de Progreso Lineal */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isPerfect100
                ? 'bg-emerald-500'
                : isOver
                ? 'bg-red-500'
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
      </div>

      {/* Ajustadores Individuales de Criterio */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-300 block">
          Ponderación por Criterio
        </span>

        {rubrics.length === 0 ? (
          <div className="text-center p-8 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
            No hay criterios cargados. Regresa al paso 2 para añadirlos.
          </div>
        ) : (
          <div className="space-y-2.5">
            {rubrics.map((r, idx) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200 truncate">{r.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={r.weightPercentage}
                      onChange={(e) =>
                        onUpdateRubric(r.id, {
                          weightPercentage: Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        })
                      }
                      className="w-14 text-right bg-slate-950 border border-slate-800 rounded-md px-2 py-0.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                    />
                    <span className="text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={r.weightPercentage}
                  onChange={(e) =>
                    onUpdateRubric(r.id, { weightPercentage: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />

                <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                  "{r.descriptionMaxLevel}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navegación */}
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
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-sm"
        >
          <span>Continuar a Formato</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
