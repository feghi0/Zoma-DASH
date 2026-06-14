// Core state and logic manager for Zoma DASH

// Global State
let clients = [];
let parameters = {
  Basic: 30000,
  Pro: 60000,
  Enterprise: 150000,
  cac: 500000
};
let dateRange = 'Last30';
let notifications = [
  { id: 1, text: 'Bienvenido a Zoma DASH. Ve a la pestaña "Gestión de Datos" para registrar tus primeros clientes.', type: 'success', read: false }
];

// Chart Instances
let revenueChart = null;
let planChart = null;
let customerChart = null;
let funnelChart = null;
let projectionChart = null;

// Currency Formatter Utility
const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);
};

// 1. LocalStorage Management
const loadState = () => {
  const savedClients = localStorage.getItem('zoma_clients');
  const savedParams = localStorage.getItem('zoma_parameters');
  const savedNotifs = localStorage.getItem('zoma_notifications');

  if (savedClients) clients = JSON.parse(savedClients);
  if (savedParams) parameters = JSON.parse(savedParams);
  if (savedNotifs) notifications = JSON.parse(savedNotifs);
};

const saveState = () => {
  localStorage.setItem('zoma_clients', JSON.stringify(clients));
  localStorage.setItem('zoma_parameters', JSON.stringify(parameters));
  localStorage.setItem('zoma_notifications', JSON.stringify(notifications));
};

// Push notification helper
const pushNotification = (text, type = 'success') => {
  notifications = [
    { id: Date.now(), text, type, read: false },
    ...notifications.slice(0, 4) // keep last 5
  ];
  saveState();
  renderNotifications();
};

// 2. Demo Seeding Engine
const generateDemoClients = () => {
  return [
    { id: 'TX-1001', name: 'Sofía Rodríguez', email: 'sofia.rod@example.com', plan: 'Pro', amount: parameters.Pro, status: 'Active', date: '2026-06-13', avatar: 'SR' },
    { id: 'TX-1002', name: 'Mateo González', email: 'mateo.gon@example.com', plan: 'Basic', amount: parameters.Basic, status: 'Active', date: '2026-06-13', avatar: 'MG' },
    { id: 'TX-1003', name: 'Valentina Silva', email: 'v.silva@example.com', plan: 'Enterprise', amount: parameters.Enterprise, status: 'Active', date: '2026-06-12', avatar: 'VS' },
    { id: 'TX-1004', name: 'Thiago López', email: 'thiago.l@example.com', plan: 'Pro', amount: parameters.Pro, status: 'Past Due', date: '2026-06-12', avatar: 'TL' },
    { id: 'TX-1005', name: 'Isabella Martínez', email: 'isabella.m@example.com', plan: 'Basic', amount: parameters.Basic, status: 'Active', date: '2026-06-11', avatar: 'IM' },
    { id: 'TX-1006', name: 'Benjamín Pérez', email: 'benja.perez@example.com', plan: 'Enterprise', amount: parameters.Enterprise, status: 'Active', date: '2026-06-11', avatar: 'BP' },
    { id: 'TX-1007', name: 'Camila Castro', email: 'camila.c@example.com', plan: 'Pro', amount: parameters.Pro, status: 'Active', date: '2026-06-10', avatar: 'CC' },
    { id: 'TX-1008', name: 'Lucas Gómez', email: 'lucas.gomez@example.com', plan: 'Basic', amount: parameters.Basic, status: 'Churned', date: '2026-06-10', avatar: 'LG' },
    { id: 'TX-1009', name: 'Emma Díaz', email: 'emma.diaz@example.com', plan: 'Pro', amount: parameters.Pro, status: 'Active', date: '2026-06-09', avatar: 'ED' },
    { id: 'TX-1010', name: 'Santiago Ruiz', email: 'santiago.ruiz@example.com', plan: 'Basic', amount: parameters.Basic, status: 'Active', date: '2026-06-08', avatar: 'SR' },
    { id: 'TX-1011', name: 'Mariana Sosa', email: 'mariana.s@example.com', plan: 'Pro', amount: parameters.Pro, status: 'Active', date: '2026-06-08', avatar: 'MS' },
    { id: 'TX-1012', name: 'Felipe Herrera', email: 'felipe.h@example.com', plan: 'Enterprise', amount: parameters.Enterprise, status: 'Active', date: '2026-06-07', avatar: 'FH' },
    { id: 'TX-1013', name: 'Juana Morales', email: 'juana.m@example.com', plan: 'Basic', amount: parameters.Basic, status: 'Past Due', date: '2026-06-06', avatar: 'JM' },
    { id: 'TX-1014', name: 'Daniel Torres', email: 'daniel.t@example.com', plan: 'Pro', amount: parameters.Pro, status: 'Churned', date: '2026-06-05', avatar: 'DT' },
    { id: 'TX-1015', name: 'Olivia Flores', email: 'olivia.f@example.com', plan: 'Basic', amount: parameters.Basic, status: 'Active', date: '2026-06-05', avatar: 'OF' }
  ];
};

// 3. Dynamic Timeline Math Generators
const computeMonthlyHistory = () => {
  const monthsList = [
    { label: 'Jul 2025', year: 2025, monthIndex: 6 },
    { label: 'Aug 2025', year: 2025, monthIndex: 7 },
    { label: 'Sep 2025', year: 2025, monthIndex: 8 },
    { label: 'Oct 2025', year: 2025, monthIndex: 9 },
    { label: 'Nov 2025', year: 2025, monthIndex: 10 },
    { label: 'Dec 2025', year: 2025, monthIndex: 11 },
    { label: 'Jan 2026', year: 2026, monthIndex: 0 },
    { label: 'Feb 2026', year: 2026, monthIndex: 1 },
    { label: 'Mar 2026', year: 2026, monthIndex: 2 },
    { label: 'Apr 2026', year: 2026, monthIndex: 3 },
    { label: 'May 2026', year: 2026, monthIndex: 4 },
    { label: 'Jun 2026', year: 2026, monthIndex: 5 }
  ];

  return monthsList.map(({ label, year, monthIndex }) => {
    const activeThisMonth = clients.filter(c => {
      const cDate = new Date(c.date);
      const cYear = cDate.getFullYear();
      const cMonth = cDate.getMonth();
      const isRegistered = cYear < year || (cYear === year && cMonth <= monthIndex);
      if (!isRegistered) return false;

      if (c.status === 'Churned') {
        return cYear > year || (cYear === year && cMonth > monthIndex);
      }
      return true;
    });

    const basicCount = activeThisMonth.filter(c => c.plan === 'Basic').length;
    const proCount = activeThisMonth.filter(c => c.plan === 'Pro').length;
    const entCount = activeThisMonth.filter(c => c.plan === 'Enterprise').length;

    const mrrSum = basicCount * parameters.Basic + proCount * parameters.Pro + entCount * parameters.Enterprise;

    return {
      month: label,
      mrr: mrrSum,
      activeUsers: activeThisMonth.length,
      newUsers: clients.filter(c => {
        const cDate = new Date(c.date);
        return cDate.getFullYear() === year && cDate.getMonth() === monthIndex;
      }).length,
      churnedUsers: clients.filter(c => {
        const cDate = new Date(c.date);
        return c.status === 'Churned' && cDate.getFullYear() === year && cDate.getMonth() === monthIndex;
      }).length,
      basic: basicCount,
      pro: proCount,
      enterprise: entCount
    };
  });
};

const computeDailyHistory = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = targetDate.toISOString().split('T')[0];

    const activeOnDay = clients.filter(c => {
      return c.date <= dateStr && (c.status !== 'Churned' || c.date > dateStr);
    });

    const dayMRR = activeOnDay.reduce((sum, c) => sum + c.amount, 0);

    data.push({
      date: dateStr,
      mrr: dayMRR,
      newUsers: clients.filter(c => c.date === dateStr).length,
      churnedUsers: clients.filter(c => c.status === 'Churned' && c.date === dateStr).length
    });
  }
  return data;
};

const computeFunnelData = () => {
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const trialsCount = Math.round(activeCount * 2.2) || 45;
  const signupsCount = Math.round(trialsCount * 2.5) || 120;
  const visitorsCount = Math.round(signupsCount * 4) || 500;

  return [
    { stage: 'Visitantes', count: visitorsCount, percentage: 100 },
    { stage: 'Registros', count: signupsCount, percentage: parseFloat(((signupsCount / visitorsCount) * 100).toFixed(1)) || 25 },
    { stage: 'Pruebas', count: trialsCount, percentage: parseFloat(((trialsCount / signupsCount) * 100).toFixed(1)) || 37.5 },
    { stage: 'Activos', count: activeCount, percentage: parseFloat(((activeCount / trialsCount) * 100).toFixed(1)) || 40 }
  ];
};

// 4. Calculations Engine: Recalculate and update DOM elements
const calculateMetrics = () => {
  const activeClients = clients.filter(c => c.status === 'Active');
  const churnedClients = clients.filter(c => c.status === 'Churned');
  
  const activeCount = activeClients.length;
  const churnedCount = churnedClients.length;
  
  const mrrVal = activeClients.reduce((sum, c) => sum + c.amount, 0);
  const arrVal = mrrVal * 12;
  const arpuVal = activeCount > 0 ? Math.round(mrrVal / activeCount) : 0;
  
  const totalEver = activeCount + churnedCount;
  const churnVal = totalEver > 0 ? parseFloat(((churnedCount / totalEver) * 100).toFixed(1)) : 0;
  
  const ltvVal = arpuVal > 0 ? Math.round(arpuVal / (churnVal / 100 || 0.025)) : 0;
  const cacVal = parameters.cac;

  // Render to DOM
  const el = (id) => document.getElementById(id);
  if (el('mrr-value')) el('mrr-value').innerText = formatCurrency(mrrVal);
  if (el('arr-value')) el('arr-value').innerText = formatCurrency(arrVal);
  if (el('ltv-value')) el('ltv-value').innerText = formatCurrency(ltvVal);
  if (el('cac-value')) el('cac-value').innerText = formatCurrency(cacVal);
  if (el('churn-value')) el('churn-value').innerText = `${churnVal}%`;
  if (el('arpu-value')) el('arpu-value').innerText = formatCurrency(arpuVal);

  const ltvCacRatio = cacVal > 0 ? ltvVal / cacVal : 0;
  if (el('ltv-cac-ratio-value')) el('ltv-cac-ratio-value').innerText = `${ltvCacRatio.toFixed(1)}x`;
  
  const ratioTrend = el('ltv-cac-trend');
  if (ratioTrend) {
    ratioTrend.className = 'kpi-trend ' + (ltvCacRatio >= 3 ? 'text-success' : ltvCacRatio >= 2 ? 'text-warning' : 'text-danger');
    ratioTrend.innerText = ltvCacRatio >= 3 ? 'Saludable' : ltvCacRatio >= 2 ? 'Aceptable' : 'Riesgoso';
  }
};

// 5. Views Switching
const switchTab = (tab) => {
  const dashView = document.getElementById('view-dashboard');
  const mngView = document.getElementById('view-management');
  const dashTabBtn = document.getElementById('btn-tab-dashboard');
  const mngTabBtn = document.getElementById('btn-tab-management');
  
  const dateSelectWrapper = document.getElementById('date-select-wrapper');

  if (tab === 'dashboard') {
    mngView.classList.add('hidden');
    dashView.classList.remove('hidden');
    mngTabBtn.classList.remove('active');
    dashTabBtn.classList.add('active');
    if (dateSelectWrapper) dateSelectWrapper.classList.remove('hidden');
    
    // Check if database is empty to toggle empty state panel
    const emptyPanel = document.getElementById('empty-state-panel');
    const metricContent = document.getElementById('dashboard-metrics-content');
    
    if (clients.length === 0) {
      metricContent.classList.add('hidden');
      emptyPanel.classList.remove('hidden');
    } else {
      emptyPanel.classList.add('hidden');
      metricContent.classList.remove('hidden');
      
      // Initialize charts if not already done, then update them
      if (!revenueChart) {
        initCharts();
      }
      updateCharts();
      runProjection();
    }
  } else {
    dashView.classList.add('hidden');
    mngView.classList.remove('hidden');
    dashTabBtn.classList.remove('active');
    mngTabBtn.classList.add('active');
    if (dateSelectWrapper) dateSelectWrapper.classList.add('hidden');

    renderManagementClients();
  }
};

// 6. Rendering tables and ledgers
const renderManagementClients = () => {
  const container = document.getElementById('management-clients-tbody');
  const countEl = document.getElementById('management-clients-count');
  
  if (!container) return;
  countEl.innerText = clients.length;

  if (clients.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 4rem 1rem; text-align: center; color: var(--text-secondary);">
          No hay clientes registrados en el sistema. Utiliza el formulario o genera datos demo.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = clients.map(c => `
    <tr>
      <td>
        <div class="customer-badge">
          <div class="avatar">${c.avatar}</div>
          <div class="customer-info">
            <span class="customer-name">${c.name}</span>
            <span class="customer-email">${c.email}</span>
          </div>
        </div>
      </td>
      <td class="text-bold">${c.plan}</td>
      <td class="text-bold">${formatCurrency(c.amount)}</td>
      <td>${c.date}</td>
      <td>
        <span class="status-badge ${c.status === 'Active' ? 'active' : c.status === 'Past Due' ? 'past_due' : 'churned'}">
          ${c.status === 'Active' ? 'Activo' : c.status === 'Past Due' ? 'Vencido' : 'Cancelado'}
        </span>
      </td>
      <td>
        <button onclick="deleteClientHandler('${c.id}')" class="btn-secondary" style="padding: 0.4rem; border: none; background: rgba(244, 63, 94, 0.15); color: var(--danger);">
          <i data-lucide="trash-2" style="width:15px; height:15px"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  // Re-run lucide icons compilation for new DOM rows
  if (window.lucide) window.lucide.createIcons();
};

const renderDashboardTable = () => {
  const container = document.getElementById('dashboard-table-tbody');
  const paginationWrapper = document.getElementById('dashboard-table-pagination-wrapper');
  
  if (!container) return;

  const searchInput = document.getElementById('dashboard-table-search').value.toLowerCase();
  const planFilter = document.getElementById('dashboard-table-plan-filter').value;
  const statusFilter = document.getElementById('dashboard-table-status-filter').value;

  // Filter records
  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchInput) || c.email.toLowerCase().includes(searchInput) || c.id.toLowerCase().includes(searchInput);
    const matchesPlan = planFilter === 'All' || c.plan === planFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 3rem 1rem; text-align: center; color: var(--text-secondary);">
          No se encontraron transacciones con los filtros seleccionados.
        </td>
      </tr>
    `;
    paginationWrapper.innerHTML = '';
    return;
  }

  // Very basic pagination: 6 items per page
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  let currentPage = Number(container.getAttribute('data-current-page')) || 1;
  
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  container.setAttribute('data-current-page', currentPage);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

  container.innerHTML = paginated.map(tx => `
    <tr>
      <td class="text-bold">${tx.id}</td>
      <td>
        <div class="customer-badge">
          <div class="avatar">${tx.avatar}</div>
          <div class="customer-info">
            <span class="customer-name">${tx.name}</span>
            <span class="customer-email">${tx.email}</span>
          </div>
        </div>
      </td>
      <td><span class="text-bold">${tx.plan}</span></td>
      <td class="text-bold">${formatCurrency(tx.amount)}</td>
      <td>${tx.date}</td>
      <td>
        <span class="status-badge ${tx.status === 'Active' ? 'active' : tx.status === 'Past Due' ? 'past_due' : 'churned'}">
          ${tx.status === 'Active' ? 'Activo' : tx.status === 'Past Due' ? 'Vencido' : 'Cancelado'}
        </span>
      </td>
      <td>
        <button onclick="deleteClientHandler('${tx.id}')" class="btn-secondary" style="padding: 0.4rem; border: none; background: rgba(244, 63, 94, 0.15); color: var(--danger);">
          <i data-lucide="trash-2" style="width:15px; height:15px"></i>
        </button>
      </td>
    </tr>
  `).join('');

  // Pagination buttons
  paginationWrapper.innerHTML = `
    <span>Mostrando pág. <b>${currentPage}</b> de <b>${totalPages}</b> (Filtrados: ${filtered.length} registros)</span>
    <div class="pagination-buttons">
      <button class="btn-page" onclick="changeDashboardPage(-1)" ${currentPage === 1 ? 'disabled' : ''}>
        <i data-lucide="chevron-left" style="width:16px; height:16px"></i>
      </button>
      <button class="btn-page" onclick="changeDashboardPage(1)" ${currentPage === totalPages ? 'disabled' : ''}>
        <i data-lucide="chevron-right" style="width:16px; height:16px"></i>
      </button>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
};

window.changeDashboardPage = (direction) => {
  const container = document.getElementById('dashboard-table-tbody');
  let current = Number(container.getAttribute('data-current-page')) || 1;
  container.setAttribute('data-current-page', current + direction);
  renderDashboardTable();
};

// Global delete hook called from row buttons
window.deleteClientHandler = (id) => {
  const target = clients.find(c => c.id === id);
  clients = clients.filter(c => c.id !== id);
  saveState();
  
  if (target) pushNotification(`Cliente ${target.name} eliminado de la base de datos.`, 'warning');
  
  calculateMetrics();
  
  if (document.getElementById('view-management').classList.contains('hidden')) {
    // on dashboard tab
    if (clients.length === 0) {
      switchTab('dashboard'); // forces redrawing empty state panel
    } else {
      renderDashboardTable();
      updateCharts();
    }
  } else {
    // on admin tab
    renderManagementClients();
  }
};

// Render system notifications dropdown
const renderNotifications = () => {
  const listContainer = document.getElementById('notifications-list');
  const badge = document.getElementById('notifications-badge');
  const unreadCount = notifications.filter(n => !n.read).length;

  if (badge) {
    if (unreadCount > 0) {
      badge.classList.remove('hidden');
      badge.innerText = unreadCount;
    } else {
      badge.classList.add('hidden');
    }
  }

  if (listContainer) {
    listContainer.innerHTML = notifications.map(n => `
      <div 
        onclick="markNotificationRead(${n.id})"
        style="padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.5rem;
               background-color: ${n.read ? 'rgba(30, 41, 59, 0.2)' : 'rgba(99, 102, 241, 0.08)'};
               border-left: 3px solid ${n.type === 'warning' ? 'var(--danger)' : 'var(--success)'};
               font-size: 0.75rem; color: ${n.read ? 'var(--text-secondary)' : 'var(--text-primary)'};
               cursor: pointer;"
      >
        ${n.text}
      </div>
    `).join('');
  }
};

window.markNotificationRead = (id) => {
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  saveState();
  renderNotifications();
};

// 7. ApexCharts Initializations & Renders
const initCharts = () => {
  const commonTheme = {
    theme: { mode: 'dark' },
    chart: {
      background: 'transparent',
      foreColor: '#94a3b8',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }
    },
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (v) => formatCurrency(v) }
    }
  };

  // A. Revenue Growth Chart
  revenueChart = new ApexCharts(document.querySelector("#revenue-chart"), {
    ...commonTheme,
    chart: { ...commonTheme.chart, type: 'area', height: 320 },
    colors: ['#6366f1', '#a5b4fc'],
    stroke: { curve: 'smooth', width: [3, 2], dashArray: [0, 5] },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] }
    },
    series: [{ name: 'MRR Actual', data: [] }, { name: 'MRR Proyectado', data: [] }],
    xaxis: { categories: [], axisBorder: { show: false }, axisTicks: { show: false } }
  });
  revenueChart.render();

  // B. Plan Donut Chart
  planChart = new ApexCharts(document.querySelector("#plan-chart"), {
    ...commonTheme,
    chart: { ...commonTheme.chart, type: 'donut', height: 290 },
    colors: ['#06b6d4', '#6366f1', '#8b5cf6'],
    labels: [],
    stroke: { show: true, width: 2, colors: ['#121926'] },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px', fontFamily: 'Outfit, sans-serif', offsetY: -8 },
            value: { show: true, fontSize: '20px', fontFamily: 'Outfit, sans-serif', color: '#f8fafc', offsetY: 8 },
            total: {
              show: true,
              label: 'Suscriptores',
              color: '#94a3b8',
              fontSize: '11px',
              formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()
            }
          }
        }
      }
    },
    legend: { position: 'bottom', fontSize: '11px' },
    series: []
  });
  planChart.render();

  // C. Customer Growth & Churn
  customerChart = new ApexCharts(document.querySelector("#customer-chart"), {
    ...commonTheme,
    chart: { ...commonTheme.chart, type: 'bar', stacked: true, height: 320 },
    colors: ['#10b981', '#f43f5e'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    xaxis: { categories: [], axisBorder: { show: false }, axisTicks: { show: false } },
    series: [{ name: 'Nuevos', data: [] }, { name: 'Perdidos', data: [] }]
  });
  customerChart.render();

  // D. Conversion Funnel
  funnelChart = new ApexCharts(document.querySelector("#funnel-chart"), {
    ...commonTheme,
    chart: { ...commonTheme.chart, type: 'bar', height: 320 },
    plotOptions: {
      bar: { borderRadius: 5, horizontal: true, barHeight: '60%', distributed: true, dataLabels: { position: 'center' } }
    },
    colors: ['#6366f1', '#4f46e5', '#4338ca', '#312e81'],
    dataLabels: {
      enabled: true,
      textAnchor: 'middle',
      formatter: (val, opt) => `${val.toLocaleString()}`
    },
    xaxis: { categories: [], axisBorder: { show: false }, axisTicks: { show: false } },
    legend: { show: false },
    series: [{ name: 'Conversión', data: [] }]
  });
  funnelChart.render();

  // E. Simulator Projection Chart
  projectionChart = new ApexCharts(document.querySelector("#projection-chart"), {
    ...commonTheme,
    chart: { ...commonTheme.chart, type: 'area', height: 170 },
    colors: ['#10b981'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] }
    },
    series: [{ name: 'MRR Proyectado', data: [] }],
    xaxis: { categories: [], axisBorder: { show: false }, axisTicks: { show: false } }
  });
  projectionChart.render();
};

const updateCharts = () => {
  if (!revenueChart) return;

  const isMonthly = document.getElementById('chart-btn-monthly').classList.contains('active');
  const monthlyData = computeMonthlyHistory();
  const dailyData = computeDailyHistory();
  const funnelData = computeFunnelData();

  // A. Update Revenue Chart
  const revenueHistory = isMonthly 
    ? monthlyData.map(d => ({ label: d.month, mrr: d.mrr, forecast: null }))
    : dailyData.map(d => ({ label: d.date, mrr: d.mrr, forecast: null }));

  const revenueSeriesData = [...revenueHistory];
  if (isMonthly) {
    const lastMRR = monthlyData[monthlyData.length - 1].mrr;
    revenueSeriesData.push(
      { label: 'Jul 2026*', mrr: null, forecast: Math.round(lastMRR * 1.04) },
      { label: 'Aug 2026*', mrr: null, forecast: Math.round(lastMRR * 1.08) },
      { label: 'Sep 2026*', mrr: null, forecast: Math.round(lastMRR * 1.12) }
    );
  }

  revenueChart.updateSeries([
    { name: 'MRR Actual', data: revenueSeriesData.map(d => d.mrr) },
    { name: 'MRR Proyectado', data: revenueSeriesData.map(d => d.forecast) }
  ]);
  revenueChart.updateOptions({
    xaxis: { categories: revenueSeriesData.map(d => d.label) }
  });

  // B. Update Plan Donut
  const lastMonth = monthlyData[monthlyData.length - 1];
  planChart.updateSeries([lastMonth.basic, lastMonth.pro, lastMonth.enterprise]);
  planChart.updateOptions({
    labels: [
      `Plan Básico ($${parameters.Basic.toLocaleString()})`,
      `Plan Pro ($${parameters.Pro.toLocaleString()})`,
      `Plan Enterprise ($${parameters.Enterprise.toLocaleString()})`
    ]
  });

  // C. Update Customer Growth/Churn
  const customerHistory = isMonthly ? monthlyData : dailyData.slice(-15);
  customerChart.updateSeries([
    { name: 'Nuevos Usuarios', data: customerHistory.map(d => d.newUsers) },
    { name: 'Usuarios Perdidos', data: customerHistory.map(d => d.churnedUsers ? -d.churnedUsers : 0) }
  ]);
  customerChart.updateOptions({
    xaxis: { categories: customerHistory.map(d => isMonthly ? d.month : d.date) }
  });

  // D. Update Funnel Conversion
  funnelChart.updateSeries([{ name: 'Conversión', data: funnelData.map(d => d.count) }]);
  funnelChart.updateOptions({
    xaxis: { categories: funnelData.map(d => d.stage) },
    dataLabels: {
      formatter: (val, opt) => {
        const percentage = funnelData[opt.dataPointIndex].percentage;
        return `${percentage}% (${val.toLocaleString()})`;
      }
    }
  });
};

// Toggle revenue chart timeframe tab
window.toggleRevenueTimeframe = (timeframe) => {
  const mBtn = document.getElementById('chart-btn-monthly');
  const dBtn = document.getElementById('chart-btn-daily');

  if (timeframe === 'monthly') {
    dBtn.classList.remove('active');
    mBtn.classList.add('active');
  } else {
    mBtn.classList.remove('active');
    dBtn.classList.add('active');
  }
  updateCharts();
};

// 8. What-If Projections Simulator Logic
const runProjection = () => {
  const startingMRR = Number(document.getElementById('slider-starting-mrr').value);
  const growthRate = Number(document.getElementById('slider-growth-rate').value);
  const arpu = Number(document.getElementById('slider-arpu').value);
  const churnRate = Number(document.getElementById('slider-churn-rate').value);

  // Update slider label values
  document.getElementById('val-starting-mrr').innerText = `$${startingMRR.toLocaleString()}`;
  document.getElementById('val-growth-rate').innerText = `${growthRate}%`;
  document.getElementById('val-arpu').innerText = `$${arpu}`;
  document.getElementById('val-churn-rate').innerText = `${churnRate}%`;

  // Compute 12 months compound projection
  const data = [];
  let currentMRR = startingMRR;
  let customers = Math.round(startingMRR / arpu);
  
  data.push({ month: 'Mes 0', mrr: Math.round(currentMRR), customers });

  for (let m = 1; m <= 12; m++) {
    const newUsers = Math.round(customers * (growthRate / 100));
    const churnedUsers = Math.round(customers * (churnRate / 100));
    customers = customers + newUsers - churnedUsers;
    currentMRR = customers * arpu;
    data.push({ month: `Mes ${m}`, mrr: Math.round(currentMRR), customers });
  }

  const finalMonth = data[data.length - 1];
  const totalGrowthPercent = ((finalMonth.mrr - startingMRR) / startingMRR) * 100;

  // Render stat boxes
  document.getElementById('proj-mrr-value').innerText = `$${finalMonth.mrr.toLocaleString()}`;
  document.getElementById('proj-arr-value').innerText = `$${(finalMonth.mrr * 12).toLocaleString()}`;
  document.getElementById('proj-customers').innerText = finalMonth.customers.toLocaleString();
  
  const growthLabel = document.getElementById('proj-growth-percent');
  growthLabel.className = totalGrowthPercent >= 0 ? 'text-success' : 'text-danger';
  growthLabel.innerText = `+${totalGrowthPercent.toFixed(0)}%`;

  document.getElementById('proj-net-churn-rate').innerText = (growthRate - churnRate).toFixed(1);

  // Update line chart
  if (projectionChart) {
    projectionChart.updateSeries([{ name: 'MRR Proyectado', data: data.map(d => d.mrr) }]);
    projectionChart.updateOptions({ xaxis: { categories: data.map(d => d.month) } });
  }
};

// 9. Report Export Utilities
const handleExportCSV = () => {
  if (!clients || !clients.length) return;

  const headers = ['ID_Cliente', 'Nombre', 'Email', 'Plan', 'Monto', 'Fecha_Carga', 'Estado'];
  const csvRows = [
    headers.join(','),
    ...clients.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.email,
      c.plan,
      c.amount,
      c.date,
      c.status
    ].join(','))
  ];

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'zoma-dash-clients.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleExportPDF = () => {
  if (!clients.length) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw header
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Zoma DASH', 15, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('REPORTE EJECUTIVO DE METRICAS FINANCIERAS Y DE USUARIO', 15, 30);

  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 60, 20);
  doc.text(`Clientes Totales: ${clients.length}`, pageWidth - 60, 28);

  // Section summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 15, 25);
  doc.text('Resumen Ejecutivo de Métricas Clave', 15, 52);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 56, pageWidth - 15, 56);

  // Dynamic calculations for PDF
  const activeClients = clients.filter(c => c.status === 'Active');
  const churnedClients = clients.filter(c => c.status === 'Churned');
  
  const mrrVal = activeClients.reduce((sum, c) => sum + c.amount, 0);
  const arrVal = mrrVal * 12;
  const arpuVal = activeClients.length > 0 ? Math.round(mrrVal / activeClients.length) : 0;
  
  const totalEver = activeClients.length + churnedClients.length;
  const churnVal = totalEver > 0 ? parseFloat(((churnedClients.length / totalEver) * 100).toFixed(1)) : 0;
  const ltvVal = arpuVal > 0 ? Math.round(arpuVal / (churnVal / 100 || 0.025)) : 0;
  const cacVal = parameters.cac;

  const kpis = [
    { label: 'MRR (Mensual)', val: formatCurrency(mrrVal) },
    { label: 'ARR (Anual)', val: formatCurrency(arrVal) },
    { label: 'LTV (Lifetime)', val: formatCurrency(ltvVal) },
    { label: 'CAC (Adquisición)', val: formatCurrency(cacVal) },
    { label: 'Churn Rate', val: `${churnVal}%` },
    { label: 'ARPU (Ticket)', val: formatCurrency(arpuVal) },
  ];

  let cardX = 15;
  let cardY = 62;
  const cardW = 56;
  const cardH = 22;

  kpis.forEach((item, index) => {
    const colIndex = index % 3;
    const rowIndex = Math.floor(index / 3);
    const x = cardX + colIndex * (cardW + 5);
    const y = cardY + rowIndex * (cardH + 4);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label.toUpperCase(), x + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(99, 102, 241);
    doc.text(item.val, x + 4, y + 16);
  });

  // Section Table
  const tableY = cardY + 2 * (cardH + 4) + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 15, 25);
  doc.text('Detalle de Transacciones Recientes', 15, tableY);

  doc.line(15, tableY + 4, pageWidth - 15, tableY + 4);

  const tableHeaders = [['ID', 'Cliente', 'Email', 'Plan', 'Monto', 'Fecha', 'Estado']];
  const tableBody = clients.map(t => [
    t.id,
    t.name,
    t.email,
    t.plan,
    formatCurrency(t.amount),
    t.date,
    t.status === 'Active' ? 'Activo' : t.status === 'Past Due' ? 'Vencido' : 'Cancelado'
  ]);

  doc.autoTable({
    startY: tableY + 8,
    head: tableHeaders,
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    columnStyles: { 0: { cellWidth: 16 }, 3: { cellWidth: 20 }, 4: { cellWidth: 24 }, 5: { cellWidth: 24 }, 6: { cellWidth: 20 } },
    margin: { left: 15, right: 15 }
  });

  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Zoma DASH - Reporte de confidencialidad interna del sistema.', 15, finalY);

  doc.save('zoma-dash-reporte.pdf');
};

// 10. Forms Submits & Listeners setups
const setupEventListeners = () => {
  // Navigation Tabs listeners
  document.getElementById('btn-tab-dashboard').addEventListener('click', () => switchTab('dashboard'));
  document.getElementById('btn-tab-management').addEventListener('click', () => switchTab('management'));
  
  const linkToMng = document.getElementById('link-go-to-management');
  if (linkToMng) linkToMng.addEventListener('click', () => switchTab('management'));

  // Notification button toggle
  const notifBtn = document.getElementById('btn-notifications-toggle');
  const notifPanel = document.getElementById('notifications-panel');
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
      notifPanel.classList.add('hidden');
    });
    notifPanel.addEventListener('click', (e) => e.stopPropagation());
  }

  // Seeding buttons
  document.getElementById('btn-generate-demo').addEventListener('click', () => {
    clients = generateDemoClients();
    saveState();
    pushNotification('Clientes demo generados con éxito en la base de datos.', 'success');
    calculateMetrics();
    renderManagementClients();
  });

  document.getElementById('btn-clear-all').addEventListener('click', () => {
    clients = [];
    saveState();
    pushNotification('Base de datos de clientes vaciada.', 'warning');
    calculateMetrics();
    renderManagementClients();
  });

  // Parameters Settings Submit
  document.getElementById('form-params-config').addEventListener('submit', (e) => {
    e.preventDefault();
    const basicVal = Number(document.getElementById('param-basic-price').value);
    const proVal = Number(document.getElementById('param-pro-price').value);
    const entVal = Number(document.getElementById('param-enterprise-price').value);
    const cacVal = Number(document.getElementById('param-cac').value);

    parameters = { Basic: basicVal, Pro: proVal, Enterprise: entVal, cac: cacVal };
    
    // Update amount for existing clients
    clients = clients.map(c => ({
      ...c,
      amount: parameters[c.plan]
    }));
    
    saveState();
    calculateMetrics();
    pushNotification('Configuraciones y precios actualizados en el sistema.', 'success');

    // Show success alert
    const alertSuccess = document.getElementById('param-success-alert');
    alertSuccess.classList.remove('hidden');
    setTimeout(() => alertSuccess.classList.add('hidden'), 3000);
  });

  // Add Client Form Submit
  document.getElementById('form-add-client').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = document.getElementById('client-name').value.trim();
    const emailVal = document.getElementById('client-email').value.trim();
    const planVal = document.getElementById('client-plan').value;
    const statusVal = document.getElementById('client-status').value;
    const dateVal = document.getElementById('client-date').value;

    const errorEl = document.getElementById('add-client-error-alert');
    if (!nameVal || !emailVal) {
      errorEl.classList.remove('hidden');
      errorEl.innerText = '⚠ Por favor completa nombre y correo electrónico.';
      return;
    }
    errorEl.classList.add('hidden');

    const initials = nameVal.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const newClient = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: nameVal,
      email: emailVal,
      plan: planVal,
      amount: parameters[planVal],
      status: statusVal,
      date: dateVal,
      avatar: initials
    };

    clients = [newClient, ...clients];
    saveState();
    calculateMetrics();
    pushNotification(`Cliente ${nameVal} agregado con éxito al Plan ${planVal}.`, 'success');

    // Reset Form
    document.getElementById('client-name').value = '';
    document.getElementById('client-email').value = '';
    document.getElementById('client-plan').value = 'Basic';
    document.getElementById('client-status').value = 'Active';
    document.getElementById('client-date').value = new Date().toISOString().split('T')[0];

    // Re-render admin client ledger table
    renderManagementClients();
  });

  // Dashboard filtering listeners
  document.getElementById('dashboard-table-search').addEventListener('input', () => {
    const tbody = document.getElementById('dashboard-table-tbody');
    tbody.setAttribute('data-current-page', 1);
    renderDashboardTable();
  });
  document.getElementById('dashboard-table-plan-filter').addEventListener('change', () => {
    const tbody = document.getElementById('dashboard-table-tbody');
    tbody.setAttribute('data-current-page', 1);
    renderDashboardTable();
  });
  document.getElementById('dashboard-table-status-filter').addEventListener('change', () => {
    const tbody = document.getElementById('dashboard-table-tbody');
    tbody.setAttribute('data-current-page', 1);
    renderDashboardTable();
  });

  // Slider simulator listeners
  document.getElementById('slider-starting-mrr').addEventListener('input', runProjection);
  document.getElementById('slider-growth-rate').addEventListener('input', runProjection);
  document.getElementById('slider-arpu').addEventListener('input', runProjection);
  document.getElementById('slider-churn-rate').addEventListener('input', runProjection);

  // CSV & PDF exports triggers
  const btnCSV = document.getElementById('btn-export-csv');
  const btnPDF = document.getElementById('btn-export-pdf');
  if (btnCSV) btnCSV.addEventListener('click', handleExportCSV);
  if (btnPDF) btnPDF.addEventListener('click', handleExportPDF);
};

// 11. Initializer Bootstrapper
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  
  // Set parameter configurations inputs values on load
  document.getElementById('param-basic-price').value = parameters.Basic;
  document.getElementById('param-pro-price').value = parameters.Pro;
  document.getElementById('param-enterprise-price').value = parameters.Enterprise;
  document.getElementById('param-cac').value = parameters.cac;
  
  // Set default client subscription date to today
  document.getElementById('client-date').value = new Date().toISOString().split('T')[0];

  calculateMetrics();
  renderNotifications();
  setupEventListeners();

  // If there are clients, we trigger dashboard initializations
  if (clients.length > 0) {
    initCharts();
    updateCharts();
    runProjection();
    renderDashboardTable();
  } else {
    // Show empty state panel
    switchTab('dashboard');
  }

  // Compile Lucide vector icons
  if (window.lucide) window.lucide.createIcons();
});
