import React, { useState } from 'react';
import { FiDownload, FiFile, FiFileText, FiX } from 'react-icons/fi';
import { RiFileExcel2Line } from 'react-icons/ri';
import Button from './Button';
import styles from './ExportButton.module.css';

// Definición local del tipo en lugar de importarlo para evitar errores
type ExportFormat = 'pdf' | 'excel' | 'csv';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  className = '',
  label = 'Exportar',
  disabled = false,
  variant = 'primary'
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = (format: ExportFormat) => {
    onExport(format);
    setShowOptions(false);
  };

  return (
    <div className={styles.exportContainer}>
      <Button
        onClick={() => setShowOptions(!showOptions)}
        className={`${styles.exportButton} ${className}`}
        disabled={disabled}
        variant={variant}
      >
        <FiDownload /> {label}
      </Button>

      {showOptions && (
        <div className={styles.exportOptions}>
          <div className={styles.exportOptionsHeader}>
            <span>Formato de exportación</span>
            <button 
              onClick={() => setShowOptions(false)}
              className={styles.closeButton}
              aria-label="Cerrar menú de exportación"
            >
              <FiX />
            </button>
          </div>
          
          <button
            onClick={() => handleExport('pdf')}
            className={styles.exportOption}
          >
            <FiFile className={styles.exportIcon} />
            <span>Exportar a PDF</span>
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            className={styles.exportOption}
          >
            <RiFileExcel2Line className={styles.exportIcon} />
            <span>Exportar a Excel</span>
          </button>
          
          <button
            onClick={() => handleExport('csv')}
            className={styles.exportOption}
          >
            <FiFileText className={styles.exportIcon} />
            <span>Exportar a CSV</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
