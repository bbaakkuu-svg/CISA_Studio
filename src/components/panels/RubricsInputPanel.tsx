import React from 'react';
import { 
  ListChecks, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Wand2,
  BookOpen,
  Code,
  Briefcase,
  Cpu
} from 'lucide-react';
import { RubricCriteria } from '../../types';

interface RubricsInputPanelProps {
  title: string;
  directPrompt: string;
  rubrics: RubricCriteria[];
  onAddRubric: (rubric: RubricCriteria) => void;
  onUpdateRubric: (id: string, updated: Partial<RubricCriteria>) => void;
  onRemoveRubric: (id: string) => void;
  onSetRubrics: (rubrics: RubricCriteria[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const RubricsInputPanel: React.FC<RubricsInputPanelProps> = ({
  title,
  directPrompt,
  rubrics,
  onAddRubric,
  onUpdateRubric,
  onRemoveRubric,
  onSetRubrics,
  onNext,
  onBack
}) => {
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

  const [isExtracting, setIsExtracting] = React.useState(false);

  const handleExtractAiRubrics = () => {
    if (!title && !directPrompt) {
      alert("Por favor ingresa un título o descripción de la tarea en el Paso 1 para poder extraer rúbricas contextuales.");
      return;
    }

    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      
      const textToAnalyze = `${title} ${directPrompt}`.toLowerCase();
      let extracted: RubricCriteria[] = [];

      // 1. Detección por contexto de Sistemas Distribuidos / Consenso / Computación
      if (
        textToAnalyze.includes('distribuid') ||
        textToAnalyze.includes('consenso') ||
        textToAnalyze.includes('bft') ||
        textToAnalyze.includes('redes') ||
        textToAnalyze.includes('servidor') ||
        textToAnalyze.includes('tps') ||
        textToAnalyze.includes('latencia')
      ) {
        extracted = [
          {
            id: `r-ai-${Date.now()}-1`,
            name: 'Análisis de Arquitectura & Consenso Distribuido',
            weightPercentage: 40,
            maxScore: 10,
            descriptionMaxLevel: 'Demostración formal y diagramas detallados del protocolo de consenso (BFT, Raft o Paxos) con su tolerancia a fallos.'
          },
          {
            id: `r-ai-${Date.now()}-2`,
            name: 'Métricas de Latencia, Rendimiento & Escalabilidad',
            weightPercentage: 35,
            maxScore: 10,
            descriptionMaxLevel: 'Cálculos y gráficas de Throughput (TPS) frente a incremento de nodos concurrentes.'
          },
          {
            id: `r-ai-${Date.now()}-3`,
            name: 'Verificación Formal de Seguridad',
            weightPercentage: 25,
            maxScore: 10,
            descriptionMaxLevel: 'Prueba de consistencia matemática demostrando el umbral n >= 3f + 1 y resistencia ante particiones de red.'
          }
        ];
      }
      // 2. Detección por contexto Contable / Auditoría / Finanzas / Negocios
      else if (
        textToAnalyze.includes('financi') ||
        textToAnalyze.includes('auditor') ||
        textToAnalyze.includes('contab') ||
        textToAnalyze.includes('negocio') ||
        textToAnalyze.includes('kpi') ||
        textToAnalyze.includes('empresa') ||
        textToAnalyze.includes('mercado')
      ) {
        extracted = [
          {
            id: `r-ai-${Date.now()}-1`,
            name: 'Diagnóstico Estratégico & Matrices de Negocio',
            weightPercentage: 35,
            maxScore: 10,
            descriptionMaxLevel: 'Modelado exhaustivo usando matrices FODA, PESTEL y análisis de las 5 fuerzas de Porter con datos reales.'
          },
          {
            id: `r-ai-${Date.now()}-2`,
            name: 'Proyecciones Financieras & Simulación de Escenarios',
            weightPercentage: 35,
            maxScore: 10,
            descriptionMaxLevel: 'Flujo de caja proyectado a 3 años, cálculo de VAN/TIR y análisis del punto de equilibrio (Break-even).'
          },
          {
            id: `r-ai-${Date.now()}-3`,
            name: 'Plan de Mitigación de Riesgos & Auditoría',
            weightPercentage: 30,
            maxScore: 10,
            descriptionMaxLevel: 'Identificación de riesgos operacionales y matrices de control interno alineadas con estándares internacionales.'
          }
        ];
      }
      // 3. Detección por contexto de Programación / Software / Desarrollo / API
      else if (
        textToAnalyze.includes('program') ||
        textToAnalyze.includes('codigo') ||
        textToAnalyze.includes('código') ||
        textToAnalyze.includes('desarroll') ||
        textToAnalyze.includes('software') ||
        textToAnalyze.includes('api') ||
        textToAnalyze.includes('db') ||
        textToAnalyze.includes('frontend') ||
        textToAnalyze.includes('backend')
      ) {
        extracted = [
          {
            id: `r-ai-${Date.now()}-1`,
            name: 'Diseño de Arquitectura & Clean Code',
            weightPercentage: 40,
            maxScore: 10,
            descriptionMaxLevel: 'Separación estricta de responsabilidades, uso correcto de patrones de diseño y código modular autodescriptivo.'
          },
          {
            id: `r-ai-${Date.now()}-2`,
            name: 'Eficiencia de Algoritmos & Cobertura de Tests',
            weightPercentage: 35,
            maxScore: 10,
            descriptionMaxLevel: 'Análisis de complejidad temporal O(n) y cobertura de pruebas unitarias/integración superior al 85%.'
          },
          {
            id: `r-ai-${Date.now()}-3`,
            name: 'Documentación de API & Configuración',
            weightPercentage: 25,
            maxScore: 10,
            descriptionMaxLevel: 'Contratos OpenAPI/Swagger completos y guía de instalación y despliegue rápido en Docker/Cloud.'
          }
        ];
      }
      // 4. Default: Tarea Académica / Ensayo / Investigación General
      else {
        extracted = [
          {
            id: `r-ai-${Date.now()}-1`,
            name: 'Rigor Científico & Citas Bibliográficas',
            weightPercentage: 35,
            maxScore: 10,
            descriptionMaxLevel: 'Referencias exhaustivas a literatura científica indexada bajo el formato APA 7ma Edición.'
          },
          {
            id: `r-ai-${Date.now()}-2`,
            name: 'Profundidad en el Desarrollo & Discusión',
            weightPercentage: 40,
            maxScore: 10,
            descriptionMaxLevel: 'Análisis crítico enlazando los resultados con el estado del arte y respondiendo a cada objetivo secundario.'
          },
          {
            id: `r-ai-${Date.now()}-3`,
            name: 'Estructura Formal & Estilo de Redacción',
            weightPercentage: 25,
            maxScore: 10,
            descriptionMaxLevel: 'Redacción académica formal, sin errores de concordancia y maquetación visual impecable.'
          }
        ];
      }

      onSetRubrics(extracted);
    }, 1200);
  };

  const handleAddNewCriterion = () => {
    onAddRubric({
      id: `rubric-${Date.now()}`,
      name: `Criterio ${rubrics.length + 1}`,
      weightPercentage: 0,
      maxScore: 10,
      descriptionMaxLevel: 'Cumplimiento exhaustivo de todos los puntos solicitados por el docente para calificación 10/10.'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-sky-400" />
            <span>2. Ingesta de Rúbricas & Criterios</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define los criterios de evaluación del profesor o elige una plantilla rápida por disciplina.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Botón Inteligente IA */}
          <button
            type="button"
            onClick={handleExtractAiRubrics}
            disabled={isExtracting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
          >
            {isExtracting ? (
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{isExtracting ? 'Analizando...' : 'Autodetectar por IA'}</span>
          </button>

          {/* Botón Añadir Criterio */}
          <button
            type="button"
            onClick={handleAddNewCriterion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Criterio</span>
          </button>
        </div>
      </div>

      {/* Plantillas Rápidas */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 block">
          Plantillas por Disciplina
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'engineering', label: 'Ingeniería / Ciencias', icon: Cpu },
            { id: 'programming', label: 'Código & Software', icon: Code },
            { id: 'business', label: 'Negocios / Finanzas', icon: Briefcase },
            { id: 'academic', label: 'Ensayo / Humanidades', icon: BookOpen }
          ].map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id as any)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Criterios Ingresados */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-300 block">
          Criterios Configurados ({rubrics.length})
        </span>

        {rubrics.length === 0 ? (
          <div className="text-center p-8 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
            No has agregado ningún criterio. Selecciona una plantilla o añade uno nuevo.
          </div>
        ) : (
          <div className="space-y-2.5">
            {rubrics.map((r, idx) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => onUpdateRubric(r.id, { name: e.target.value })}
                      placeholder="Nombre del criterio de evaluación..."
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-sky-500 text-xs sm:text-sm font-semibold text-white focus:outline-none px-1 py-0.5"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveRubric(r.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={r.descriptionMaxLevel}
                    onChange={(e) => onUpdateRubric(r.id, { descriptionMaxLevel: e.target.value })}
                    placeholder="Descripción del nivel máximo (10/10) requerido en la rúbrica..."
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-slate-300 resize-none font-normal"
                  />
                </div>
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
          <span>Continuar al Calibrador</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
