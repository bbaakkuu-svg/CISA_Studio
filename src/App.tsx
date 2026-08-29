import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  CheckSquare, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FileDown, 
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Wand2,
  ScanLine,
  Activity
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

  // Carga Rápida de Caso Demostrativo
  const handleLoadDemoTask = () => {
    setTitle('Auditoría de Algoritmos Distribuidos y Rúbricas BFT');
    setDirectPrompt('Desarrollar un sistema de consenso distribuido con tolerancia a fallos bizantinos (BFT) con análisis de latencia, throughput y verificación formal de seguridad matemática.');
    setTargetFormat('pdf');
    setFiles([
      {
        id: 'file-demo-statement',
        name: 'Enunciado_Sistemas_Distribuidos.pdf',
        size: 850000,
        type: 'application/pdf',
        role: 'statement'
      },
      {
        id: 'file-demo-rubric',
        name: 'Criterios_Evaluacion_BFT.pdf',
        size: 320000,
        type: 'application/pdf',
        role: 'rubric'
      }
    ]);
    setRubrics([
      {
        id: 'r-bft-1',
        name: 'Rigor Matemático & Demostración de Seguridad',
        weightPercentage: 40,
        maxScore: 10,
        descriptionMaxLevel: 'Demostración formal del umbral n >= 3f + 1 y resistencia a ataques de partición.'
      },
      {
        id: 'r-bft-2',
        name: 'Arquitectura & Protocolo de Consenso',
        weightPercentage: 35,
        maxScore: 10,
        descriptionMaxLevel: 'Diagrama de fases Pre-Prepare, Prepare, Commit y View-Change detallado.'
      },
      {
        id: 'r-bft-3',
        name: 'Métricas de Throughput & Formato',
        weightPercentage: 25,
        maxScore: 10,
        descriptionMaxLevel: 'Gráficos comparativos de latencia vs TPS y maquetación técnica impecable.'
      }
    ]);
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
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}

      // Guardar Tarea en Supabase / Mock-Store
      const newTaskRecord: TaskRecord = {
        id: `task-${Date.now()}`,
        title: solution.title,
        description: directPrompt || 'Tarea procesada con CISA Studio 2.0',
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
    <div className="min-h-screen flex flex-col pb-24 sm:pb-12 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Barra de Navegación Superior de Nivel SaaS */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        tasksCount={savedTasks.length}
      />

      {/* Contenido Principal / Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Cabecera / Hero Dinámico con Botón de Carga Rápida */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-500/10">
            <Zap className="w-4 h-4 animate-pulse text-cyan-400" />
            <span>Motor de Inferencia Académica 100% Rúbricas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
            Resuelve Cualquier Tarea con Calificación Sobresaliente
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Ingesta universal de archivos, OCR multimodal y alineación estricta a las rúbricas docentes para generar PDFs, hojas de cálculo, presentaciones y documentos.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleLoadDemoTask}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 text-xs font-extrabold border border-cyan-500/40 hover:border-cyan-300 transition-all active:scale-95 shadow-md shadow-cyan-500/10 group"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-125 transition-transform" />
              <span>⚡ Cargar Caso Demostrativo en 1 Clic</span>
            </button>
          </div>
        </div>

        {/* Stepper de Progreso en Vivo (Durante Inferencia) */}
        {isGenerating && (
          <LiveProgressStepper
            currentPhase={currentPhase}
            progressPercentage={progressPercentage}
            statusMessage={statusMessage}
          />
        )}

        {/* Vista: Solución Generada (Hub de Previsualización 4 en 1) */}
        {!isGenerating && currentSolution && activeTab === 'preview' && (
          <SolutionPreviewHub
            solution={currentSolution}
            onResetTask={handleResetTask}
          />
        )}

        {/* Vista: Workspace Dividido (Ingesta + Rúbricas) */}
        {(!currentSolution || activeTab !== 'preview') && !isGenerating && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Columna Izquierda: Ingesta & Enunciado (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <GlassCard className="p-6 sm:p-7 space-y-5 border border-cyan-500/20 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                      <ScanLine className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      1. Ingesta de Tarea & Enunciado
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    Paso 1
                  </span>
                </div>

                {/* Título de la Tarea */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 px-1">
                    Título o Asignatura
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Análisis de Sistemas Distribuidos / Auditoría Financiera"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold"
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
              
              <GlassCard className="p-6 sm:p-7 space-y-6 border border-indigo-500/20 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      2. Calibrador de Rúbricas
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Paso 2
                  </span>
                </div>

                {/* Selector de Formato Holográfico */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 px-1">
                    Formato de Salida Requerido
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-400', sub: 'Normas A4' },
                      { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, color: 'text-emerald-400', sub: 'Fórmulas' },
                      { id: 'pptx', label: 'PPTX', icon: Presentation, color: 'text-amber-400', sub: 'Slides 16:9' },
                      { id: 'docx', label: 'Word', icon: FileDown, color: 'text-sky-400', sub: 'Editable' }
                    ].map((fmt) => {
                      const Icon = fmt.icon;
                      const isSelected = targetFormat === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setTargetFormat(fmt.id as TargetOutputFormat)}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all duration-200 active:scale-95 ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/25 scale-[1.03]'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${fmt.color}`} />
                          <span className="text-xs font-extrabold">{fmt.label}</span>
                          <span className="text-[9px] text-slate-500 font-medium">{fmt.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Editor de Rúbricas con Sliders */}
                <RubricsEditor
                  rubrics={rubrics}
                  onAddRubric={handleAddRubric}
                  onUpdateRubric={handleUpdateRubric}
                  onRemoveRubric={handleRemoveRubric}
                  onSetRubrics={setRubrics}
                />

                {/* Botón de Lanzamiento de Resolución Neuronal */}
                <button
                  type="button"
                  onClick={handleExecuteResolution}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-cyan-500/30 transition-all duration-300 active:scale-95 group border border-white/20"
                >
                  <Zap className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Generar Solución al 100% de la Nota</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
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

      {/* Barra de Navegación Inferior Móvil (ApkFlow) */}
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
