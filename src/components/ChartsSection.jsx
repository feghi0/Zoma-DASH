import React, { useState } from 'react';
import Chart from 'react-apexcharts';

export default function ChartsSection({ monthlyHistory, dailyHistory, funnelData, planPricing }) {
  const [revenueTimeframe, setRevenueTimeframe] = useState('monthly'); // 'monthly' or 'daily'

  // Common styles for tooltips and labels to fit eye-friendly slate theme
  const chartThemeOptions = {
    theme: {
      mode: 'dark'
    },
    chart: {
      background: 'transparent',
      foreColor: '#94a3b8', // text-secondary
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }
    },
    grid: {
      borderColor: '#1e293b', // border-color
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: (val) => `$${val.toLocaleString()}`
      }
    }
  };

  // 1. Revenue Growth & Forecast Options (Area Chart)
  const isMonthly = revenueTimeframe === 'monthly';
  
  // Historical plus forecast (simple linear model for next 3 months)
  const revenueHistory = isMonthly 
    ? monthlyHistory.map(d => ({ label: d.month, mrr: d.mrr, forecast: null }))
    : dailyHistory.map(d => ({ label: d.date, mrr: d.mrr, forecast: null }));

  // Add 3 forecasted months/days if monthly
  const revenueSeriesData = [...revenueHistory];
  if (isMonthly) {
    const lastMRR = monthlyHistory[monthlyHistory.length - 1].mrr;
    revenueSeriesData.push(
      { label: 'Jul 2026*', mrr: null, forecast: Math.round(lastMRR * 1.04) },
      { label: 'Aug 2026*', mrr: null, forecast: Math.round(lastMRR * 1.08) },
      { label: 'Sep 2026*', mrr: null, forecast: Math.round(lastMRR * 1.12) }
    );
  }

  const revenueSeries = [
    {
      name: 'MRR Actual',
      data: revenueSeriesData.map(d => d.mrr)
    },
    {
      name: 'MRR Proyectado',
      data: revenueSeriesData.map(d => d.forecast)
    }
  ];

  const revenueOptions = {
    ...chartThemeOptions,
    chart: {
      ...chartThemeOptions.chart,
      type: 'area',
      stacked: false
    },
    colors: ['#6366f1', '#a5b4fc'], // Indigo & Soft Indigo (for projection)
    stroke: {
      curve: 'smooth',
      width: [3, 2],
      dashArray: [0, 5] // dash line for projections
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: revenueSeriesData.map(d => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -30,
        style: { fontSize: '10px' }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${Math.round(val / 1000)}k`
      }
    },
    tooltip: {
      ...chartThemeOptions.tooltip,
      y: {
        formatter: (val) => `$${val ? val.toLocaleString() : 'N/A'}`
      }
    }
  };

  // 2. Customer Growth & Churn (Stacked/Grouped Bar Chart)
  const customerHistory = isMonthly ? monthlyHistory : dailyHistory.slice(-15); // limit daily to last 15 for readability
  const customerSeries = [
    {
      name: 'Nuevos Usuarios',
      data: customerHistory.map(d => d.newUsers)
    },
    {
      name: 'Usuarios Perdidos',
      data: customerHistory.map(d => d.churnedUsers ? -d.churnedUsers : 0) // negative values render below axis
    }
  ];

  const customerOptions = {
    ...chartThemeOptions,
    chart: {
      ...chartThemeOptions.chart,
      type: 'bar',
      stacked: true
    },
    colors: ['#10b981', '#f43f5e'], // Emerald & Soft Rose
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '55%'
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: customerHistory.map(d => isMonthly ? d.month : d.date),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -30,
        style: { fontSize: '10px' }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => Math.abs(val)
      }
    },
    tooltip: {
      ...chartThemeOptions.tooltip,
      y: {
        formatter: (val) => Math.abs(val)
      }
    }
  };

  // 3. Plan Distribution (Donut Chart)
  const currentMonth = monthlyHistory[monthlyHistory.length - 1];
  const planSeries = [currentMonth.basic, currentMonth.pro, currentMonth.enterprise];
  const planLabels = [
    `Plan Básico ($${planPricing?.Basic.toLocaleString()})`,
    `Plan Pro ($${planPricing?.Pro.toLocaleString()})`,
    `Plan Enterprise ($${planPricing?.Enterprise.toLocaleString()})`
  ];

  const planOptions = {
    ...chartThemeOptions,
    chart: {
      ...chartThemeOptions.chart,
      type: 'donut'
    },
    colors: ['#06b6d4', '#6366f1', '#8b5cf6'], // Cyan, Indigo, Purple
    labels: planLabels,
    stroke: {
      show: true,
      width: 2,
      colors: ['#121926'] // card background color for padding
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              offsetY: -8
            },
            value: {
              show: true,
              fontSize: '20px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: '#f8fafc',
              offsetY: 8,
              formatter: (val) => val.toLocaleString()
            },
            total: {
              show: true,
              label: 'Suscriptores',
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 500,
              formatter: (w) => {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString();
              }
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '11px',
      markers: {
        radius: 4,
        offsetX: -4
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4
      }
    },
    tooltip: {
      ...chartThemeOptions.tooltip,
      y: {
        formatter: (val) => `${val} cuentas`
      }
    }
  };

  // 4. Acquisition Funnel (Horizontal bar representation)
  const funnelSeries = [
    {
      name: 'Conversión',
      data: funnelData.map(d => d.count)
    }
  ];

  const funnelOptions = {
    ...chartThemeOptions,
    chart: {
      ...chartThemeOptions.chart,
      type: 'bar'
    },
    colors: ['#06b6d4'], // Cyan
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: true,
        barHeight: '60%',
        distributed: true,
        dataLabels: {
          position: 'center'
        }
      }
    },
    colors: ['#6366f1', '#4f46e5', '#4338ca', '#312e81'], // gradients of indigo for funnel stages
    dataLabels: {
      enabled: true,
      textAnchor: 'middle',
      style: {
        colors: ['#fff'],
        fontWeight: 'bold',
        fontSize: '11px'
      },
      formatter: function (val, opt) {
        const stage = funnelData[opt.dataPointIndex];
        return `${stage.percentage}% (${val.toLocaleString()})`;
      },
      offsetX: 0
    },
    xaxis: {
      categories: funnelData.map(d => d.stage),
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          fontSize: '11px',
          fontWeight: 500
        }
      }
    },
    tooltip: {
      ...chartThemeOptions.tooltip,
      y: {
        formatter: (val) => `${val.toLocaleString()} usuarios`
      }
    },
    legend: { show: false }
  };

  return (
    <section className="charts-grid">
      {/* Revenue growth area chart */}
      <div className="chart-card span-8 fadeIn" style={{ animationDelay: '0.3s' }}>
        <div className="chart-card-header">
          <h4 className="chart-card-title">Crecimiento de Ingresos Recurrentes (MRR)</h4>
          <div className="chart-card-actions">
            <button 
              className={`chart-btn-tab ${isMonthly ? 'active' : ''}`} 
              onClick={() => setRevenueTimeframe('monthly')}
            >
              Mensual
            </button>
            <button 
              className={`chart-btn-tab ${!isMonthly ? 'active' : ''}`} 
              onClick={() => setRevenueTimeframe('daily')}
            >
              Diario (Últ. 30 días)
            </button>
          </div>
        </div>
        <div className="chart-container">
          <Chart 
            options={revenueOptions} 
            series={revenueSeries} 
            type="area" 
            height={320} 
          />
        </div>
      </div>

      {/* Subscription split donut chart */}
      <div className="chart-card span-4 fadeIn" style={{ animationDelay: '0.35s' }}>
        <div className="chart-card-header">
          <h4 className="chart-card-title">Distribución por Plan de Suscripción</h4>
        </div>
        <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Chart 
            options={planOptions} 
            series={planSeries} 
            type="donut" 
            height={290} 
          />
        </div>
      </div>

      {/* User Growth & Churn bar chart */}
      <div className="chart-card span-6 fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="chart-card-header">
          <h4 className="chart-card-title">Adquisición vs Cancelación de Usuarios</h4>
        </div>
        <div className="chart-container">
          <Chart 
            options={customerOptions} 
            series={customerSeries} 
            type="bar" 
            height={320} 
          />
        </div>
      </div>

      {/* Marketing Conversion Funnel bar chart */}
      <div className="chart-card span-6 fadeIn" style={{ animationDelay: '0.45s' }}>
        <div className="chart-card-header">
          <h4 className="chart-card-title">Embudo de Conversión de Clientes (Funnel)</h4>
        </div>
        <div className="chart-container">
          <Chart 
            options={funnelOptions} 
            series={funnelSeries} 
            type="bar" 
            height={320} 
          />
        </div>
      </div>
    </section>
  );
}
