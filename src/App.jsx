import React, { useState, useMemo, useEffect } from 'react';
import { 
  DEFAULT_PLAN_PRICING,
  DEFAULT_CAC,
  calculateFunnelData,
  generateDemoClients
} from './utils/mockData';
import KPICards from './components/KPICards';
import ChartsSection from './components/ChartsSection';
import TransactionsTable from './components/TransactionsTable';
import SaaSProjectionCalculator from './components/SaaSProjectionCalculator';
import DataManagement from './components/DataManagement';
import { exportToCSV, exportToPDF } from './utils/exportUtils';
import { 
  Download, 
  Calendar, 
  Filter, 
  Bell, 
  BarChart2,
  AlertCircle,
  Users,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  // Navigation Tabs state: 'dashboard' or 'management'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('Last30'); // 'Last7', 'Last30', 'YTD'
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Bienvenido a Zoma DASH. Ve a "Gestión de Datos" para registrar clientes o generar la demo.', type: 'success', read: false }
  ]);

  // Load state from localStorage or initialize clean empty arrays
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('saas_clients');
    return saved ? JSON.parse(saved) : []; // Cleared by default!
  });

  const [parameters, setParameters] = useState(() => {
    const saved = localStorage.getItem('saas_parameters');
    return saved ? JSON.parse(saved) : {
      Basic: DEFAULT_PLAN_PRICING.Basic,
      Pro: DEFAULT_PLAN_PRICING.Pro,
      Enterprise: DEFAULT_PLAN_PRICING.Enterprise,
      cac: DEFAULT_CAC
    };
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('saas_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('saas_parameters', JSON.stringify(parameters));
  }, [parameters]);

  // Add notification utility
  const pushNotification = (text, type = 'success') => {
    setNotifications(prev => [
      { id: Date.now(), text, type, read: false },
      ...prev.slice(0, 4) // keep last 5 notifications
    ]);
  };

  // 1. Dynamic Calculations: Compute active KPI statistics based on current client state
  const computedMetrics = useMemo(() => {
    const totalCount = clients.length;
    const activeClients = clients.filter(c => c.status === 'Active');
    const churnedClients = clients.filter(c => c.status === 'Churned');
    const pastDueClients = clients.filter(c => c.status === 'Past Due');

    // MRR is the sum of amounts of all currently active clients
    const mrrValue = activeClients.reduce((acc, c) => acc + c.amount, 0);
    const arrValue = mrrValue * 12;
    
    // Average revenue per user (ARPU) based on active list
    const activeCount = activeClients.length;
    const arpuValue = activeCount > 0 ? Math.round(mrrValue / activeCount) : 0;

    // Churn Rate % = churned / (active + churned)
    const totalUsersEver = activeCount + churnedClients.length;
    const churnValue = totalUsersEver > 0 
      ? parseFloat(((churnedClients.length / totalUsersEver) * 100).toFixed(1)) 
      : 0;

    // LTV = ARPU / Churn Rate %
    const churnDecimal = churnValue / 100 || 0.025; // fallback to 2.5% if no churn
    const ltvValue = arpuValue > 0 ? Math.round(arpuValue / churnDecimal) : 0;
    
    const cacValue = parameters.cac;

    return {
      mrr: { value: mrrValue, change: 0, isPositive: true },
      arr: { value: arrValue, change: 0, isPositive: true },
      ltv: { value: ltvValue, change: 0, isPositive: true },
      cac: { value: cacValue, change: 0, isPositive: true },
      churn: { value: churnValue, change: 0, isPositive: true },
      arpu: { value: arpuValue, change: 0, isPositive: true }
    };
  }, [clients, parameters]);

  // 2. Data aggregation: generate 12-month historical series from client logs
  const computedMonthlyHistory = useMemo(() => {
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
      // Find clients registered in or before this month
      const activeThisMonth = clients.filter(c => {
        const cDate = new Date(c.date);
        const cYear = cDate.getFullYear();
        const cMonth = cDate.getMonth();
        
        const isRegistered = cYear < year || (cYear === year && cMonth <= monthIndex);
        if (!isRegistered) return false;

        // If churned, check if they churned after this month
        if (c.status === 'Churned') {
          return cYear > year || (cYear === year && cMonth > monthIndex);
        }
        return true;
      });

      const newThisMonth = clients.filter(c => {
        const cDate = new Date(c.date);
        return cDate.getFullYear() === year && cDate.getMonth() === monthIndex;
      });

      const churnedThisMonth = clients.filter(c => {
        const cDate = new Date(c.date);
        return c.status === 'Churned' && cDate.getFullYear() === year && cDate.getMonth() === monthIndex;
      });

      const basicCount = activeThisMonth.filter(c => c.plan === 'Basic').length;
      const proCount = activeThisMonth.filter(c => c.plan === 'Pro').length;
      const entCount = activeThisMonth.filter(c => c.plan === 'Enterprise').length;

      const mrrSum = 
        basicCount * parameters.Basic + 
        proCount * parameters.Pro + 
        entCount * parameters.Enterprise;

      return {
        month: label,
        mrr: mrrSum,
        arr: mrrSum * 12,
        activeUsers: activeThisMonth.length,
        newUsers: newThisMonth.length,
        churnedUsers: churnedThisMonth.length,
        basic: basicCount,
        pro: proCount,
        enterprise: entCount
      };
    });
  }, [clients, parameters]);

  // 3. Data aggregation: generate 30-day daily history from client logs
  const computedDailyHistory = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];

      // Filter clients registered on or before this day
      const activeOnDay = clients.filter(c => {
        return c.date <= dateStr && (c.status !== 'Churned' || c.date > dateStr);
      });

      const newOnDay = clients.filter(c => c.date === dateStr);
      const churnedOnDay = clients.filter(c => c.status === 'Churned' && c.date === dateStr);

      const dayMRR = activeOnDay.reduce((sum, c) => sum + c.amount, 0);

      data.push({
        date: dateStr,
        mrr: dayMRR,
        arr: dayMRR * 12,
        subscribers: activeOnDay.length,
        newUsers: newOnDay.length,
        churnedUsers: churnedOnDay.length,
        revenue: Math.round(dayMRR / 30)
      });
    }
    return data;
  }, [clients]);

  const computedFunnel = useMemo(() => {
    return calculateFunnelData(clients);
  }, [clients]);

  // Add new client transaction callback
  const handleAddClient = (newClient) => {
    // Generate avatar initials
    const words = newClient.name.split(' ');
    const avatar = words.map(w => w[0]).join('').substring(0, 2).toUpperCase();
    
    const clientRecord = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newClient.name,
      email: newClient.email,
      plan: newClient.plan,
      amount: parameters[newClient.plan],
      status: newClient.status,
      date: newClient.date,
      avatar
    };

    setClients(prev => [clientRecord, ...prev]);
    pushNotification(`Cliente ${newClient.name} agregado con éxito al Plan ${newClient.plan}.`, 'success');
  };

  // Delete client callback
  const handleDeleteClient = (id) => {
    const target = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    if (target) {
      pushNotification(`Cliente ${target.name} eliminado de la base de datos.`, 'warning');
    }
  };

  // Update configuration parameters
  const handleUpdateParameters = (newParams) => {
    setParameters(newParams);
    
    // Recalculate billing amount of all current clients based on new pricing
    setClients(prev => prev.map(c => ({
      ...c,
      amount: newParams[c.plan]
    })));
    pushNotification('Parámetros de facturación y precios modificados con éxito.', 'success');
  };

  // Generate seed demo data
  const handleGenerateDemo = () => {
    const demo = generateDemoClients(parameters);
    setClients(demo);
    pushNotification('Clientes demo cargados con éxito en la base de datos.', 'success');
  };

  // Wipe client database
  const handleClearAll = () => {
    setClients([]);
    pushNotification('Base de datos de clientes borrada completamente.', 'warning');
  };

  // PDF Export
  const handleExportPDF = () => {
    const dateRangeLabel = dateRange === 'Last7' ? 'Últimos 7 días' : dateRange === 'Last30' ? 'Últimos 30 días' : 'YTD';
    exportToPDF(computedMetrics, clients, `${dateRangeLabel} (Clientes Totales: ${clients.length})`);
  };

  // CSV Export
  const handleExportCSV = () => {
    const dataToExport = clients.map(c => ({
      ID_Cliente: c.id,
      Nombre: c.name,
      Email: c.email,
      Plan: c.plan,
      Monto: c.amount,
      Fecha_Carga: c.date,
      Estado: c.status
    }));
    exportToCSV(dataToExport, `saas-clients-ledger.csv`);
  };

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <div className="brand-icon">
            <BarChart2 />
          </div>
          <div>
            <h1 className="brand-title">Zoma DASH</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NÚCLEO DE CONTROL Y DATOS DINÁMICOS</span>
          </div>
        </div>

        {/* Tab Selector Links */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            className={`chart-btn-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem' }}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
          <button 
            className={`chart-btn-tab ${activeTab === 'management' ? 'active' : ''}`}
            onClick={() => setActiveTab('management')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem' }}
          >
            <Users size={14} />
            Gestión de Datos
          </button>
        </div>

        {/* Control actions */}
        <div className="controls-section">
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
              <select 
                className="filter-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="Last7">Últimos 7 Días</option>
                <option value="Last30">Últimos 30 Días</option>
                <option value="YTD">YTD (Año a la fecha)</option>
              </select>
            </div>
          )}

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setShowNotification(!showNotification)}
              style={{ padding: '0.6rem', display: 'flex', alignItems: 'center' }}
            >
              <Bell size={18} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: 'var(--danger)', color: 'white',
                  fontSize: '9px', fontWeight: 'bold', width: '18px', height: '18px',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotification && (
              <div style={{
                position: 'absolute', top: '115%', right: 0, width: '320px',
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 110,
                display: 'flex', flexDirection: 'column', gap: '0.75rem'
              }} className="fadeIn">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Registro del Sistema</span>
                  <AlertCircle size={16} style={{ color: 'var(--primary-light)' }} />
                </div>
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))}
                    style={{
                      padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                      backgroundColor: n.read ? 'rgba(30, 41, 59, 0.2)' : 'rgba(99, 102, 241, 0.08)',
                      borderLeft: `3px solid ${n.type === 'warning' ? 'var(--danger)' : 'var(--success)'}`,
                      fontSize: '0.75rem', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {n.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={handleExportCSV} disabled={clients.length === 0}>
              <Download size={15} /> Exportar CSV
            </button>
            <button className="btn-primary" onClick={handleExportPDF} disabled={clients.length === 0}>
              <Download size={15} /> Reporte PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content routing */}
      {activeTab === 'dashboard' ? (
        <main className="dashboard-content">
          {clients.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '6rem 2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)', textAlign: 'center', gap: '1.25rem', marginTop: '1rem'
            }} className="fadeIn">
              <AlertCircle size={48} style={{ color: 'var(--primary-light)' }} />
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>Tu base de datos está vacía</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '480px' }}>
                  No hay clientes registrados en el sistema para calcular métricas. 
                  Ve a la pestaña de **Gestión de Datos** para añadir tus primeros registros o cargar los datos demo en un clic.
                </p>
              </div>
              <button onClick={() => setActiveTab('management')} className="btn-primary">
                Ir a Gestión de Datos
              </button>
            </div>
          ) : (
            <>
              {/* Row 1: KPI Statistics Summary */}
              <KPICards kpis={computedMetrics} />

              {/* Row 2: Charts and Diagrams */}
              <ChartsSection 
                monthlyHistory={computedMonthlyHistory} 
                dailyHistory={computedDailyHistory} 
                funnelData={computedFunnel} 
                planPricing={parameters}
              />

              {/* Row 3: Projection Simulator Sandbox */}
              <SaaSProjectionCalculator />

              {/* Row 4: Subscribers Ledger */}
              <TransactionsTable transactions={clients} onDeleteClient={handleDeleteClient} />
            </>
          )}
        </main>
      ) : (
        <main>
          <DataManagement 
            clients={clients}
            parameters={parameters}
            onUpdateParameters={handleUpdateParameters}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
            onGenerateDemo={handleGenerateDemo}
            onClearAll={handleClearAll}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <div>
          <span>© 2026 Zoma DASH. Todos los derechos reservados.</span>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Soporte Técnico</a>
          <a href="#" className="footer-link">Documentación API</a>
          <a href="#" className="footer-link">Privacidad</a>
        </div>
      </footer>
    </div>
  );
}
