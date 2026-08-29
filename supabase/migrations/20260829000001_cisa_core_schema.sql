-- =============================================================================
-- CISA STUDIO: ESQUEMA DE BASE DE DATOS PRINCIPAL (PostgreSQL / Supabase)
-- Versión: 1.0.0
-- Autor: Agente 3 (Backend & Base de Datos)
-- Revisor: Agente 4 (Auditor & Seguridad)
-- =============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: profiles (Información de usuario vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'educator', 'researcher', 'admin')),
    default_output_format TEXT DEFAULT 'pdf' CHECK (default_output_format IN ('pdf', 'xlsx', 'pptx', 'docx', 'code')),
    preferences JSONB DEFAULT '{"theme": "dark", "auto_download": false, "language": "es"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para creación automática de profile tras registro en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. TABLA: tasks (Registro maestro de tareas académicas/profesionales)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_format TEXT NOT NULL DEFAULT 'pdf' CHECK (target_format IN ('pdf', 'xlsx', 'pptx', 'docx', 'code')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_phase TEXT DEFAULT 'inbox' CHECK (current_phase IN ('inbox', 'detection', 'normalization', 'rubric_analysis', 'solution_generation', 'exporting', 'ready')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);


-- 4. TABLA: task_files (Archivos de entrada subidos: enunciados, capturas, rúbricas)
CREATE TABLE IF NOT EXISTS public.task_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'png', 'jpg', 'docx', 'xlsx', 'csv', 'txt'
    file_size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    storage_bucket TEXT NOT NULL DEFAULT 'inbox-tasks',
    role TEXT NOT NULL DEFAULT 'statement' CHECK (role IN ('statement', 'rubric', 'supporting_data')),
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON public.task_files(task_id);


-- 5. TABLA: rubrics (Criterios y ponderaciones del docente)
CREATE TABLE IF NOT EXISTS public.rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    criteria_name TEXT NOT NULL,
    weight_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    description_max_level TEXT NOT NULL,
    evaluation_hints TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rubrics_task_id ON public.rubrics(task_id);


-- 6. TABLA: solutions (Solución generada, matriz de trazabilidad y documentos de salida)
CREATE TABLE IF NOT EXISTS public.solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID UNIQUE NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    markdown_content TEXT NOT NULL,
    structured_json JSONB DEFAULT '{}'::jsonb,
    auto_eval_matrix JSONB DEFAULT '[]'::jsonb, -- Justificación de cumplimiento 100% por criterio
    output_file_url TEXT,
    output_file_format TEXT NOT NULL DEFAULT 'pdf',
    output_storage_path TEXT,
    score_estimated NUMERIC(5, 2) DEFAULT 10.00,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solutions_task_id ON public.solutions(task_id);


-- 7. TABLA: audit_logs (Trazabilidad y registro de acciones por agente)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    agent_role TEXT NOT NULL CHECK (agent_role IN ('Agent_1_Docs', 'Agent_2_Frontend', 'Agent_3_Backend', 'Agent_4_Auditor', 'System')),
    action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'error')),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_task_id ON public.audit_logs(task_id);


-- =============================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para tasks
CREATE POLICY "tasks_all_own" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- Políticas para task_files
CREATE POLICY "task_files_all_own" ON public.task_files FOR ALL USING (auth.uid() = user_id);

-- Políticas para rubrics (asociadas a tareas del usuario)
CREATE POLICY "rubrics_all_own" ON public.rubrics FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = rubrics.task_id AND tasks.user_id = auth.uid())
);

-- Políticas para solutions
CREATE POLICY "solutions_all_own" ON public.solutions FOR ALL USING (auth.uid() = user_id);

-- Políticas para audit_logs
CREATE POLICY "audit_logs_select_own" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "audit_logs_insert_authenticated" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);


-- =============================================================================
-- STORAGE BUCKETS (Creación e inicialización)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('inbox-tasks', 'inbox-tasks', false),
    ('generated-solutions', 'generated-solutions', true),
    ('rubrics', 'rubrics', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para inbox-tasks (Archivos de entrada privados del usuario)
CREATE POLICY "storage_inbox_select_own" ON storage.objects FOR SELECT
    USING (bucket_id = 'inbox-tasks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_inbox_insert_own" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'inbox-tasks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_inbox_delete_own" ON storage.objects FOR DELETE
    USING (bucket_id = 'inbox-tasks' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas de Storage para generated-solutions (Descarga de soluciones compiladas)
CREATE POLICY "storage_solutions_select_public" ON storage.objects FOR SELECT
    USING (bucket_id = 'generated-solutions');

CREATE POLICY "storage_solutions_insert_own" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'generated-solutions' AND auth.uid()::text = (storage.foldername(name))[1]);
