// Importar solo los servicios, no los tipos
import { PdfExportService } from './pdfExport';
import { ExcelExportService } from './excelExport';

// Definición local de todas las interfaces necesarias
interface TableData {
  headers: string[];
  data: any[][];
}

interface PdfExportOptions {
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

interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  workbookType?: string;
  cellStyles?: boolean;
  includeHeader?: boolean;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  fileName?: string;
  title?: string; 
  sheetName?: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Servicio unificado de exportación que proporciona una interfaz común 
 * para todos los formatos de exportación
 */
export class ExportService {
  /**
   * Exporta datos en el formato especificado
   */
  public static exportData(
    headers: string[],
    data: any[][],
    options: ExportOptions
  ): void {
    const { format, fileName, title, orientation } = options;

    switch (format) {
      case 'pdf':
        const pdfOptions: PdfExportOptions = {
          fileName: fileName || 'reporte.pdf',
          title: title || 'Reporte',
          orientation: orientation || 'portrait'
        };
        PdfExportService.exportToPdf({ headers, data }, pdfOptions);
        break;

      case 'excel':
        const excelOptions: ExcelExportOptions = {
          fileName: fileName || 'reporte.xlsx',
          sheetName: options.sheetName || 'Datos'
        };
        ExcelExportService.exportToExcel(headers, data, excelOptions);
        break;

      case 'csv':
        const csvOptions: ExcelExportOptions = {
          fileName: fileName || 'reporte.csv',
          sheetName: options.sheetName || 'Datos',
          workbookType: 'csv'
        };
        ExcelExportService.exportToExcel(headers, data, csvOptions);
        break;

      default:
        console.error('Formato de exportación no soportado');
    }
  }

  /**
   * Exporta una lista genérica de elementos en el formato especificado
   */
  public static exportList<T>(
    items: T[],
    fields: { key: keyof T; header: string }[],
    options: ExportOptions
  ): void {
    const { format } = options;

    switch (format) {
      case 'pdf':
        const pdfOptions: PdfExportOptions = {
          fileName: options.fileName || 'reporte.pdf',
          title: options.title || 'Reporte',
          orientation: options.orientation || 'portrait'
        };
        PdfExportService.exportGenericList(items, fields, pdfOptions);
        break;

      case 'excel':
        const excelOptions: ExcelExportOptions = {
          fileName: options.fileName || 'reporte.xlsx',
          sheetName: options.sheetName || 'Datos'
        };
        ExcelExportService.exportGenericList(items, fields, excelOptions);
        break;

      case 'csv':
        const csvOptions: ExcelExportOptions = {
          fileName: options.fileName || 'reporte.csv',
          sheetName: options.sheetName || 'Datos',
          workbookType: 'csv'
        };
        ExcelExportService.exportGenericList(items, fields, csvOptions);
        break;

      default:
        console.error('Formato de exportación no soportado');
    }
  }

  /**
   * Exporta un detalle de un elemento en formato PDF
   */
  public static exportDetailedItem<T>(
    item: T,
    fields: { key: keyof T; label: string }[],
    options: Omit<ExportOptions, 'format'> = {}
  ): void {
    const pdfOptions: PdfExportOptions = {
      fileName: options.fileName || 'detalle.pdf',
      title: options.title || 'Detalle',
      orientation: options.orientation || 'portrait'
    };
    PdfExportService.exportDetailedItem(item, fields, pdfOptions);
  }
}
