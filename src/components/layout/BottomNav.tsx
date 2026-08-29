import React from 'react';
import { Sparkles, CheckSquare, FileText, History, PlusCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'generator' | 'rubrics' | 'preview' | 'history';
  onSelectTab: (tab: 'generator' | 'rubrics' | 'preview' | 'history') => void;
  onNewTask: () => void;
  hasSolution: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onNewTask,
  hasSolution
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/90 px-3 py-2 pb-safe bg-slate-950/90 backdrop-blur-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Tab 1: Ingesta & Enunciado */}
        <button
          onClick={() => onSelectTab('generator')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'generator' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Ingesta</span>
        </button>

        {/* Tab 2: Rúbricas */}
        <button
          onClick={() => onSelectTab('rubrics')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'rubrics' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Rúbricas</span>
        </button>

        {/* Botón Central: Nueva Tarea */}
        <button
          onClick={onNewTask}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* Tab 3: Solución */}
        <button
          disabled={!hasSolution}
          onClick={() => onSelectTab('preview')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            !hasSolution 
              ? 'opacity-40 text-slate-600 cursor-not-allowed' 
              : activeTab === 'preview' 
                ? 'text-cyan-400 font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Solución</span>
        </button>

        {/* Tab 4: Historial */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'history' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Historial</span>
        </button>

      </div>
    </nav>
  );
};
