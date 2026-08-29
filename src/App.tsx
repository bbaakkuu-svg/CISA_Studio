import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  CheckSquare, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FileDown, 
  Code2, 
  Settings, 
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { GlassCard } from './components/layout/GlassCard';
import { UniversalDropzone } from './components/dropzone/UniversalDropzone';
import { RubricsEditor } from './components/rubrics/RubricsEditor';
import { LiveProgressStepper } from './components/stepper/LiveProgressStepper';
import { SolutionPreviewHub } from './components/preview/SolutionPreviewHub';
import { TaskHistoryDrawer } from './components/history/TaskHistoryDrawer';

import { 
  TaskRecord, 
  TaskFileItem, 
  RubricCriteria, 
  TargetOutputFormat, 
  GenerationPhase, 
  GeneratedSolutionData 
} from './types';
import { supabaseService } from './services/supabaseService';
import { executeCisaResolutionPipeline } from './services/cisaEngine';

export function App() {
  // Estado de Navegación
  const [activeTab, setActiveTab] = useState<'generator' | 'rubrics' | 'preview' | 'history'>('generator');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Estado del Formulario de Tarea
  const [title, setTitle] = useState('');
  const [directPrompt, setDirectPrompt] = useState('');
  const [targetFormat, setTargetFormat] = useState<TargetOutputFormat>('pdf');
  const [files, setFiles] = useState<TaskFileItem[]>([]);
  const [rubrics, setRubrics] = useState<RubricCriteria[]>([
    {
      id: 'r-default-1',
      name: 'Rigor y Exactitud de la Solución',
      weightPercentage: 40,
      maxScore: 10,
      descriptionMaxLevel: 'Resolución completa sin omisiones ni errores conceptuales.'
    },
    {
      id: 'r-default-2',
      name: 'Estructura, Justificación y Metodología',
      weightPercentage: 35,
      maxScore: 10,
      descriptionMaxLevel: 'Procedimiento justificado paso a paso con evidencia y datos.'
    },
    {
      id: 'r-default-3',
      name: 'Formato y Calidad de Presentación',
      weightPercentage: 25,
      maxScore: 10,
      descriptionMaxLevel: 'Maquetación impecable en el formato solicitado con portada y tablas.'
    }
  ]);

  // Estado de Generación y Progreso
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase>('inbox');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Solución Activa
  const [currentSolution, setCurrentSolution] = useState<GeneratedSolutionData | null>(null);

  // Lista de Tareas Guardadas
  const [savedTasks, setSavedTasks] = useState<TaskRecord[]>([]);

  // Carga Inicial
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasks = await supabaseService.getAllTasks();
      setSavedTasks(tasks);
    } catch (e) {
      console.error('Error cargando tareas:', e);
    }
  };

  // Manejo de Archivos
  const handleAddFiles = (newFiles: TaskFileItem[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    if (!title && newFiles.length > 0) {
      const suggestedTitle = newFiles[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(suggestedTitle);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleChangeRole = (fileId: string, role: any) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, role } : f)));
  };

  // Manejo de Rúbricas
  const handleAddRubric = (newRubric: RubricCriteria) => {
    setRubrics((prev) => [...prev, newRubric]);
  };

  const handleUpdateRubric = (id: string, updated: Partial<RubricCriteria>) => {
    setRubrics((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const handleRemoveRubric = (id: string) => {
    setRubrics((prev) => prev.filter((r) => r.id !== id));
  };

  // Ejecución de la Resolución CISA
  const handleExecuteResolution = async () => {
    if (files.length === 0 && !directPrompt.trim()) {
      alert('Por favor sube al menos un archivo (enunciado/captura) o escribe las instrucciones de la tarea.');
      return;
    }

    try {
      setIsGenerating(true);
      setCurrentSolution(null);
      setActiveTab('generator');

      const solution = await executeCisaResolutionPipeline(
        title || 'Tarea Académica CISA',
        files,
        rubrics,
        targetFormat,
        (phase, pct, msg) => {
          setCurrentPhase(phase);
          setProgressPercentage(pct);
          setStatusMessage(msg);
        }
      );

      setCurrentSolution(solution);
      setIsGenerating(false);
      setActiveTab('preview');

      // Disparar confeti de celebración
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Guardar Tarea en Supabase / Mock-Store
      const newTaskRecord: TaskRecord = {
        id: `task-${Date.now()}`,
        title: solution.title,
        description: directPrompt || 'Tarea procesada con CISA Studio',
        targetFormat,
        status: 'completed',
        currentPhase: 'ready',
        progressPercentage: 100,
        files,
        rubrics,
        solution,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await supabaseService.saveTask(newTaskRecord);
      await loadTasks();
    } catch (e) {
      console.error('Error durante la resolución:', e);
      setIsGenerating(false);
      alert('Ocurrió un error procesando la tarea.');
    }
  };

  const handleResetTask = () => {
    setTitle('');
    setDirectPrompt('');
    setFiles([]);
    setCurrentSolution(null);
    setProgressPercentage(0);
    setCurrentPhase('inbox');
    setActiveTab('generator');
  };

  const handleSelectTaskFromHistory = (task: TaskRecord) => {
    setTitle(task.title);
    setDirectPrompt(task.description || '');
    setTargetFormat(task.targetFormat);
    setFiles(task.files);
    setRubrics(task.rubrics);
    if (task.solution) {
      setCurrentSolution(task.solution);
      setActiveTab('preview');
    } else {
      setActiveTab('generator');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabaseService.deleteTask(taskId);
    await loadTasks();
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 sm:pb-12 text-slate-100">
      
      {/* Barra de Navegación Superior */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        tasksCount={savedTasks.length}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Cabecera / Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Motor de Resolución Orientado al 100% de la Nota</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Resuelve Cualquier Tarea con Máxima Calificación
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sube el enunciado y las rúbricas del docente. CISA calibrará cada respuesta para obtener el 100% de la puntuación en PDF, Excel, PowerPoint o Word.
          </p>
        </div>

        {/* Stepper de Progreso en Vivo (Cuando se está generando) */}
        {isGenerating && (
          <LiveProgressStepper
            currentPhase={currentPhase}
            progressPercentage={progressPercentage}
            statusMessage={statusMessage}
          />
        )}

        {/* Vista: Solución Lista para Previsualización y Descarga */}
        {!isGenerating && currentSolution && activeTab === 'preview' && (
          <SolutionPreviewHub
            solution={currentSolution}
            onResetTask={handleResetTask}
          />
        )}

        {/* Vista: Formulario de Ingesta y Configuración */}
        {(!currentSolution || activeTab !== 'preview') && !isGenerating && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Columna Izquierda: Ingesta & Enunciado (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <GlassCard className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-base font-bold text-slate-100">
                      1. Ingesta de Tarea & Enunciado
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Paso 1 de 2</span>
                </div>

                {/* Título de la Tarea */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                    Título o Asignatura de la Tarea
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Análisis de Estados Financieros / Práctica de Algoritmos"
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium"
                  />
                </div>

                {/* Dropzone Universal */}
                <UniversalDropzone
                  files={files}
                  onAddFiles={handleAddFiles}
                  onRemoveFile={handleRemoveFile}
                  onChangeRole={handleChangeRole}
                  directPrompt={directPrompt}
                  onChangeDirectPrompt={setDirectPrompt}
                />
              </GlassCard>

            </div>

            {/* Columna Derecha: Rúbricas & Formato de Salida (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <GlassCard className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-slate-100">
                      2. Criterios de Evaluación
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Paso 2 de 2</span>
                </div>

                {/* Selector de Formato de Salida */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Formato de Salida Requerido
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-400' },
                      { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, color: 'text-emerald-400' },
                      { id: 'pptx', label: 'PPTX', icon: Presentation, color: 'text-amber-400' },
                      { id: 'docx', label: 'Word', icon: FileDown, color: 'text-sky-400' }
                    ].map((fmt) => {
                      const Icon = fmt.icon;
                      const isSelected = targetFormat === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setTargetFormat(fmt.id as TargetOutputFormat)}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${fmt.color}`} />
                          <span className="text-[11px] font-bold">{fmt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Editor de Rúbricas Docentes */}
                <RubricsEditor
                  rubrics={rubrics}
                  onAddRubric={handleAddRubric}
                  onUpdateRubric={handleUpdateRubric}
                  onRemoveRubric={handleRemoveRubric}
                  onSetRubrics={setRubrics}
                />

                {/* Botón de Lanzamiento de Resolución */}
                <button
                  type="button"
                  onClick={handleExecuteResolution}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all duration-300 active:scale-95 group"
                >
                  <Zap className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Generar Solución al 100% de la Nota</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

              </GlassCard>

            </div>

          </div>
        )}

      </main>

      {/* Drawer Lateral del Historial */}
      <TaskHistoryDrawer
        isOpen={isHistoryOpen || activeTab === 'history'}
        onClose={() => {
          setIsHistoryOpen(false);
          if (activeTab === 'history') setActiveTab('generator');
        }}
        tasks={savedTasks}
        onSelectTask={handleSelectTaskFromHistory}
        onDeleteTask={handleDeleteTask}
        onNewTask={handleResetTask}
      />

      {/* Barra de Navegación Inferior Móvil (ApkFlow / Pantallas pequeñas) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'history') {
            setIsHistoryOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onNewTask={handleResetTask}
        hasSolution={currentSolution !== null}
      />

    </div>
  );
}
export default App;
