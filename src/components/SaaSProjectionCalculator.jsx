import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Sparkles } from 'lucide-react';

export default function SaaSProjectionCalculator() {
  // Lever states with default parameters
  const [startingMRR, setStartingMRR] = useState(50000);
  const [growthRate, setGrowthRate] = useState(8); // % new signups per month
  const [arpu, setArpu] = useState(79); // average revenue per user
  const [churnRate, setChurnRate] = useState(2.5); // % lost users per month

  // Run the 12-month projections simulation
  const projectionData = useMemo(() => {
    const data = [];
    let currentMRR = startingMRR;
    let customers = Math.round(startingMRR / arpu);
    
    // Month 0
    data.push({
      month: 'Mes 0',
      mrr: Math.round(currentMRR),
      arr: Math.round(currentMRR * 12),
      customers
    });

    for (let m = 1; m <= 12; m++) {
      const newUsers = Math.round(customers * (growthRate / 100));
      const churnedUsers = Math.round(customers * (churnRate / 100));
      
      customers = customers + newUsers - churnedUsers;
      currentMRR = customers * arpu;

      data.push({
        month: `Mes ${m}`,
        mrr: Math.round(currentMRR),
        arr: Math.round(currentMRR * 12),
        customers
      });
    }

    return data;
  }, [startingMRR, growthRate, arpu, churnRate]);

  // Extract final projection figures
  const finalMonth = projectionData[projectionData.length - 1];
  const totalGrowthPercent = ((finalMonth.mrr - startingMRR) / startingMRR) * 100;

  // Chart configuration for projection visual
  const chartSeries = [
    {
      name: 'MRR Proyectado',
      data: projectionData.map(d => d.mrr)
    }
  ];

  const chartOptions = {
    theme: { mode: 'dark' },
    chart: {
      background: 'transparent',
      foreColor: '#94a3b8',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }
    },
    colors: ['#10b981'], // Emerald line for projections
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 4
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: projectionData.map(d => d.month),
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${Math.round(val / 1000)}k`
      }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val) => `$${val.toLocaleString()}`
      }
    }
  };

  return (
    <div className="table-card fadeIn" style={{ animationDelay: '0.55s' }}>
      <div className="chart-card-header">
        <h4 className="chart-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--warning)' }} />
          Simulador Científico de Proyecciones SaaS
        </h4>
      </div>
      
      <div className="simulator-card">
        {/* Dynamic Sliders */}
        <div className="simulator-controls">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Ajusta los motores de crecimiento para simular los próximos 12 meses de rendimiento financiero:
          </p>

          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-label">MRR Inicial</span>
              <span className="slider-value">${startingMRR.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="5000" 
              max="250000" 
              step="5000"
              value={startingMRR}
              className="range-slider"
              onChange={(e) => setStartingMRR(Number(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-label">Crecimiento Mensual (Nuevos Registros)</span>
              <span className="slider-value">{growthRate}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="35" 
              step="0.5"
              value={growthRate}
              className="range-slider"
              onChange={(e) => setGrowthRate(Number(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-label">ARPU (Ticket Promedio Mensual)</span>
              <span className="slider-value">${arpu}</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="450" 
              step="5"
              value={arpu}
              className="range-slider"
              onChange={(e) => setArpu(Number(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-label">Tasa de Cancelación (Churn Mensual)</span>
              <span className="slider-value">{churnRate}%</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="15" 
              step="0.1"
              value={churnRate}
              className="range-slider"
              onChange={(e) => setChurnRate(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Projections Visual Table and Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="simulator-projection">
            <div className="projection-header">
              <span className="projection-title">Previsión a 12 Meses</span>
              <p className="projection-desc">Basado en un churn neto de {(growthRate - churnRate).toFixed(1)}% mensual</p>
            </div>
            
            <div className="projection-stats">
              <div className="proj-stat-box">
                <span className="proj-stat-label">MRR Proyectado (Mes 12)</span>
                <div className="proj-stat-value">${finalMonth.mrr.toLocaleString()}</div>
              </div>
              <div className="proj-stat-box">
                <span className="proj-stat-label">ARR Proyectado (Mes 12)</span>
                <div className="proj-stat-value arr">${finalMonth.arr.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <span>Clientes Proyectados: <b>{finalMonth.customers.toLocaleString()}</b></span>
              <span>Crecimiento Total: <b className={totalGrowthPercent >= 0 ? 'text-success' : 'text-danger'}>+{totalGrowthPercent.toFixed(0)}%</b></span>
            </div>
          </div>

          <div style={{ height: '170px' }}>
            <Chart 
              options={chartOptions} 
              series={chartSeries} 
              type="area" 
              height={170} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
