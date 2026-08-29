import React from 'react';
import { History, GraduationCap, Database, PlusCircle } from 'lucide-react';
import { isUsingMockStore } from '../../services/supabaseService';

interface NavbarProps {
  onOpenHistory: () => void;
  onNewTask: () => void;
  tasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHistory, onNewTask, tasksCount }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo Minimalista */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-sky-400 font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                CISA Studio
              </span>
              <span className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
              Generador de Tareas Académicas Basado en Rúbricas
            </p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Indicador de Almacenamiento */}
          <div 
            title={isUsingMockStore ? "Almacenamiento Local (Mock-Store)" : "Conectado a Supabase"}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 bg-slate-900/60 border border-slate-800"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">{isUsingMockStore ? 'Local' : 'Cloud'}</span>
          </div>

          {/* Botón Nueva Tarea */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Nueva Tarea</span>
          </button>

          {/* Botón Historial */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span>Historial</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
              {tasksCount}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
