import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { WorkflowTabBar, WorkflowTabId } from './components/layout/WorkflowTabBar';
import { TaskHistoryDrawer } from './components/history/TaskHistoryDrawer';

import { FilesIngestPanel } from './components/panels/FilesIngestPanel';
import { RubricsInputPanel } from './components/panels/RubricsInputPanel';
import { RubricsCalibratorPanel } from './components/panels/RubricsCalibratorPanel';
import { FormatSelectorPanel } from './components/panels/FormatSelectorPanel';
import { ExecutionPreviewPanel } from './components/panels/ExecutionPreviewPanel';

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
import { calculateTotalRubricWeight } from './utils/validators';

export function App() {
  // Estado de Pestañas / Paneles Desacoplados
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowTabId>('files');
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

  // Carga de Caso Demostrativo
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
      alert('Por favor sube al menos un archivo (enunciado/captura) o escribe las instrucciones en el Paso 1.');
      setActiveWorkflowTab('files');
      return;
    }

    try {
      setIsGenerating(true);
      setCurrentSolution(null);
      setActiveWorkflowTab('output');

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

      // Disparar confeti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Guardar Tarea en Supabase / LocalStore
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
    setActiveWorkflowTab('files');
  };

  const handleSelectTaskFromHistory = (task: TaskRecord) => {
    setTitle(task.title);
    setDirectPrompt(task.description || '');
    setTargetFormat(task.targetFormat);
    setFiles(task.files);
    setRubrics(task.rubrics);
    if (task.solution) {
      setCurrentSolution(task.solution);
      setActiveWorkflowTab('output');
    } else {
      setActiveWorkflowTab('files');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabaseService.deleteTask(taskId);
    await loadTasks();
  };

  const totalRubricsWeight = calculateTotalRubricWeight(rubrics);

  return (
    <div className="min-h-screen flex flex-col pb-20 sm:pb-10 text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Barra Superior Minimalista */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewTask={handleResetTask}
        tasksCount={savedTasks.length}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Barra de Pestañas / Paneles Desacoplados */}
        <WorkflowTabBar
          currentTab={activeWorkflowTab}
          onSelectTab={setActiveWorkflowTab}
          filesCount={files.length}
          rubricsCount={rubrics.length}
          rubricsTotalWeight={totalRubricsWeight}
          targetFormat={targetFormat}
          hasSolution={currentSolution !== null}
          isGenerating={isGenerating}
        />

        {/* Panel Contenedor Nítido */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Panel 1: Ingesta de Archivos */}
          {activeWorkflowTab === 'files' && (
            <FilesIngestPanel
              title={title}
              onChangeTitle={setTitle}
              directPrompt={directPrompt}
              onChangeDirectPrompt={setDirectPrompt}
              files={files}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              onChangeRole={handleChangeRole}
              onLoadDemo={handleLoadDemoTask}
              onNext={() => setActiveWorkflowTab('rubrics')}
            />
          )}

          {/* Panel 2: Ingesta de Rúbricas */}
          {activeWorkflowTab === 'rubrics' && (
            <RubricsInputPanel
              rubrics={rubrics}
              onAddRubric={handleAddRubric}
              onUpdateRubric={handleUpdateRubric}
              onRemoveRubric={handleRemoveRubric}
              onSetRubrics={setRubrics}
              onNext={() => setActiveWorkflowTab('calibrator')}
              onBack={() => setActiveWorkflowTab('files')}
            />
          )}

          {/* Panel 3: Calibrador de Rúbricas */}
          {activeWorkflowTab === 'calibrator' && (
            <RubricsCalibratorPanel
              rubrics={rubrics}
              onUpdateRubric={handleUpdateRubric}
              onSetRubrics={setRubrics}
              onNext={() => setActiveWorkflowTab('format')}
              onBack={() => setActiveWorkflowTab('rubrics')}
            />
          )}

          {/* Panel 4: Selector de Formato */}
          {activeWorkflowTab === 'format' && (
            <FormatSelectorPanel
              targetFormat={targetFormat}
              onChangeFormat={setTargetFormat}
              title={title}
              files={files}
              rubrics={rubrics}
              onExecuteResolution={handleExecuteResolution}
              onBack={() => setActiveWorkflowTab('calibrator')}
              isGenerating={isGenerating}
            />
          )}

          {/* Panel 5: Proceso & Solución Generada */}
          {activeWorkflowTab === 'output' && (
            <ExecutionPreviewPanel
              isGenerating={isGenerating}
              currentPhase={currentPhase}
              progressPercentage={progressPercentage}
              statusMessage={statusMessage}
              solution={currentSolution}
              onResetTask={handleResetTask}
              onGoToTab={setActiveWorkflowTab}
            />
          )}

        </div>

      </main>

      {/* Drawer Lateral del Historial */}
      <TaskHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        tasks={savedTasks}
        onSelectTask={handleSelectTaskFromHistory}
        onDeleteTask={handleDeleteTask}
        onNewTask={handleResetTask}
      />

      {/* Barra de Navegación Inferior Móvil */}
      <BottomNav
        activeTab={activeWorkflowTab === 'output' ? 'preview' : 'generator'}
        onSelectTab={(tab) => {
          if (tab === 'history') {
            setIsHistoryOpen(true);
          } else if (tab === 'preview') {
            setActiveWorkflowTab('output');
          } else if (tab === 'rubrics') {
            setActiveWorkflowTab('rubrics');
          } else {
            setActiveWorkflowTab('files');
          }
        }}
        onNewTask={handleResetTask}
        hasSolution={currentSolution !== null}
      />

    </div>
  );
}

export default App;
