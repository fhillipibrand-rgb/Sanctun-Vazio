-- Supabase RLS (Row Level Security) Policies
-- Para o projeto Sanctum Vazio

-- Tabela: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Para todas as outras tabelas (assumindo que possuem a coluna 'user_id')
-- Criamos um bloco anônimo ou script padrão para habilitar RLS nelas
-- As tabelas são:
-- nutrition_water, transactions, workout_routines, workout_routine_exercises, 
-- workout_exercise_types, workout_sessions, projects, tasks, health_meds, 
-- health_contacts, investments, goals, events, habits_logs

DO $$
DECLARE
    t_name text;
    tables text[] := ARRAY[
        'nutrition_water', 
        'transactions', 
        'workout_routines', 
        'workout_routine_exercises', 
        'workout_exercise_types', 
        'workout_sessions', 
        'projects', 
        'tasks', 
        'health_meds', 
        'health_contacts', 
        'investments', 
        'goals', 
        'events', 
        'habits_logs'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
        
        -- SELECT Policy
        EXECUTE format('
            CREATE POLICY "Users can view own %I" ON public.%I 
            FOR SELECT USING (auth.uid() = user_id);
        ', t_name, t_name);

        -- INSERT Policy
        EXECUTE format('
            CREATE POLICY "Users can insert own %I" ON public.%I 
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        ', t_name, t_name);

        -- UPDATE Policy
        EXECUTE format('
            CREATE POLICY "Users can update own %I" ON public.%I 
            FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        ', t_name, t_name);

        -- DELETE Policy
        EXECUTE format('
            CREATE POLICY "Users can delete own %I" ON public.%I 
            FOR DELETE USING (auth.uid() = user_id);
        ', t_name, t_name);
    END LOOP;
END $$;
