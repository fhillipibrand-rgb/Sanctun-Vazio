const today = new Date().toISOString().split('T')[0];
const todayDate = new Date();
const tomorrow = new Date(Date.now() + 86400000);
const nextWeek = new Date(Date.now() + 7 * 86400000);
const in3Days = new Date(Date.now() + 3 * 86400000);

export const DEMO_MOCK_DATA: Record<string, any[]> = {
  profiles: [
    { id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', full_name: "Elon Musk", avatar_url: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Elon_Musk_Royal_Society.jpg", accepted_terms_at: "2026-04-28T17:23:22Z" }
  ],

  tasks: [
    { id: 't1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Revisar design final do Starship V3", status: "todo", is_completed: false, energy_level: "high", is_critical: true, due_date: tomorrow.toISOString(), created_at: todayDate.toISOString() },
    { id: 't2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Aprovar lançamento do Grok 3.0", status: "todo", is_completed: false, energy_level: "medium", is_critical: true, due_date: todayDate.toISOString(), created_at: todayDate.toISOString() },
    { id: 't3', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Reunião de engenharia Neuralink", status: "in_progress", is_completed: false, energy_level: "high", is_critical: false, created_at: todayDate.toISOString() },
    { id: 't4', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Analisar dados de produção do Model 2", status: "done", is_completed: true, energy_level: "high", is_critical: false, created_at: todayDate.toISOString() },
    { id: 't5', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Postar meme no X", status: "todo", is_completed: false, energy_level: "low", is_critical: false, created_at: todayDate.toISOString() }
  ],

  projects: [
    { id: 'p1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', name: "Colônia em Marte (Alpha Base)", status: "active", color: "#ff5e5e", deadline: nextWeek.toISOString(), created_at: "2026-04-20T00:00:00Z" }
  ],

  events: [
    { id: 'ev1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Test Flight Starship", location: "Starbase, Texas", start_time: tomorrow.toISOString() },
    { id: 'ev2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Reunião de Board - Tesla", location: "Giga Texas", start_time: in3Days.toISOString() },
    { id: 'ev3', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Entrevista Podcast Joe Rogan", location: "Austin, Texas", start_time: nextWeek.toISOString() },
    { id: 'ev4', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Anúncio Optimus Gen 3", location: "Palo Alto", start_time: new Date(Date.now() + 10 * 86400000).toISOString() },
  ],

  transactions: [
    { id: 'f1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', type: "income", name: "Dividendos Tesla", amount: 15000000, category: "Investimentos", created_at: "2026-04-28T10:00:00Z" },
    { id: 'f2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', type: "expense", name: "Aquisição de Servidores GPUs (X.AI)", amount: 12000000, category: "Empresa", created_at: "2026-04-27T14:00:00Z" },
    { id: 'f3', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', type: "income", name: "Venda de ações SpaceX (Secundário)", amount: 25000000, category: "Investimentos", created_at: "2026-04-26T09:00:00Z" },
    { id: 'f4', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', type: "expense", name: "Segurança Pessoal", amount: 85000, category: "Outros", created_at: "2026-04-25T11:00:00Z" }
  ],

  habits: [
    { id: 'h1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Time Blocking (Gestão 5min)", frequency: "daily", color: "#8b5cf6", icon: "Clock" },
    { id: 'h2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Leitura Técnica (Física/Engenharia)", frequency: "daily", color: "#3b82f6", icon: "BookOpen" },
    { id: 'h3', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Treino Rápido / Caminhada", frequency: "daily", color: "#ef4444", icon: "Activity" }
  ],

  habits_logs: [
    { id: 'hl1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', type: "sleep", value: { wake: "07:00", sleep: "01:00" }, date: today },
    { id: 'hl2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', type: "exercise", value: true, date: today }
  ],

  workout_sessions: [
    { id: 'ws1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', date: today, routine_id: 'r1', duration_minutes: 30, notes: "Levantamento de peso. Preciso manter a saúde para Marte." }
  ],

  workout_routines: [
    { id: 'r1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', name: "Treino de Resistência", days_of_week: ["Segunda", "Quarta", "Sexta"] }
  ],

  workout_routine_exercises: [
    { id: 'e1', routine_id: 'r1', name: "Supino Reto", target_sets: 3, target_reps: 10, target_rest_seconds: 60 },
    { id: 'e2', routine_id: 'r1', name: "Rosca Direta", target_sets: 3, target_reps: 15, target_rest_seconds: 45 },
    { id: 'e3', routine_id: 'r1', name: "Esteira (HIIT)", target_sets: 1, target_reps: 1, target_rest_seconds: 0 }
  ],

  health_meds: [
    { id: 'm1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', name: "Wegovy", dosage: "2.4mg", frequency: "Semanal", stock: 4, min_stock: 1 },
    { id: 'm2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', name: "Multivitamínico Otimizado", dosage: "1 pack", frequency: "1x ao dia", stock: 30, min_stock: 10 }
  ],

  health_contacts: [
    { id: 'c1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', name: "Gwynne Shotwell", phone: "+1-555-SPACEX", relation: "COO SpaceX" },
    { id: 'c2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', name: "Shivon Zilis", phone: "+1-555-NEURA", relation: "Neuralink Exec" }
  ],

  nutrition_water: [
    { id: 'w1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', date: today, amount: 5, target: 12 }
  ],

  books: [
    { id: 'b1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Foundation", author: "Isaac Asimov", status: "reading", total_pages: 255, current_page: 180, updated_at: todayDate.toISOString() },
    { id: 'b2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", status: "paused", total_pages: 224, current_page: 42 },
    { id: 'b3', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Superintelligence", author: "Nick Bostrom", status: "wishlist", total_pages: 328, current_page: 0 }
  ],

  spiritual_entries: [
    { id: 's1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', date: today, type: "reflection", title: "Reflexão sobre a Consciência", content: "Expandir o escopo e a escala da consciência para entender a verdadeira natureza do universo. A humanidade deve ser multiplanetária.", mood: "revelation", duration_minutes: 15 },
    { id: 's2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', date: today, type: "gratitude", title: "Agradecimento", content: "Grato pela equipe de engenharia da SpaceX ter resolvido o problema na válvula Raptor.", mood: "peace", duration_minutes: 5 },
    { id: 's3', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', date: "2026-04-27", type: "meditation", title: "Foco", content: "10 minutos de respiração antes da reunião com o conselho.", mood: "peace", duration_minutes: 10 }
  ],

  sleep_logs: [
    { id: 'sl1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', date: today, bedtime: "01:00", wake_time: "07:00", duration_hours: 6.0, quality: 3 },
    { id: 'sl2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', date: "2026-04-27", bedtime: "02:00", wake_time: "07:00", duration_hours: 5.0, quality: 2 }
  ],

  sleep_settings: [
    { user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', target_bedtime: "01:00", target_wake_time: "07:00", target_duration_hours: 6.0 }
  ],

  goals: [
    { id: 'g1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Tornar a Vida Multiplanetária", category: "Empresa", type: "qualitative", target_amount: 100, current_amount: 45, deadline: "2050-12-31" },
    { id: 'g2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "AGI Segura (xAI)", category: "Empresa", type: "qualitative", target_amount: 100, current_amount: 60, deadline: "2029-01-01" },
    { id: 'g3', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', title: "Acelerar a transição para energia sustentável", category: "Saúde", type: "qualitative", target_amount: 100, current_amount: 80, deadline: "2035-08-15" }
  ],

  investments: [
    { id: 'i1', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', symbol: "TSLA", name: "Tesla, Inc.", type: "Ações", amount: 150000000000, current_yield: 12.5 },
    { id: 'i2', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', symbol: "SPACEX", name: "SpaceX", type: "Private Equity", amount: 100000000000, current_yield: 25.2 },
    { id: 'i3', user_id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', symbol: "DOGE", name: "Dogecoin", type: "Cripto", amount: 15000000, current_yield: -5.7 }
  ]
};
