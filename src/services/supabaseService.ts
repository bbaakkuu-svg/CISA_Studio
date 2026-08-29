import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TaskRecord, TaskFileItem, RubricCriteria, GeneratedSolutionData, UserProfile } from '../types';

// Leer variables de entorno si existen
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('.supabase.co') && 
  !supabaseUrl.includes('tu-proyecto')
);

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isUsingMockStore = !isConfigured;

// --- MOCK-STORE LOCALSTORAGE FALLBACK ---
const STORAGE_KEY_TASKS = 'cisa_tasks_store_v1';
const STORAGE_KEY_PROFILE = 'cisa_user_profile_v1';

function getStoredTasks(): TaskRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) return getDefaultDemoTasks();
    return JSON.parse(raw);
  } catch {
    return getDefaultDemoTasks();
  }
}

function saveStoredTasks(tasks: TaskRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.warn('LocalStorage full or restricted:', e);
  }
}

export const supabaseService = {
  isMock: isUsingMockStore,

  async getProfile(): Promise<UserProfile> {
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (data) return data;
        }
      } catch (e) {
        console.warn('Error fetching Supabase profile, using fallback:', e);
      }
    }
    
    // Fallback Mock Profile
    const local = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (local) return JSON.parse(local);

    const defaultProfile: UserProfile = {
      id: 'mock-user-cisa-01',
      email: 'estudiante@cisa.edu',
      fullName: 'Estudiante de Alto Rendimiento',
      role: 'student',
      defaultOutputFormat: 'pdf'
    };
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  async getAllTasks(): Promise<TaskRecord[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, task_files(*), rubrics(*), solutions(*)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            targetFormat: t.target_format,
            status: t.status,
            currentPhase: t.current_phase,
            progressPercentage: t.progress_percentage,
            files: (t.task_files || []).map((f: any) => ({
              id: f.id,
              name: f.file_name,
              size: f.file_size_bytes,
              type: f.file_type,
              role: f.role,
              extractedText: f.extracted_text
            })),
            rubrics: (t.rubrics || []).map((r: any) => ({
              id: r.id,
              name: r.criteria_name,
              weightPercentage: Number(r.weight_percentage),
              maxScore: Number(r.max_score),
              descriptionMaxLevel: r.description_max_level,
              evaluationHints: r.evaluation_hints
            })),
            solution: t.solutions?.[0] ? {
              id: t.solutions[0].id,
              taskId: t.id,
              title: t.title,
              executiveSummary: t.solutions[0].markdown_content?.substring(0, 200) || '',
              markdownContent: t.solutions[0].markdown_content,
              autoEvalMatrix: t.solutions[0].auto_eval_matrix || [],
              scoreEstimated: Number(t.solutions[0].score_estimated || 10),
              sections: t.solutions[0].structured_json?.sections || [],
              excelData: t.solutions[0].structured_json?.excelData,
              slidesData: t.solutions[0].structured_json?.slidesData,
              createdAt: t.solutions[0].created_at
            } : undefined,
            createdAt: t.created_at,
            updatedAt: t.updated_at
          }));
        }
      } catch (e) {
        console.warn('Fallo consultando Supabase, usando mock store:', e);
      }
    }
    return getStoredTasks();
  },

  async saveTask(task: TaskRecord): Promise<TaskRecord> {
    const tasks = getStoredTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      tasks.unshift({ ...task, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    saveStoredTasks(tasks);

    // Si Supabase está conectado, persistir también
    if (supabase) {
      try {
        await supabase.from('tasks').upsert({
          id: task.id,
          title: task.title,
          description: task.description,
          target_format: task.targetFormat,
          status: task.status,
          current_phase: task.currentPhase,
          progress_percentage: task.progressPercentage,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Sync a Supabase diferido:', e);
      }
    }
    return task;
  },

  async deleteTask(taskId: string): Promise<void> {
    const tasks = getStoredTasks().filter((t) => t.id !== taskId);
    saveStoredTasks(tasks);
    if (supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch (e) {
        console.warn('Error deleting from Supabase:', e);
      }
    }
  }
};

function getDefaultDemoTasks(): TaskRecord[] {
  return [
    {
      id: 'demo-task-amazon-sustainability',
      title: 'Auditoría de Sostenibilidad Logística (Amazon Logistics)',
      description: 'Informe técnico integral sobre reducción de huella de carbono y cumplimiento de ODS.',
      targetFormat: 'pdf',
      status: 'completed',
      currentPhase: 'ready',
      progressPercentage: 100,
      files: [
        {
          id: 'file-01',
          name: 'Enunciado_Caso_Amazon.pdf',
          size: 1450000,
          type: 'application/pdf',
          role: 'statement'
        },
        {
          id: 'file-02',
          name: 'Rubrica_Evaluacion_Docente.pdf',
          size: 420000,
          type: 'application/pdf',
          role: 'rubric'
        }
      ],
      rubrics: [
        {
          id: 'r-1',
          name: 'Rigor Metodológico y Cuantitativo',
          weightPercentage: 35,
          maxScore: 10,
          descriptionMaxLevel: 'Análisis numérico con fórmulas de emisión CO2 y proyecciones a 2030.'
        },
        {
          id: 'r-2',
          name: 'Alineación Estratégica con ODS',
          weightPercentage: 35,
          maxScore: 10,
          descriptionMaxLevel: 'Vincular cada propuesta con ODS 7, 9, 12 y 13 con KPIs verificables.'
        },
        {
          id: 'r-3',
          name: 'Claridad, Estructura y Formato',
          weightPercentage: 30,
          maxScore: 10,
          descriptionMaxLevel: 'Estructura impecable, maquetación ejecutiva y tablas de soporte.'
        }
      ],
      solution: {
        id: 'sol-demo-01',
        taskId: 'demo-task-amazon-sustainability',
        title: 'Auditoría de Sostenibilidad Logística (Amazon)',
        executiveSummary: 'Propuesta de optimización para la flota de última milla con transición a vehículos eléctricos y optimización de rutas mediante algoritmos de grafos.',
        markdownContent: '# Auditoría de Sostenibilidad Logística\n\nPlan integral de descarbonización...',
        scoreEstimated: 10.00,
        createdAt: new Date().toISOString(),
        autoEvalMatrix: [
          {
            criteriaName: 'Rigor Metodológico y Cuantitativo',
            weight: 35,
            scoreAchieved: 10,
            justification: 'Se incluyen modelos matemáticos de cálculo de emisiones (GREET) y ahorro proyectado de 42.5 toneladas métricas.',
            evidenceSnippets: ['Cálculo de reducción de kW/h', 'Tabla de amortización a 5 años']
          },
          {
            criteriaName: 'Alineación Estratégica con ODS',
            weight: 35,
            scoreAchieved: 10,
            justification: 'Mapeo detallado de 4 ODS con indicadores GRI y métricas Scope 1 y Scope 2.',
            evidenceSnippets: ['Matriz de impacto ODS 12 y 13']
          },
          {
            criteriaName: 'Claridad, Estructura y Formato',
            weight: 30,
            scoreAchieved: 10,
            justification: 'Formato profesional con portada ejecutiva, diagramas y redacción fluida.',
            evidenceSnippets: ['Diseño estilizado con paleta corporativa']
          }
        ],
        sections: [
          {
            title: 'Diagnóstico de Situación Actual de Emisiones',
            content: 'La operación logística actual genera un promedio de 285 g de CO2 por paquete entregado. La mayor ineficiencia se concentra en la congestión urbana y entregas fallidas en primer intento.'
          },
          {
            title: 'Estrategia de Electrificación y Reducción',
            content: 'Se implementa un plan de recarga nocturna con energía solar fotovoltaica en centros de distribución y micro-hubs de proximidad.'
          },
          {
            title: 'Métricas de Impacto y Retorno de Inversión (ROI)',
            content: 'El costo por paquete desciende de 1.85€ a 1.22€ tras el mes 14, logrando un ahorro neto del 34% operativo anual.'
          }
        ],
        excelData: {
          sheetName: 'Proyecciones Financieras',
          headers: ['Año', 'Flota Eléctrica (%)', 'Ahorro Diésel (€)', 'Inversión (€)', 'Emisiones Evitadas (Tn)'],
          rows: [
            ['2026', '25%', 120000, 350000, 180],
            ['2027', '50%', 290000, 280000, 420],
            ['2028', '80%', 510000, 150000, 780],
            ['2029', '100%', 740000, 50000, 1150]
          ]
        },
        slidesData: [
          {
            title: 'Diagnóstico & Desafíos Logísticos',
            bullets: [
              'Huella de carbono actual: 285 g CO2 / paquete',
              'Cuello de botella en entrega de última milla',
              'Exigencia regulatoria europea Euro 7'
            ]
          },
          {
            title: 'Plan de Acción y Electrificación',
            bullets: [
              'Transición a 100% furgonetas eléctricas para 2029',
              'Instalación de micro-hubs urbanos con taquillas inteligentes',
              'Algoritmo predictivo de rutas con IA'
            ]
          }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}
