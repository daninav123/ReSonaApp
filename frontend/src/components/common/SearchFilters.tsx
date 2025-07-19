import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  IconButton,
  Box,
  Collapse,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: FilterOption[];
}

interface SearchFiltersProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleFilterChange = (name: string, value: any) => {
    setFilterValues((prev) => {
      // Si el valor es vacío o null, lo eliminamos del objeto de filtros
      const newFilters = { ...prev };
      if (value === '' || value === null) {
        delete newFilters[name];
      } else {
        newFilters[name] = value;
      }
      return newFilters;
    });
  };

  // Efecto para manejar el debounce en el texto de búsqueda
  useEffect(() => {
    const searchTextFilter = filters.find(f => f.name === 'searchText');
    if (searchTextFilter && filterValues.searchText !== undefined) {
      const handler = setTimeout(() => {
        onFilterChange(filterValues);
      }, 500);
      return () => {
        clearTimeout(handler);
      };
    }
  }, [filterValues.searchText, filters, onFilterChange]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onFilterChange(filterValues);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    onFilterChange({});
  };

  const renderFilterInput = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={filter.label}
            variant="outlined"
            size="small"
            value={filterValues[filter.name] || ''}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
            InputProps={{
              endAdornment: filterValues[filter.name] ? (
                <IconButton
                  size="small"
                  onClick={() => handleFilterChange(filter.name, '')}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null,
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel id={`filter-${filter.name}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`filter-${filter.name}-label`}
              id={`filter-${filter.name}`}
              value={filterValues[filter.name] || ''}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={filter.label}
              value={filterValues[filter.name] || null}
              onChange={(newValue) => handleFilterChange(filter.name, newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  variant: 'outlined',
                },
              }}
            />
          </LocalizationProvider>
        );

      default:
        return null;
    }
  };

  // Filtro principal de búsqueda
  const searchFilter = filters.find((f) => f.name === 'searchText');
  // Filtros avanzados (todos menos searchText)
  const advancedFilters = filters.filter((f) => f.name !== 'searchText');

  return (
    <Box>
      <form onSubmit={handleSearchSubmit}>
        <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
          {/* Buscador principal */}
          {searchFilter && (
            <Grid item xs={12} md={6}>
              <Box sx={{ width: '100%' }}>
                {renderFilterInput(searchFilter)}
              </Box>
            </Grid>
          )}

          {/* Botones de búsqueda y filtros avanzados */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                type="submit"
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>
              {Object.keys(filterValues).length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  Limpiar
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Filtros avanzados colapsables */}
        <Collapse in={showAdvancedFilters}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {advancedFilters.map((filter) => (
                <Grid item key={filter.name} xs={12} sm={6} md={3}>
                  <Box sx={{ width: '100%' }}>
                    {renderFilterInput(filter)}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      </form>
    </Box>
  );
};

export default SearchFilters;
