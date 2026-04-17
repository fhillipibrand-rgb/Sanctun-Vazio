// src/lib/mockData.ts

export const MOCK_GOALS = [
  { id: "goal-1", title: "Aumentar Receita Q3", category: "Financeiro", current_amount: 50000, target_amount: 100000, deadline: new Date().toISOString() },
  { id: "goal-2", title: "Rebranding Completo da Marca", category: "Empresa", type: "qualitative", target_amount: 100, current_amount: 60, deadline: new Date().toISOString() },
];

export const MOCK_PORTFOLIOS = [
  { id: "port-1", name: "Iniciativas de Marketing", color: "#f59e0b", created_at: new Date().toISOString() },
  { id: "port-2", name: "Produto e Engenharia", color: "#3b82f6", created_at: new Date().toISOString() },
];

export const MOCK_PROJECTS = [
  { id: "proj-1", name: "Website Nova Marca", color: "#5e9eff", progress: 60, portfolio_id: "port-1", created_at: new Date().toISOString() },
  { id: "proj-2", name: "App Mobile V2", color: "#a855f7", progress: 25, portfolio_id: "port-2", created_at: new Date().toISOString() },
  { id: "proj-3", name: "Campanha de Marketing", color: "#00f5a0", progress: 80, portfolio_id: "port-1", created_at: new Date().toISOString() },
];

export const generateMockTasks = () => {
  const now = new Date();
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const defaultSubtasks = [
    { id: "sub-1", title: "Rascunhar primeira versão", is_completed: true },
    { id: "sub-2", title: "Pedir aprovação do cliente", is_completed: false },
    { id: "sub-3", title: "Aplicar feedback", is_completed: false }
  ];

  return [
    { id: "mock-task-1", title: "Finalizar arquitetura do painel financeiro", energy_level: "high", due_date: now.toISOString(), is_critical: true, is_completed: false, status: "in_progress", project_id: "proj-1", created_at: addDays(now, -2).toISOString(), subtasks: defaultSubtasks },
    { id: "mock-task-2", title: "Reunião de alinhamento com stakeholders", energy_level: "low", due_date: addDays(now, 1).toISOString(), is_critical: false, is_completed: false, status: "todo", project_id: "proj-3", created_at: addDays(now, -1).toISOString() },
    { id: "mock-task-3", title: "Revisão do código do módulo de agendamentos", energy_level: "medium", due_date: addDays(now, 2).toISOString(), is_critical: true, is_completed: false, status: "todo", project_id: "proj-2", created_at: now.toISOString(), subtasks: [] },
    { id: "mock-task-4", title: "Desenhar fluxos do usuário (User Flow)", energy_level: "high", due_date: addDays(now, -1).toISOString(), is_critical: false, is_completed: true, status: "done", project_id: "proj-1", created_at: addDays(now, -5).toISOString() },
    { id: "mock-task-5", title: "Configurar banco de dados de produção", energy_level: "high", due_date: now.toISOString(), is_critical: true, is_completed: false, status: "in_progress", project_id: "proj-2", created_at: addDays(now, -3).toISOString() },
  ];
};

export const MOCK_FINANCE = [
  { id: "1", name: "Design Figma Pro", category: "Software", amount: 150.00, type: "expense", created_at: new Date().toISOString() },
  { id: "2", name: "Pagamento Cliente X", category: "Salário", amount: 5500.00, type: "income", created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const MOCK_HABITS = {
  sleep: { wake: "06:30", sleep: "22:30", quality: 85 },
  exercise: [
    { day: "Seg", done: true, type: "Musculação" },
    { day: "Ter", done: true, type: "Cardio" },
    { day: "Qua", done: false, type: "Musculação" },
    { day: "Qui", done: true, type: "Cardio" },
    { day: "Sex", done: false, type: "Yoga" },
  ],
  reading: { title: "O Alquimista", progress: 65, total: 208 }
};

export const MOCK_NUTRITION = {
  water: { current: 4, target: 10 },
  meals: { breakfast: true, lunch: true, afternoon: false, dinner: false },
  supplements: [
    { name: "Creatina", time: "Manhã", done: true },
    { name: "Whey Protein", time: "Pós-treino", done: false },
    { name: "Multivitamínico", time: "Almoço", done: true }
  ]
};

export const MOCK_HEALTH = {
  meds: [
    { id: "1", name: "Vitamina D", dosage: "1000UI", stock: 15, minStock: 5, frequency: "1x ao dia" },
    { id: "2", name: "Magnésio Inositol", dosage: "500mg", stock: 4, minStock: 10, frequency: "Antes de dormir" },
  ],
  exams: [
    { id: "e1", title: "Hemograma Completo", date: "2026-03-10", lab: "Exame Lab" },
    { id: "e2", title: "Teste de Esforço", date: "2026-02-15", lab: "CardioCenter" }
  ],
  emergencyContacts: [
    { name: "Dra. Ana (Médica)", phone: "+5511999999999", relation: "Pessoal" },
    { name: "SAMU", phone: "192", relation: "Emergência" }
  ]
};

export const MOCK_INVESTMENTS = {
  summary: { total: 125430.20, monthlyYield: 1.2, monthlyEarnings: 1505.16 },
  allocation: [
    { name: 'Ações BR', value: 45000, color: '#5e9eff' },
    { name: 'Ações EUA', value: 35000, color: '#00f5a0' },
    { name: 'FIIs', value: 25000, color: '#a855f7' },
    { name: 'Renda Fixa', value: 20430.20, color: '#ff6b6b' },
  ],
  assets: [
    { symbol: 'IVVB11', name: 'S&P 500 ETF', type: 'Ações EUA', amount: 35000, yield: 15.4 },
    { symbol: 'XPML11', name: 'XP Malls FII', type: 'FIIs', amount: 15000, yield: 0.85 },
    { symbol: 'VALE3', name: 'Vale S.A.', type: 'Ações BR', amount: 12000, yield: -2.3 },
  ]
};
