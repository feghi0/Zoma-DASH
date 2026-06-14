import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Percent, 
  Activity,
  Award
} from 'lucide-react';

export default function KPICards({ kpis }) {
  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper to format values
  const formatValue = (key, val) => {
    if (key === 'churn') return `${val}%`;
    if (key === 'ltv_cac_ratio') return `${val.toFixed(1)}x`;
    return formatCurrency(val);
  };

  // Calculate LTV to CAC Ratio dynamically
  const ltvVal = kpis.ltv.value;
  const cacVal = kpis.cac.value;
  const ltvCacRatio = cacVal > 0 ? ltvVal / cacVal : 0;
  
  // Decide badge styling for the ratio
  const getRatioClass = (ratio) => {
    if (ratio >= 3) return 'text-success'; // Healthy SaaS ratio is 3:1 or higher
    if (ratio >= 2) return 'text-warning';
    return 'text-danger';
  };

  // Metric definitions including title, value, icon, and custom style classes
  const cards = [
    {
      key: 'mrr',
      title: 'MRR (Men. Recurrente)',
      value: kpis.mrr.value,
      change: kpis.mrr.change,
      isPositive: kpis.mrr.isPositive,
      icon: DollarSign,
      class: 'mrr',
      desc: 'Ingresos Mensuales Recurrentes'
    },
    {
      key: 'arr',
      title: 'ARR (Anual Run Rate)',
      value: kpis.arr.value,
      change: kpis.arr.change,
      isPositive: kpis.arr.isPositive,
      icon: Activity,
      class: 'arr',
      desc: 'Proyección de Ingresos Anuales'
    },
    {
      key: 'ltv',
      title: 'LTV (Lifetime Value)',
      value: kpis.ltv.value,
      change: kpis.ltv.change,
      isPositive: kpis.ltv.isPositive,
      icon: Award,
      class: 'ltv',
      desc: 'Valor Neto del Cliente en su Ciclo'
    },
    {
      key: 'cac',
      title: 'CAC (Costo Adquisición)',
      value: kpis.cac.value,
      change: kpis.cac.change,
      isPositive: kpis.cac.isPositive, // For CAC, a negative change is positive (lower cost)
      icon: Target,
      class: 'cac',
      desc: 'Costo Promedio de Conversión'
    },
    {
      key: 'ltv_cac',
      title: 'Relación LTV : CAC',
      value: ltvCacRatio,
      isRatio: true,
      icon: TrendingUp,
      class: 'mrr', // indigo-themed
      desc: 'Salud de la Unidad Económica (Objetivo > 3x)'
    },
    {
      key: 'churn',
      title: 'Tasa de Cancelación',
      value: kpis.churn.value,
      change: kpis.churn.change,
      isPositive: kpis.churn.isPositive, // Lower churn is positive
      icon: Percent,
      class: 'churn',
      desc: 'Churn Mensual de Suscriptores'
    },
    {
      key: 'arpu',
      title: 'ARPU (Ticket Medio)',
      value: kpis.arpu.value,
      change: kpis.arpu.change,
      isPositive: kpis.arpu.isPositive,
      icon: Users,
      class: 'arpu',
      desc: 'Ingreso Promedio por Usuario'
    }
  ];

  return (
    <section className="kpi-grid">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        
        return (
          <div key={card.key} className={`kpi-card ${card.class} fadeIn`} style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="kpi-header">
              <span className="kpi-title">{card.title}</span>
              <div className="kpi-icon-wrapper">
                <IconComponent size={18} />
              </div>
            </div>
            
            <div className="kpi-body">
              <h3 className="kpi-value">
                {card.isRatio 
                  ? formatValue('ltv_cac_ratio', card.value) 
                  : formatValue(card.key, card.value)
                }
              </h3>
            </div>
            
            <div className="kpi-footer">
              {card.isRatio ? (
                <span className={`kpi-trend ${getRatioClass(card.value)}`}>
                  {card.value >= 3 ? 'Saludable' : card.value >= 2 ? 'Aceptable' : 'Riesgoso'}
                </span>
              ) : (
                <>
                  <span className={`kpi-trend ${card.isPositive ? 'positive' : 'negative'}`}>
                    {card.isPositive ? <TrendingUp size={14} style={{ marginRight: '2px' }} /> : <TrendingDown size={14} style={{ marginRight: '2px' }} />}
                    {Math.abs(card.change)}%
                  </span>
                  <span className="kpi-trend-period">vs mes ant.</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
