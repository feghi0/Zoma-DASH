import React, { useState } from 'react';
import { 
  Trash2, 
  PlusCircle, 
  Settings, 
  Users, 
  DollarSign, 
  Target,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function DataManagement({ 
  clients, 
  parameters, 
  onUpdateParameters, 
  onAddClient, 
  onDeleteClient, 
  onGenerateDemo, 
  onClearAll 
}) {
  // Add Client Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Basic');
  const [status, setStatus] = useState('Active');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  // Param Config Form States
  const [basicPrice, setBasicPrice] = useState(parameters.Basic);
  const [proPrice, setProPrice] = useState(parameters.Pro);
  const [enterprisePrice, setEnterprisePrice] = useState(parameters.Enterprise);
  const [cac, setCac] = useState(parameters.cac);
  const [paramSuccess, setParamSuccess] = useState(false);

  // Submit new client
  const handleSubmitClient = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError('Por favor completa el nombre y el correo electrónico.');
      return;
    }

    onAddClient({
      name: name.trim(),
      email: email.trim(),
      plan,
      status,
      date
    });

    // Reset Form
    setName('');
    setEmail('');
    setPlan('Basic');
    setStatus('Active');
    setDate(new Date().toISOString().split('T')[0]);
    setFormError('');
  };

  // Submit new parameters
  const handleSubmitParams = (e) => {
    e.preventDefault();
    onUpdateParameters({
      Basic: Number(basicPrice),
      Pro: Number(proPrice),
      Enterprise: Number(enterprisePrice),
      cac: Number(cac)
    });
    setParamSuccess(true);
    setTimeout(() => setParamSuccess(false), 3000);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'active';
      case 'Past Due': return 'past_due';
      case 'Churned': return 'churned';
      default: return '';
    }
  };

  const translateStatus = (status) => {
    switch(status) {
      case 'Active': return 'Activo';
      case 'Past Due': return 'Vencido';
      case 'Churned': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="dashboard-content fadeIn">
      <div style={{ marginBottom: '0.5rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 700 }}>Gestión de Datos y Parámetros</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Configura los precios del sistema, añade o elimina clientes, y simula diferentes volúmenes de datos.
        </p>
      </div>

      {/* Forms Section: Split layout */}
      <div className="charts-grid">
        
        {/* Form 1: SaaS Pricing Parameters */}
        <div className="chart-card span-6">
          <div className="chart-card-header">
            <h4 className="chart-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} style={{ color: 'var(--primary-light)' }} />
              Configurar Precios y CAC
            </h4>
          </div>
          
          <form onSubmit={handleSubmitParams} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="slider-group">
                <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Precio Plan Básico ($)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <DollarSign size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="number" 
                    className="search-input" 
                    style={{ paddingLeft: '2rem' }}
                    value={basicPrice} 
                    onChange={(e) => setBasicPrice(e.target.value)} 
                  />
                </div>
              </div>
              <div className="slider-group">
                <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Precio Plan Pro ($)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <DollarSign size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="number" 
                    className="search-input" 
                    style={{ paddingLeft: '2rem' }}
                    value={proPrice} 
                    onChange={(e) => setProPrice(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="slider-group">
                <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Precio Plan Enterprise ($)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <DollarSign size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="number" 
                    className="search-input" 
                    style={{ paddingLeft: '2rem' }}
                    value={enterprisePrice} 
                    onChange={(e) => setEnterprisePrice(e.target.value)} 
                  />
                </div>
              </div>
              <div className="slider-group">
                <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>CAC Global Promedio ($)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <DollarSign size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="number" 
                    className="search-input" 
                    style={{ paddingLeft: '2rem' }}
                    value={cac} 
                    onChange={(e) => setCac(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              {paramSuccess ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>
                  ✓ Parámetros actualizados
                </span>
              ) : <span />}
              <button type="submit" className="btn-primary">Guardar Configuración</button>
            </div>
          </form>
          
          {/* Action Utilities (demo keys and wipe) */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Operaciones Rápidas de Datos</h5>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={onGenerateDemo} 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                <Sparkles size={16} style={{ color: 'var(--primary-light)' }} />
                Generar Clientes Demo
              </button>
              <button 
                onClick={onClearAll} 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', borderColor: 'rgba(244, 63, 94, 0.4)' }}
              >
                <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                Borrar Base de Datos
              </button>
            </div>
          </div>
        </div>

        {/* Form 2: Add New Client */}
        <div className="chart-card span-6">
          <div className="chart-card-header">
            <h4 className="chart-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} style={{ color: 'var(--success)' }} />
              Registrar Nuevo Cliente
            </h4>
          </div>

          <form onSubmit={handleSubmitClient} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="slider-group">
                <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Juan Pérez" 
                  className="search-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="slider-group">
                <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Correo Electrónico</label>
                <input 
                  type="email" 
                  placeholder="juan@ejemplo.com" 
                  className="search-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="slider-group">
                <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Plan de Suscripción</label>
                <select 
                  className="filter-select" 
                  style={{ width: '100%' }}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                >
                  <option value="Basic">Básico (${Number(basicPrice).toLocaleString()})</option>
                  <option value="Pro">Pro (${Number(proPrice).toLocaleString()})</option>
                  <option value="Enterprise">Enterprise (${Number(enterprisePrice).toLocaleString()})</option>
                </select>
              </div>
              <div className="slider-group">
                <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Estado de Suscripción</label>
                <select 
                  className="filter-select" 
                  style={{ width: '100%' }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Activo</option>
                  <option value="Past Due">Vencido</option>
                  <option value="Churned">Cancelado (Churned)</option>
                </select>
              </div>
            </div>

            <div className="slider-group">
              <label className="slider-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Fecha de Suscripción / Pago</label>
              <input 
                type="date" 
                className="date-picker-input" 
                style={{ width: '100%' }}
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>

            {formError && (
              <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: '600' }}>
                ⚠ {formError}
              </span>
            )}

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.25rem' }}>
              <PlusCircle size={16} />
              Agregar Cliente
            </button>
          </form>
        </div>
      </div>

      {/* Client List Ledger (Simple, spaced table) */}
      <div className="table-card" style={{ marginTop: '0.75rem' }}>
        <div className="chart-card-header">
          <h4 className="chart-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} style={{ color: 'var(--primary-light)' }} />
            Clientes Registrados ({clients.length})
          </h4>
        </div>

        <div className="table-wrapper">
          {clients.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Plan Contratado</th>
                  <th>Monto Mensual</th>
                  <th>Fecha de Pago</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="customer-badge">
                        <div className="avatar">{c.avatar}</div>
                        <div className="customer-info">
                          <span className="customer-name">{c.name}</span>
                          <span className="customer-email">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-bold">{c.plan}</td>
                    <td className="text-bold">${c.amount.toLocaleString()}</td>
                    <td>{c.date}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(c.status)}`}>
                        {translateStatus(c.status)}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => onDeleteClient(c.id)}
                        className="btn-secondary" 
                        style={{ padding: '0.4rem', border: 'none', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No hay clientes registrados en el sistema. Utiliza el formulario superior o haz clic en "Generar Clientes Demo" para comenzar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
