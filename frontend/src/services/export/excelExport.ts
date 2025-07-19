import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Aseguramos que la interfaz sea exportada correctamente

export interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  workbookType?: string; // 'xlsx' | 'csv' | 'txt'
  cellStyles?: boolean;
  includeHeader?: boolean;
}

export class ExcelExportService {
  /**
   * Exporta datos a un archivo Excel/CSV con opciones de configuración
   */
  public static exportToExcel(
    headers: string[],
    data: any[][],
    options: ExcelExportOptions = {}
  ): void {
    // Configuraciones por defecto
    const {
      fileName = 'reporte.xlsx',
      sheetName = 'Datos',
      workbookType = 'xlsx',
      cellStyles = true,
      includeHeader = true
    } = options;

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Determinar si incluir encabezados
    let exportData = data;
    if (includeHeader) {
      exportData = [headers, ...data];
    }

    // Crear hoja de trabajo
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Guardar archivo
    const wbout = XLSX.write(wb, {
      bookType: workbookType as XLSX.BookType,
      bookSST: false,
      type: 'array'
    });

    // Crear blob y descargar
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  }

  /**
   * Exporta una lista de elementos genéricos a Excel/CSV
   */
  public static exportGenericList<T>(
    items: T[],
    fields: { key: keyof T; header: string }[],
    options?: ExcelExportOptions
  ): void {
    // Preparar encabezados
    const headers = fields.map(field => field.header);

    // Preparar datos
    const data = items.map(item => 
      fields.map(field => {
        const value = item[field.key];
        // Convertir objetos a JSON string para evitar "[object Object]"
        if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
          return JSON.stringify(value);
        }
        // Formatear fechas
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        // Para arrays, convertir a string separado por comas
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value;
      })
    );

    // Exportar a Excel
    this.exportToExcel(headers, data, options);
  }

  /**
   * Exporta a CSV (caso específico de Excel)
   */
  public static exportToCSV(
    headers: string[],
    data: any[][],
    options: Omit<ExcelExportOptions, 'workbookType'> = {}
  ): void {
    const csvOptions: ExcelExportOptions = {
      ...options,
      fileName: options.fileName || 'reporte.csv',
      workbookType: 'csv'
    };
    
    this.exportToExcel(headers, data, csvOptions);
  }

  /**
   * Exporta una lista de elementos genéricos a CSV
   */
  public static exportGenericListToCSV<T>(
    items: T[],
    fields: { key: keyof T; header: string }[],
    options?: Omit<ExcelExportOptions, 'workbookType'>
  ): void {
    // Preparar encabezados
    const headers = fields.map(field => field.header);

    // Preparar datos
    const data = items.map(item => 
      fields.map(field => {
        const value = item[field.key];
        // Convertir objetos a JSON string para evitar "[object Object]"
        if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
          return JSON.stringify(value);
        }
        // Formatear fechas
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        // Para arrays, convertir a string separado por comas
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value;
      })
    );

    // Exportar a CSV
    this.exportToCSV(headers, data, options);
  }
}
