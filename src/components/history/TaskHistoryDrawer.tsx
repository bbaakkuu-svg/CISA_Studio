import React from 'react';
import { X, Clock, Trash2, CheckCircle2, ChevronRight, FileText, Plus, Database } from 'lucide-react';
import { TaskRecord } from '../../types';

interface TaskHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskRecord[];
  onSelectTask: (task: TaskRecord) => void;
  onDeleteTask: (taskId: string) => void;
  onNewTask: () => void;
}

export const TaskHistoryDrawer: React.FC<TaskHistoryDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  onDeleteTask,
  onNewTask
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full glass-panel border-l border-slate-800 p-5 flex flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">Historial de Tareas</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                {tasks.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewTask();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Tarea</span>
          </button>
        </div>

        {/* Lista de Tareas */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2.5 pr-1">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>No hay tareas guardadas aún.</p>
              <p className="mt-1">Crea una nueva resolución para comenzar.</p>
            </div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                className="group p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between gap-3"
                onClick={() => {
                  onSelectTask(t);
                  onClose();
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      t.status === 'completed' 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {t.targetFormat.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {t.files.length} archivos • {t.rubrics.length} rúbricas
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(t.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Persistencia Híbrida</span>
          </span>
          <span>CISA Studio v1.0</span>
        </div>

      </div>
    </div>
  );
};
