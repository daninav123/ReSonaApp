import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Añade tipos para jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PdfExportOptions {
  title?: string;
  fileName?: string;
  author?: string;
  subject?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: string;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  headerFooter?: {
    showHeader?: boolean;
    showFooter?: boolean;
    headerText?: string;
    footerText?: string;
    includeDate?: boolean;
    includePagination?: boolean;
  };
}

export interface TableData {
  headers: string[];
  data: any[][];
}

export class PdfExportService {
  /**
   * Exporta datos a un archivo PDF con opciones de configuración
   */
  public static exportToPdf(
    tableData: TableData,
    options: PdfExportOptions = {}
  ): void {
    // Configuraciones por defecto
    const {
      title = 'Reporte',
      fileName = 'reporte.pdf',
      author = 'ReSonaApp',
      subject = 'Documento exportado',
      orientation = 'portrait',
      pageSize = 'a4',
      margins = {
        top: 25,
        right: 15,
        bottom: 25,
        left: 15
      },
      headerFooter = {
        showHeader: true,
        showFooter: true,
        headerText: '',
        footerText: '© ReSonaApp',
        includeDate: true,
        includePagination: true
      }
    } = options;

    // Crear documento PDF
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    });

    // Metadatos
    doc.setProperties({
      title,
      author,
      subject,
      keywords: 'reporte, exportación, resonaapp',
      creator: 'ReSonaApp'
    });

    // Configurar fuentes
    doc.setFont('helvetica');
    doc.setFontSize(10);

    // Añadir cabecera
    if (headerFooter.showHeader) {
      doc.setFontSize(16);
      doc.text(title, margins.left || 15, 15);
      doc.setFontSize(10);
      
      if (headerFooter.headerText) {
        doc.text(headerFooter.headerText, margins.left || 15, 22);
      }
      
      if (headerFooter.includeDate) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-ES');
        doc.setFontSize(9);
        doc.text(`Fecha: ${dateStr}`, 
                  doc.internal.pageSize.getWidth() - (margins.right || 15) - 40, 15);
        doc.setFontSize(10);
      }
    }

    // Añadir tabla
    doc.autoTable({
      head: [tableData.headers],
      body: tableData.data,
      startY: headerFooter.showHeader ? 30 : margins.top || 25,
      margin: {
        top: margins.top || 25,
        right: margins.right || 15,
        bottom: margins.bottom || 25,
        left: margins.left || 15
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [51, 122, 183],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        // Pie de página
        if (headerFooter.showFooter) {
          doc.setFontSize(8);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.getHeight();
          
          if (headerFooter.footerText) {
            doc.text(
              headerFooter.footerText,
              margins.left || 15,
              pageHeight - 10
            );
          }
          
          if (headerFooter.includePagination) {
            const pageNumber = `Página ${doc.internal.getNumberOfPages()}`;
            doc.text(
              pageNumber,
              pageSize.getWidth() - (margins.right || 15) - 25,
              pageHeight - 10
            );
          }
        }
      }
    });

    // Guardar PDF
    doc.save(fileName);
  }

  /**
   * Genera un PDF para una lista de elementos genéricos
   */
  public static exportGenericList<T>(
    items: T[],
    fields: { key: keyof T; header: string }[],
    options?: PdfExportOptions
  ): void {
    // Preparar datos para tabla
    const headers = fields.map(field => field.header);
    const data = items.map(item => fields.map(field => item[field.key]));

    // Exportar a PDF
    this.exportToPdf({ headers, data }, options);
  }

  /**
   * Genera un PDF detallado para un elemento específico
   */
  public static exportDetailedItem<T>(
    item: T,
    fields: { key: keyof T; label: string }[],
    options?: PdfExportOptions
  ): void {
    // Preparar datos para tabla de detalle
    const headers = ['Campo', 'Valor'];
    const data = fields.map(field => [field.label, item[field.key]]);

    // Exportar a PDF
    this.exportToPdf({ headers, data }, options);
  }
}
