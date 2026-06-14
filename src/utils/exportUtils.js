import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Convert JSON data array to CSV format and trigger browser download
export const exportToCSV = (data, filename = 'saas-metrics-export.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        const val = row[fieldName];
        // Escape quotes and wrap string values in double quotes
        const escaped = ('' + val).replace(/"/g, '\\"');
        return typeof val === 'string' && val.includes(',') ? `"${escaped}"` : escaped;
      }).join(',')
    )
  ];

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate a high-quality branded PDF report of KPIs and transaction list
export const exportToPDF = (kpis, transactions, dateRange = 'Last 30 Days') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Brand color palette
  const brandDark = '#0b0f19';
  const brandPrimary = '#6366f1';
  const textGray = '#64748b';

  // 1. Draw PDF Header Background Decor
  doc.setFillColor(11, 15, 25); // #0b0f19
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // 2. Draw Brand Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Zoma DASH', 15, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Cool muted text
  doc.text('REPORTE EJECUTIVO DE METRICAS FINANCIERAS Y DE USUARIO', 15, 30);
  
  // Date and Time info on the right header
  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  const now = new Date();
  doc.text(`Fecha: ${now.toLocaleDateString()}`, pageWidth - 60, 20);
  doc.text(`Rango: ${dateRange}`, pageWidth - 60, 26);
  doc.text('Estado: Generado Automáticamente', pageWidth - 60, 32);

  // 3. Section: Summary KPIs (Metrics Box Layout)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 15, 25);
  doc.text('Resumen Ejecutivo de Métricas Clave', 15, 52);
  
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 56, pageWidth - 15, 56);

  // Render KPI boxes manually
  const kpiItems = [
    { label: 'MRR (Mensual)', val: `$${kpis.mrr.value.toLocaleString()}` },
    { label: 'ARR (Anual)', val: `$${kpis.arr.value.toLocaleString()}` },
    { label: 'LTV (Lifetime)', val: `$${kpis.ltv.value.toLocaleString()}` },
    { label: 'CAC (Adquisición)', val: `$${kpis.cac.value.toLocaleString()}` },
    { label: 'Churn Rate', val: `${kpis.churn.value}%` },
    { label: 'ARPU (Promedio)', val: `$${kpis.arpu.value.toLocaleString()}` },
  ];

  doc.setFontSize(10);
  let cardX = 15;
  let cardY = 62;
  const cardW = 56;
  const cardH = 22;

  kpiItems.forEach((item, index) => {
    // Determine grid coordinates (3 cards per row)
    const colIndex = index % 3;
    const rowIndex = Math.floor(index / 3);
    const x = cardX + colIndex * (cardW + 5);
    const y = cardY + rowIndex * (cardH + 4);

    // Draw card box
    doc.setFillColor(248, 250, 252); // soft gray
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate muted
    doc.text(item.label.toUpperCase(), x + 4, y + 6);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(99, 102, 241); // indigo primary
    doc.text(item.val, x + 4, y + 16);
  });

  // 4. Section: Recent Transactions Table
  const tableY = cardY + 2 * (cardH + 4) + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 15, 25);
  doc.text('Detalle de Transacciones Recientes', 15, tableY);
  
  // Divider
  doc.line(15, tableY + 4, pageWidth - 15, tableY + 4);

  // Prepare table data
  const tableHeaders = [['ID', 'Cliente', 'Email', 'Plan', 'Monto', 'Fecha', 'Estado']];
  const tableBody = transactions.map(t => [
    t.id,
    t.name,
    t.email,
    t.plan,
    `$${t.amount}`,
    t.date,
    t.status === 'Active' ? 'Activo' : t.status === 'Past Due' ? 'Vencido' : 'Cancelado'
  ]);

  autoTable(doc, {
    startY: tableY + 8,
    head: tableHeaders,
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241], // Indigo primary
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 16 },
      3: { cellWidth: 20 },
      4: { cellWidth: 16 },
      5: { cellWidth: 24 },
      6: { cellWidth: 20 }
    },
    margin: { left: 15, right: 15 }
  });

  // Footer note on PDF
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Zoma DASH - Reporte de confidencialidad interna del sistema.', 15, finalY);

  // Trigger browser download
  doc.save(filename);
};
