import React from 'react';
import { Plus, Trash2, CheckCircle, Sparkles, BookOpen, Layers, Sliders, Wand2, Lightbulb } from 'lucide-react';
import { RubricCriteria } from '../../types';
import { RubricWeightGauge } from './RubricWeightGauge';
import { calculateTotalRubricWeight, autoBalanceRubrics } from '../../utils/validators';

interface RubricsEditorProps {
  rubrics: RubricCriteria[];
  onAddRubric: (rubric: RubricCriteria) => void;
  onUpdateRubric: (id: string, updated: Partial<RubricCriteria>) => void;
  onRemoveRubric: (id: string) => void;
  onSetRubrics: (rubrics: RubricCriteria[]) => void;
}

export const RubricsEditor: React.FC<RubricsEditorProps> = ({
  rubrics,
  onAddRubric,
  onUpdateRubric,
  onRemoveRubric,
  onSetRubrics
}) => {
  const totalWeight = calculateTotalRubricWeight(rubrics);

  const handleAutoBalance = () => {
    const balanced = autoBalanceRubrics(rubrics);
    if (balanced.length > 0) {
      onSetRubrics(balanced);
    }
  };

  const handleApplyPreset = (type: 'engineering' | 'business' | 'programming' | 'academic') => {
    let preset: RubricCriteria[] = [];
    if (type === 'engineering') {
      preset = [
        {
          id: `r-${Date.now()}-1`,
          name: 'Rigor Matemático & Modelado',
          weightPercentage: 40,
          maxScore: 10,
          descriptionMaxLevel: 'Cálculos exhaustivos sin omisiones, fórmulas explícitas y análisis dimensional.'
        },
        {
          id: `r-${Date.now()}-2`,
          name: 'Metodología & Simulación',
          weightPercentage: 35,
          maxScore: 10,
          descriptionMaxLevel: 'Procedimiento justificado paso a paso y contraste con estándares.'
        },
        {
          id: `r-${Date.now()}-3`,
          name: 'Conclusiones & Formato Técnico',
          weightPercentage: 25,
          maxScore: 10,
          descriptionMaxLevel: 'Interpretación de resultados, tablas de datos y maquetación profesional.'
        }
      ];
    } else if (type === 'business') {
      preset = [
        {
          id: `r-${Date.now()}-1`,
          name: 'Análisis Estratégico & Mercado',
          weightPercentage: 35,
          maxScore: 10,
          descriptionMaxLevel: 'Diagnóstico con matrices FODA, PESTEL y datos de mercado verificados.'
        },
        {
          id: `r-${Date.now()}-2`,
          name: 'Proyecciones Financieras & KPIs',
          weightPercentage: 35,
          maxScore: 10,
          descriptionMaxLevel: 'Modelos de ingresos, ROI, flujo de caja y análisis de punto de equilibrio.'
        },
        {
          id: `r-${Date.now()}-3`,
          name: 'Plan de Acción & Mitigación',
          weightPercentage: 30,
          maxScore: 10,
          descriptionMaxLevel: 'Cronograma de implementación y gestión de riesgos operativos.'
        }
      ];
    } else if (type === 'programming') {
      preset = [
        {
          id: `r-${Date.now()}-1`,
          name: 'Arquitectura & Modularidad',
          weightPercentage: 40,
          maxScore: 10,
          descriptionMaxLevel: 'Código limpio (Clean Code), separación de capas y patrones de diseño.'
        },
        {
          id: `r-${Date.now()}-2`,
          name: 'Eficiencia Algorítmica & Tests',
          weightPercentage: 35,
          maxScore: 10,
          descriptionMaxLevel: 'Complejidad computacional óptima y pruebas unitarias exhaustivas.'
        },
        {
          id: `r-${Date.now()}-3`,
          name: 'Documentación & Tipado',
          weightPercentage: 25,
          maxScore: 10,
          descriptionMaxLevel: 'Tipado estricto, README completo con instrucciones de compilación.'
        }
      ];
    } else {
      preset = [
        {
          id: `r-${Date.now()}-1`,
          name: 'Marco Teórico & Referencias',
          weightPercentage: 35,
          maxScore: 10,
          descriptionMaxLevel: 'Citas en formato APA/IEEE de fuentes académicas reconocidas.'
        },
        {
          id: `r-${Date.now()}-2`,
          name: 'Profundidad de Argumentación',
          weightPercentage: 40,
          maxScore: 10,
          descriptionMaxLevel: 'Desarrollo crítico sin divagaciones y respuesta a todas las preguntas.'
        },
        {
          id: `r-${Date.now()}-3`,
          name: 'Ortografía & Estilo Académico',
          weightPercentage: 25,
          maxScore: 10,
          descriptionMaxLevel: 'Redacción académica impecable, estructura de ensayo formal.'
        }
      ];
    }
    onSetRubrics(preset);
  };

  const handleAddNewEmpty = () => {
    onAddRubric({
      id: `rubric-${Date.now()}`,
      name: `Nuevo Criterio ${rubrics.length + 1}`,
      weightPercentage: 0,
      maxScore: 10,
      descriptionMaxLevel: 'Cumplimiento exhaustivo de todos los puntos solicitados por el docente para 10/10.'
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Medidor Semántico de 100% */}
      <RubricWeightGauge
        totalWeight={totalWeight}
        onAutoBalance={handleAutoBalance}
      />

      {/* Chips de Presets Rápidos */}
      <div className="space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Plantillas de Rúbricas Inteligentes</span>
        </span>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('engineering')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-cyan-300 transition-all active:scale-95 shadow-sm"
          >
            <span>⚙️ Ingeniería</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('business')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/80 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-emerald-300 transition-all active:scale-95 shadow-sm"
          >
            <span>📊 Finanzas</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('programming')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/40 text-xs font-bold text-indigo-300 transition-all active:scale-95 shadow-sm"
          >
            <span>💻 Software</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('academic')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/80 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-amber-300 transition-all active:scale-95 shadow-sm"
          >
            <span>📘 Académico</span>
          </button>
        </div>
      </div>

      {/* Lista de Tarjetas de Criterios */}
      <div className="space-y-3 pt-1">
        {rubrics.map((r, index) => (
          <div
            key={r.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-md space-y-3 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Título del Criterio */}
              <div className="flex items-center gap-2.5 flex-1">
                <span className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-black flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={r.name}
                  onChange={(e) => onUpdateRubric(r.id, { name: e.target.value })}
                  placeholder="Nombre del criterio (ej: Claridad metodológica)"
                  className="glass-input rounded-xl px-3 py-2 text-xs sm:text-sm font-bold w-full"
                />
              </div>

              {/* Control de Peso con Slider & Input Numérico */}
              <div className="flex items-center gap-3 justify-end">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Peso:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={r.weightPercentage === 0 ? '' : r.weightPercentage}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      onUpdateRubric(r.id, { weightPercentage: isNaN(val) ? 0 : Math.min(100, Math.max(0, val)) });
                    }}
                    className="w-12 bg-transparent text-xs sm:text-sm font-black text-cyan-300 text-right outline-none font-mono"
                  />
                  <span className="text-xs text-cyan-400 font-bold">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveRubric(r.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Slider de Ponderación Dinámico */}
            <div className="flex items-center gap-3 px-1">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={r.weightPercentage}
                onChange={(e) => onUpdateRubric(r.id, { weightPercentage: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Exigencia para la Máxima Nota */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Requisito del Docente para Calificación Máxima (10/10):</span>
              </label>
              <textarea
                rows={2}
                value={r.descriptionMaxLevel}
                onChange={(e) => onUpdateRubric(r.id, { descriptionMaxLevel: e.target.value })}
                placeholder="Describe qué exige el profesor para otorgar la máxima puntuación en este criterio..."
                className="w-full glass-input rounded-xl p-2.5 text-xs resize-none leading-relaxed placeholder:text-slate-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botón Añadir Criterio */}
      <button
        type="button"
        onClick={handleAddNewEmpty}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-400/60 bg-slate-950/40 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-300 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>Añadir Criterio de Rúbrica Personalizado</span>
      </button>

    </div>
  );
};
