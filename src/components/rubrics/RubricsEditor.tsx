import React from 'react';
import { Plus, Trash2, CheckCircle, Sparkles, BookOpen, Layers } from 'lucide-react';
import { RubricCriteria } from '../../types';
import { RubricWeightGauge } from './RubricWeightGauge';

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
  const totalWeight = rubrics.reduce((acc, r) => acc + (r.weightPercentage || 0), 0);

  const handleAutoBalance = () => {
    if (rubrics.length === 0) return;
    const equalShare = parseFloat((100 / rubrics.length).toFixed(1));
    const balanced = rubrics.map((r, idx) => {
      // Ajustar redondeo en el último elemento
      if (idx === rubrics.length - 1) {
        const currentSum = equalShare * (rubrics.length - 1);
        return { ...r, weightPercentage: parseFloat((100 - currentSum).toFixed(1)) };
      }
      return { ...r, weightPercentage: equalShare };
    });
    onSetRubrics(balanced);
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
      descriptionMaxLevel: 'Cumplimiento exhaustivo de todos los puntos solicitados por el docente.'
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Indicador Semántico 100% */}
      <RubricWeightGauge
        totalWeight={totalWeight}
        onAutoBalance={handleAutoBalance}
      />

      {/* Plantillas Preconfiguradas Rápidas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-xs font-semibold whitespace-nowrap">
          Plantillas:
        </span>
        <button
          type="button"
          onClick={() => handleApplyPreset('engineering')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors"
        >
          ⚙️ Ingeniería & Cálculo
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('business')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 whitespace-nowrap transition-colors"
        >
          📊 Negocios & Finanzas
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('programming')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 whitespace-nowrap transition-colors"
        >
          💻 Código & Software
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('academic')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 whitespace-nowrap transition-colors"
        >
          📘 Ensayo Académico
        </button>
      </div>

      {/* Lista de Criterios */}
      <div className="space-y-3">
        {rubrics.map((r, index) => (
          <div
            key={r.id}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-3 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              
              {/* Nombre del Criterio */}
              <div className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={r.name}
                  onChange={(e) => onUpdateRubric(r.id, { name: e.target.value })}
                  placeholder="Nombre del criterio (ej: Claridad metodológica)"
                  className="glass-input rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold w-full"
                />
              </div>

              {/* Ponderación y Botón Eliminar */}
              <div className="flex items-center gap-2 justify-end">
                <div className="flex items-center gap-1 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                  <span className="text-xs text-slate-400 font-medium">Peso:</span>
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
                    className="w-12 bg-transparent text-xs sm:text-sm font-bold text-cyan-300 text-right outline-none"
                  />
                  <span className="text-xs text-cyan-400 font-bold">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveRubric(r.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Exigencia para la Máxima Nota */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Exigencia del Docente para Calificación Máxima (10/10):
              </label>
              <textarea
                rows={2}
                value={r.descriptionMaxLevel}
                onChange={(e) => onUpdateRubric(r.id, { descriptionMaxLevel: e.target.value })}
                placeholder="Describe qué requiere el profesor para otorgar la máxima puntuación en este criterio..."
                className="w-full glass-input rounded-lg p-2 text-xs resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botón Añadir Criterio */}
      <button
        type="button"
        onClick={handleAddNewEmpty}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-cyan-400/60 bg-slate-900/40 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-300 text-xs sm:text-sm font-semibold transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Añadir Criterio de Rúbrica Personalizado</span>
      </button>

    </div>
  );
};
