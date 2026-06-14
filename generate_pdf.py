import sys
from fpdf import FPDF

class ZomaPDF(FPDF):
    def header(self):
        # Top banner background
        self.set_fill_color(11, 15, 25) # #0b0f19
        self.rect(0, 0, 210, 32, 'F')
        
        # Header titles
        self.set_xy(15, 8)
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, 'ZOMA DASH', ln=True)
        
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(148, 163, 184)
        self.cell(0, 5, 'SISTEMA DE ANALITICAS Y GESTION DE METRICAS SAAS', ln=True)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(100, 116, 139)
        # Horizontal divider
        self.set_draw_color(226, 232, 240)
        self.set_line_width(0.2)
        self.line(15, 282, 195, 282)
        
        self.cell(0, 10, f'Zoma DASH - Documentacion del Sistema - Pagina {self.page_no()}', 0, 0, 'C')

def create_info_pdf():
    pdf = ZomaPDF()
    pdf.set_top_margin(40)
    pdf.set_left_margin(15)
    pdf.set_right_margin(15)
    pdf.add_page()
    
    # Body text color: Charcoal Dark
    pdf.set_text_color(30, 41, 59)
    
    # Page 1: Main Title
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(99, 102, 241) # Indigo primary
    pdf.cell(0, 10, 'Documento de Especificacion y Funcionalidades', ln=True)
    pdf.ln(2)
    
    pdf.set_draw_color(99, 102, 241)
    pdf.set_line_width(0.8)
    pdf.line(15, 52, 195, 52)
    pdf.ln(5)
    
    # Section 1: Intro
    pdf.set_text_color(30, 41, 59)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, '1. Introduccion a Zoma DASH', ln=True)
    pdf.set_font('Helvetica', '', 10)
    
    intro_text = (
        "Zoma DASH es una plataforma premium de control interactivo disenada para la visualizacion "
        "y gestion en tiempo real de analiticas financieras y de usuario para negocios SaaS (Software as a Service). "
        "El sistema provee a fundadores, ejecutivos y analistas de datos una interfaz limpia y comoda, libre de "
        "amontonamientos, optimizada visualmente para sesiones extensas de analisis."
    )
    pdf.multi_cell(0, 5, intro_text)
    pdf.ln(4)
    
    # Section 2: Core modules
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, '2. Modulos Principales', ln=True)
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, 'A. Panel de Visualizacion (Dashboard Tab)', ln=True)
    pdf.set_font('Helvetica', '', 10)
    dash_text = (
        "- Resumen de KPIs Financieros: Tarjetas de control para MRR (Mensual), ARR (Anual), LTV (Lifetime Value), "
        "CAC (Adquisicion), Relacion LTV:CAC, Churn Rate (Cancelacion) y ARPU (Ticket Medio).\n"
        "- Graficos Interactivos Animados: Grafico de area de crecimiento de ingresos (Mensual/Diario), "
        "distribucion de planes contratados (Donut), adiciones de nuevos usuarios vs cancelaciones (Barras apiladas) "
        "y embudo de marketing/conversion (Funnel horizontal).\n"
        "- Simulador Financiero Sandbox: Calculadora cientifica a 12 meses. Permite deslizar controles de MRR inicial, "
        "tasa de crecimiento, ARPU y Churn para visualizar simulaciones de crecimiento de ingresos y usuarios."
    )
    pdf.multi_cell(0, 5, dash_text)
    pdf.ln(2)
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, 'B. Panel de Administracion (Gestion de Datos Tab)', ln=True)
    pdf.set_font('Helvetica', '', 10)
    mng_text = (
        "- Registro de Nuevos Suscriptores: Formulario estructurado para agregar clientes de forma manual con "
        "campos de Nombre, Email, Plan (Basico, Pro, Enterprise), Estado de la cuenta (Activo, Vencido, Churned) "
        "y selector de fecha de facturacion.\n"
        "- Parametrizacion del Sistema: Permite editar los precios de cada plan de suscripcion y el CAC promedio "
        "manualmente. El sistema actualiza de forma retrospectiva el monto de facturacion de todos los clientes "
        "registrados.\n"
        "- Utilidades de Simulacion: Botones de control para poblar la base de datos con 15 clientes demo con un clic "
        "o vaciar la base de datos para comenzar desde cero."
    )
    pdf.multi_cell(0, 5, mng_text)
    pdf.ln(5)
    
    # Section 3: Architecture
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, '3. Arquitectura y Persistencia', ln=True)
    pdf.set_font('Helvetica', '', 10)
    arch_text = (
        "El sistema esta construido bajo la filosofia Vanilla Single Page Application (SPA):\n"
        "- Lenguajes: HTML5 semantico, CSS3 personalizado y JavaScript moderno (ES6) sin compiladores o dependencias locales.\n"
        "- CDNs Seguros: Utiliza librerias desde CDNs como ApexCharts (graficos vectoriales de alto rendimiento), "
        "jsPDF y AutoTable (motores de exportacion PDF) y Lucide Icons (iconografia vectorial).\n"
        "- Base de Datos Local: Persistencia permanente en el navegador mediante localStorage. La informacion no se "
        "pierde al cerrar o actualizar la pestana, eliminando la necesidad de servidores de bases de datos tradicionales."
    )
    pdf.multi_cell(0, 5, arch_text)
    
    # Page 2: Design and instructions
    pdf.add_page()
    
    # Section 4: Design Aesthetics
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, '4. Diseno Visual y Ergonomia', ln=True)
    pdf.set_font('Helvetica', '', 10)
    design_text = (
        "Zoma DASH implementa una paleta de colores Dark Obsidian y Deep Slate (Base #080b11 y #121926). "
        "Esta paleta esta especificamente ajustada para:\n"
        "- Reducir la fatiga ocular y la emision de luz azul durante sesiones extendidas de analitica.\n"
        "- Ofrecer contrastes comodos de lectura usando textos en Cool Gray (#f8fafc) y Slate Muted (#94a3b8).\n"
        "- Usar colores semanticos suaves (Verde Esmeralda para crecimiento, Rosa Coral para cancelaciones, "
        "Violeta e Indigo para progresiones primarias).\n"
        "- Respetar la holgura visual (Gaps amplios de 1.75rem y paddings generosos) para evitar la sensacion "
        "de congestion de datos o amontonamiento."
    )
    pdf.multi_cell(0, 5, design_text)
    pdf.ln(4)

    # Section 5: Exports
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, '5. Exportaciones de Datos', ln=True)
    pdf.set_font('Helvetica', '', 10)
    export_text = (
        "- Reportes en PDF: Genera reportes ejecutivos limpios con tablas autoestructuradas de los clientes y "
        "cajas resumen de KPIs clave (MRR, ARR, LTV, CAC, Churn) adaptados para impresion o envio directo.\n"
        "- Exportacion en CSV: Descarga de la lista completa de clientes indexados con formato de hoja de cálculo "
        "compatible con Excel o Google Sheets."
    )
    pdf.multi_cell(0, 5, export_text)
    pdf.ln(4)
    
    # Section 6: Instructions
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, '6. Instrucciones de Despliegue', ln=True)
    pdf.set_font('Helvetica', '', 10)
    deploy_text = (
        "El despliegue de Zoma DASH en hosting estatico (como GitHub Pages) es directo:\n"
        "1. Sube los archivos index.html, styles.css y app.js a tu rama principal (main).\n"
        "2. Activa GitHub Pages seleccionando la opcion 'Deploy from a branch' y apuntando a la rama main y carpeta / (root).\n"
        "3. La web estara disponible y funcional de inmediato sin configuraciones adicionales de compilacion."
    )
    pdf.multi_cell(0, 5, deploy_text)
    
    # Save PDF
    pdf.output('Zoma-DASH-Informacion.pdf')
    print("PDF generated successfully.")

if __name__ == '__main__':
    create_info_pdf()
