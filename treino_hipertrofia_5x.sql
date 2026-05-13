-- Vamos garantir que a coluna existe
ALTER TABLE public.workout_routines 
ADD COLUMN IF NOT EXISTS days_of_week JSONB DEFAULT '[]'::jsonb;

-- Agora vamos inserir a rotina para TODOS os usuários cadastrados.
-- Assim, garantimos que a sua conta atual receberá a rotina!
DO $$ 
DECLARE
    v_user record;
    v_program_id UUID;
    v_routine_a UUID;
    v_routine_b UUID;
    v_routine_c UUID;
    v_routine_d UUID;
    v_routine_e UUID;
BEGIN
    FOR v_user IN SELECT id FROM auth.users LOOP

        -- 1. Inserir Programa
        INSERT INTO public.workout_programs (user_id, name, description, is_active)
        VALUES (v_user.id, 'Hipertrofia 5x na Semana', 'Divisão ABCDE focada em ganho máximo de massa muscular (Seg a Sex).', true)
        RETURNING id INTO v_program_id;

        -- 2. Inserir Rotina A (Segunda - Peito)
        INSERT INTO public.workout_routines (user_id, program_id, name, description, days_of_week)
        VALUES (v_user.id, v_program_id, 'Treino A - Peito', 'Foco na porção maior do peitoral e expansão', '["Seg"]')
        RETURNING id INTO v_routine_a;

        INSERT INTO public.workout_routine_exercises (routine_id, exercise_name, target_sets, target_reps, target_weight, target_rest_seconds, "order") VALUES
        (v_routine_a, 'Supino Reto com Barra', 4, 10, 0, 90, 1),
        (v_routine_a, 'Supino Inclinado com Halteres', 3, 12, 0, 60, 2),
        (v_routine_a, 'Crucifixo na Máquina (Peck Deck)', 3, 15, 0, 60, 3),
        (v_routine_a, 'Crossover Polia Alta', 3, 12, 0, 60, 4);

        -- 3. Inserir Rotina B (Terça - Costas)
        INSERT INTO public.workout_routines (user_id, program_id, name, description, days_of_week)
        VALUES (v_user.id, v_program_id, 'Treino B - Costas', 'Desenvolvimento de dorsais e espessura', '["Ter"]')
        RETURNING id INTO v_routine_b;

        INSERT INTO public.workout_routine_exercises (routine_id, exercise_name, target_sets, target_reps, target_weight, target_rest_seconds, "order") VALUES
        (v_routine_b, 'Puxada Frontal Aberta', 4, 12, 0, 90, 1),
        (v_routine_b, 'Remada Curvada com Barra', 4, 10, 0, 90, 2),
        (v_routine_b, 'Remada Baixa Triângulo', 3, 12, 0, 60, 3),
        (v_routine_b, 'Pulldown com Corda', 3, 15, 0, 60, 4);

        -- 4. Inserir Rotina C (Quarta - Pernas)
        INSERT INTO public.workout_routines (user_id, program_id, name, description, days_of_week)
        VALUES (v_user.id, v_program_id, 'Treino C - Pernas', 'Treino completo de membros inferiores', '["Qua"]')
        RETURNING id INTO v_routine_c;

        INSERT INTO public.workout_routine_exercises (routine_id, exercise_name, target_sets, target_reps, target_weight, target_rest_seconds, "order") VALUES
        (v_routine_c, 'Agachamento Livre', 4, 10, 0, 120, 1),
        (v_routine_c, 'Leg Press 45º', 4, 12, 0, 90, 2),
        (v_routine_c, 'Cadeira Extensora', 3, 15, 0, 60, 3),
        (v_routine_c, 'Mesa Flexora', 3, 12, 0, 60, 4),
        (v_routine_c, 'Panturrilha em Pé', 4, 20, 0, 45, 5);

        -- 5. Inserir Rotina D (Quinta - Ombros e Abdômen)
        INSERT INTO public.workout_routines (user_id, program_id, name, description, days_of_week)
        VALUES (v_user.id, v_program_id, 'Treino D - Ombros e Core', 'Volume para deltoides e fortalecimento do core', '["Qui"]')
        RETURNING id INTO v_routine_d;

        INSERT INTO public.workout_routine_exercises (routine_id, exercise_name, target_sets, target_reps, target_weight, target_rest_seconds, "order") VALUES
        (v_routine_d, 'Desenvolvimento com Halteres', 4, 10, 0, 90, 1),
        (v_routine_d, 'Elevação Lateral com Halteres', 4, 15, 0, 60, 2),
        (v_routine_d, 'Crucifixo Invertido na Máquina', 3, 12, 0, 60, 3),
        (v_routine_d, 'Abdominal Supra na Máquina/Polia', 4, 15, 0, 60, 4);

        -- 6. Inserir Rotina E (Sexta - Braços)
        INSERT INTO public.workout_routines (user_id, program_id, name, description, days_of_week)
        VALUES (v_user.id, v_program_id, 'Treino E - Braços', 'Foco exclusivo em bíceps e tríceps', '["Sex"]')
        RETURNING id INTO v_routine_e;

        INSERT INTO public.workout_routine_exercises (routine_id, exercise_name, target_sets, target_reps, target_weight, target_rest_seconds, "order") VALUES
        (v_routine_e, 'Rosca Direta com Barra W', 4, 10, 0, 60, 1),
        (v_routine_e, 'Tríceps Polia com Corda', 4, 12, 0, 60, 2),
        (v_routine_e, 'Rosca Alternada com Halteres', 3, 12, 0, 60, 3),
        (v_routine_e, 'Tríceps Testa', 3, 10, 0, 60, 4),
        (v_routine_e, 'Rosca Martelo', 3, 15, 0, 60, 5);
        
    END LOOP;
END $$;
