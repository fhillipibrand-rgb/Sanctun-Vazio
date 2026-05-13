-- 1. Criação da tabela de Programas de Treino
CREATE TABLE IF NOT EXISTS public.workout_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para workout_programs
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own workout programs" 
    ON public.workout_programs FOR ALL 
    USING (auth.uid() = user_id);

-- 2. Adicionar vínculo de programa às rotinas (Treinos A, B, C)
ALTER TABLE public.workout_routines 
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE;

-- 3. Histórico: Adicionar campos para o histórico de execução detalhado
ALTER TABLE public.workout_sessions
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE;

-- 4. Criar tabela para registrar o volume e carga por exercício executado na sessão
CREATE TABLE IF NOT EXISTS public.workout_session_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    sets_completed INTEGER NOT NULL,
    reps_completed INTEGER NOT NULL,
    weight_used DECIMAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para session_exercises
ALTER TABLE public.workout_session_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own session exercises" 
    ON public.workout_session_exercises FOR ALL 
    USING (
        session_id IN (
            SELECT id FROM public.workout_sessions WHERE user_id = auth.uid()
        )
    );
