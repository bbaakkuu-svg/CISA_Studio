import React from 'react';
import { 
  FolderOpen, 
  ListChecks, 
  Scale, 
  FileType, 
  FileCheck2, 
  Check, 
  Sparkles 
} from 'lucide-react';

export type WorkflowTabId = 'files' | 'rubrics' | 'calibrator' | 'format' | 'output';

interface WorkflowTabBarProps {
  currentTab: WorkflowTabId;
  onSelectTab: (tab: WorkflowTabId) => void;
  filesCount: number;
  rubricsCount: number;
  rubricsTotalWeight: number;
  targetFormat: string;
  hasSolution: boolean;
  isGenerating: boolean;
}

export const WorkflowTabBar: React.FC<WorkflowTabBarProps> = ({
  currentTab,
  onSelectTab,
  filesCount,
  rubricsCount,
  rubricsTotalWeight,
  targetFormat,
  hasSolution,
  isGenerating
}) => {
  const tabs = [
    {
      id: 'files' as WorkflowTabId,
      step: '1',
      title: 'Archivos',
      icon: FolderOpen,
      badge: filesCount > 0 ? `${filesCount}` : undefined,
      isCompleted: filesCount > 0
    },
    {
      id: 'rubrics' as WorkflowTabId,
      step: '2',
      title: 'Rúbricas',
      icon: ListChecks,
      badge: rubricsCount > 0 ? `${rubricsCount}` : undefined,
      isCompleted: rubricsCount > 0
    },
    {
      id: 'calibrator' as WorkflowTabId,
      step: '3',
      title: 'Calibrador',
      icon: Scale,
      badge: `${rubricsTotalWeight}%`,
      isCompleted: rubricsTotalWeight === 100,
      isWarning: rubricsTotalWeight !== 100
    },
    {
      id: 'format' as WorkflowTabId,
      step: '4',
      title: 'Formato',
      icon: FileType,
      badge: targetFormat.toUpperCase(),
      isCompleted: true
    },
    {
      id: 'output' as WorkflowTabId,
      step: '5',
      title: 'Solución',
      icon: FileCheck2,
      badge: isGenerating ? 'Procesando' : hasSolution ? 'Listo' : undefined,
      isCompleted: hasSolution,
      isSpecial: true
    }
  ];

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-1.5 backdrop-blur-md shadow-sm">
      <nav className="grid grid-cols-2 sm:grid-cols-5 gap-1" aria-label="Tabs del flujo">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {/* Indicador de Paso / Check */}
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-extrabold'
                    : tab.isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.isCompleted && !isActive ? (
                  <Check className="w-3 h-3" />
                ) : (
                  tab.step
                )}
              </div>

              {/* Icono y Nombre */}
              <div className="flex items-center gap-1.5 truncate">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{tab.title}</span>
              </div>

              {/* Badge opcional en pantallas medianas */}
              {tab.badge && (
                <span
                  className={`hidden md:inline-block ml-auto text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-slate-700 text-sky-200'
                      : tab.isWarning
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
