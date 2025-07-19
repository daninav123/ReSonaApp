import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './AdvancedSearch.module.css';
import Button from './Button';

export interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean' | 'number' | 'range';
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
}

export interface FilterState {
  [key: string]: any;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: FilterState) => void;
  filterOptions: FilterOption[];
  className?: string;
  placeholder?: string;
  initialQuery?: string;
  initialFilters?: FilterState;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  filterOptions,
  className = '',
  placeholder = 'Buscar...',
  initialQuery = '',
  initialFilters = {},
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Inicializa los filtros con valores por defecto si es necesario
  useEffect(() => {
    const defaultFilters: FilterState = {};
    filterOptions.forEach(option => {
      if (option.defaultValue !== undefined && filters[option.id] === undefined) {
        defaultFilters[option.id] = option.defaultValue;
      }
    });
    
    if (Object.keys(defaultFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...defaultFilters }));
    }
  }, [filterOptions]);

  // Comprueba si se han aplicado filtros distintos a los valores por defecto
  useEffect(() => {
    let hasActiveFilters = false;
    
    filterOptions.forEach(option => {
      const currentValue = filters[option.id];
      const defaultValue = option.defaultValue;
      
      if (currentValue !== defaultValue && currentValue !== undefined && currentValue !== '') {
        hasActiveFilters = true;
      }
    });
    
    setFiltersApplied(hasActiveFilters);
  }, [filters, filterOptions]);

  // Maneja cambios en los filtros
  const handleFilterChange = (id: string, value: any) => {
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  // Maneja el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  // Limpia todos los filtros
  const handleClearFilters = () => {
    const defaultFilters: FilterState = {};
    filterOptions.forEach(option => {
      if (option.defaultValue !== undefined) {
        defaultFilters[option.id] = option.defaultValue;
      } else {
        defaultFilters[option.id] = '';
      }
    });
    
    setFilters(defaultFilters);
    setFiltersApplied(false);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={styles.searchInput}
            />
            {query && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
              >
                <FiX />
              </button>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.filterToggle} ${filtersApplied ? styles.active : ''}`}
            aria-label="Mostrar filtros"
          >
            <FiFilter />
            <span>Filtros</span>
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          
          <Button type="submit" variant="primary" className={styles.searchButton}>
            Buscar
          </Button>
        </div>
        
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filtersContainer}>
              {filterOptions.map(option => (
                <div key={option.id} className={styles.filterItem}>
                  <label htmlFor={option.id} className={styles.filterLabel}>
                    {option.label}
                  </label>
                  
                  {option.type === 'text' && (
                    <input
                      type="text"
                      id={option.id}
                      value={filters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      placeholder={option.placeholder}
                      className={styles.filterInput}
                    />
                  )}
                  
                  {option.type === 'select' && option.options && (
                    <select
                      id={option.id}
                      value={filters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="">Todos</option>
                      {option.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {option.type === 'date' && (
                    <input
                      type="date"
                      id={option.id}
                      value={filters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      className={styles.filterDate}
                    />
                  )}
                  
                  {option.type === 'number' && (
                    <input
                      type="number"
                      id={option.id}
                      value={filters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value !== '' ? Number(e.target.value) : '')}
                      placeholder={option.placeholder}
                      className={styles.filterInput}
                    />
                  )}
                  
                  {option.type === 'boolean' && (
                    <div className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={!!filters[option.id]}
                        onChange={(e) => handleFilterChange(option.id, e.target.checked)}
                        className={styles.filterCheckbox}
                      />
                      <label htmlFor={option.id} className={styles.checkboxLabel}>
                        {option.label}
                      </label>
                    </div>
                  )}
                  
                  {option.type === 'range' && (
                    <div className={styles.rangeContainer}>
                      <input
                        type="number"
                        id={`${option.id}_min`}
                        value={(filters[option.id]?.min || '')}
                        onChange={(e) => handleFilterChange(option.id, {
                          ...filters[option.id],
                          min: e.target.value !== '' ? Number(e.target.value) : ''
                        })}
                        placeholder="Mínimo"
                        className={styles.rangeInput}
                      />
                      <span className={styles.rangeSeparator}>-</span>
                      <input
                        type="number"
                        id={`${option.id}_max`}
                        value={(filters[option.id]?.max || '')}
                        onChange={(e) => handleFilterChange(option.id, {
                          ...filters[option.id],
                          max: e.target.value !== '' ? Number(e.target.value) : ''
                        })}
                        placeholder="Máximo"
                        className={styles.rangeInput}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className={styles.filterActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearFilters}
                className={styles.clearFiltersButton}
              >
                Limpiar filtros
              </Button>
              <Button
                type="submit"
                variant="primary"
                className={styles.applyFiltersButton}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdvancedSearch;
