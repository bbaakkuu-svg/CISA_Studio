import React from 'react';
import { Sparkles, Database, History, Smartphone, ShieldCheck, GraduationCap, Cpu, Layers, Activity } from 'lucide-react';
import { isUsingMockStore } from '../../services/supabaseService';

interface NavbarProps {
  onOpenHistory: () => void;
  tasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHistory, tasksCount }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/10 px-4 sm:px-8 py-3 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & High-Tech Branding */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white font-extrabold border border-white/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-2xl tracking-tight bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300 bg-clip-text text-transparent">
                CISA Studio
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm">
                2.0 PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-1.5">
              <span>IA de Alto Rendimiento Académico</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 100% Rúbricas Garantizadas
              </span>
            </p>
          </div>
        </div>

        {/* Live Workspace KPI Chips & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Chip de Motor IA */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Motor: <strong>CISA Neural Core v2</strong></span>
          </div>

          {/* Chip de Estado Supabase / LocalStore */}
          <div 
            title={isUsingMockStore ? "Operando en modo Mock-Store Local transparente (sin backend requerido)" : "Conectado en tiempo real a Supabase PostgreSQL"}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm ${
              isUsingMockStore 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isUsingMockStore ? 'Mock-Store Activo' : 'Supabase Conectado'}</span>
          </div>

          {/* Botón de Historial con Badge Pulsante */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 hover:border-cyan-400 transition-all duration-300 shadow-md shadow-black/40 active:scale-95 group"
          >
            <History className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="hidden sm:inline">Historial</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-extrabold border border-cyan-500/30">
              {tasksCount}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
