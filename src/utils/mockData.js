// Seeding engine for generating and calculating SaaS client states

export const DEFAULT_PLAN_PRICING = {
  Basic: 30000,
  Pro: 60000,
  Enterprise: 150000
};

export const DEFAULT_CAC = 500000;

// Dynamic funnel calculator based on active customer size
export const calculateFunnelData = (clients = []) => {
  const activeCount = clients.filter(c => c.status === 'Active').length;
  
  // Scale stages logically from the active customer count
  const trialsCount = Math.round(activeCount * 2.2) || 45;
  const signupsCount = Math.round(trialsCount * 2.5) || 120;
  const visitorsCount = Math.round(signupsCount * 4) || 500;

  return [
    { stage: 'Visitantes', count: visitorsCount, percentage: 100 },
    { stage: 'Registros (Leads)', count: signupsCount, percentage: parseFloat(((signupsCount / visitorsCount) * 100).toFixed(1)) || 25 },
    { stage: 'Pruebas Activas', count: trialsCount, percentage: parseFloat(((trialsCount / signupsCount) * 100).toFixed(1)) || 37.5 },
    { stage: 'Clientes Activos', count: activeCount, percentage: parseFloat(((activeCount / trialsCount) * 100).toFixed(1)) || 40 }
  ];
};

// Generates 15 demo records using the active prices
export const generateDemoClients = (prices = DEFAULT_PLAN_PRICING) => {
  const demoList = [
    { id: 'TX-1001', name: 'Sofía Rodríguez', email: 'sofia.rod@example.com', plan: 'Pro', amount: prices.Pro, status: 'Active', date: '2026-06-13', avatar: 'SR' },
    { id: 'TX-1002', name: 'Mateo González', email: 'mateo.gon@example.com', plan: 'Basic', amount: prices.Basic, status: 'Active', date: '2026-06-13', avatar: 'MG' },
    { id: 'TX-1003', name: 'Valentina Silva', email: 'v.silva@example.com', plan: 'Enterprise', amount: prices.Enterprise, status: 'Active', date: '2026-06-12', avatar: 'VS' },
    { id: 'TX-1004', name: 'Thiago López', email: 'thiago.l@example.com', plan: 'Pro', amount: prices.Pro, status: 'Past Due', date: '2026-06-12', avatar: 'TL' },
    { id: 'TX-1005', name: 'Isabella Martínez', email: 'isabella.m@example.com', plan: 'Basic', amount: prices.Basic, status: 'Active', date: '2026-06-11', avatar: 'IM' },
    { id: 'TX-1006', name: 'Benjamín Pérez', email: 'benja.perez@example.com', plan: 'Enterprise', amount: prices.Enterprise, status: 'Active', date: '2026-06-11', avatar: 'BP' },
    { id: 'TX-1007', name: 'Camila Castro', email: 'camila.c@example.com', plan: 'Pro', amount: prices.Pro, status: 'Active', date: '2026-06-10', avatar: 'CC' },
    { id: 'TX-1008', name: 'Lucas Gómez', email: 'lucas.gomez@example.com', plan: 'Basic', amount: prices.Basic, status: 'Churned', date: '2026-06-10', avatar: 'LG' },
    { id: 'TX-1009', name: 'Emma Díaz', email: 'emma.diaz@example.com', plan: 'Pro', amount: prices.Pro, status: 'Active', date: '2026-06-09', avatar: 'ED' },
    { id: 'TX-1010', name: 'Santiago Ruiz', email: 'santiago.ruiz@example.com', plan: 'Basic', amount: prices.Basic, status: 'Active', date: '2026-06-08', avatar: 'SR' },
    { id: 'TX-1011', name: 'Mariana Sosa', email: 'mariana.s@example.com', plan: 'Pro', amount: prices.Pro, status: 'Active', date: '2026-06-08', avatar: 'MS' },
    { id: 'TX-1012', name: 'Felipe Herrera', email: 'felipe.h@example.com', plan: 'Enterprise', amount: prices.Enterprise, status: 'Active', date: '2026-06-07', avatar: 'FH' },
    { id: 'TX-1013', name: 'Juana Morales', email: 'juana.m@example.com', plan: 'Basic', amount: prices.Basic, status: 'Past Due', date: '2026-06-06', avatar: 'JM' },
    { id: 'TX-1014', name: 'Daniel Torres', email: 'daniel.t@example.com', plan: 'Pro', amount: prices.Pro, status: 'Churned', date: '2026-06-05', avatar: 'DT' },
    { id: 'TX-1015', name: 'Olivia Flores', email: 'olivia.f@example.com', plan: 'Basic', amount: prices.Basic, status: 'Active', date: '2026-06-05', avatar: 'OF' }
  ];
  
  return demoList;
};
