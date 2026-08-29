import React from 'react';
import { Sparkles, Database, History, Smartphone, ShieldCheck, GraduationCap } from 'lucide-react';
import { isUsingMockStore } from '../../services/supabaseService';

interface NavbarProps {
  onOpenHistory: () => void;
  tasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHistory, tasksCount }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                CISA Studio
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Ingeniería de Soluciones Académicas & Rúbricas al 100%
            </p>
          </div>
        </div>

        {/* Acciones y Badges de Estado */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Badge de Base de Datos / Mock-Store */}
          <div 
            title={isUsingMockStore ? "Operando en modo Mock-Store Local transparente (sin backend requerido)" : "Conectado en tiempo real a Supabase PostgreSQL"}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
              isUsingMockStore 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isUsingMockStore ? 'Mock-Store Local' : 'Supabase Conectado'}</span>
          </div>

          {/* Badge Móvil / ApkFlow */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            <span>ApkFlow Ready</span>
          </div>

          {/* Botón Historial de Tareas */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all duration-200 hover:border-cyan-500/40 active:scale-95"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Historial</span>
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold flex items-center justify-center">
              {tasksCount}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
