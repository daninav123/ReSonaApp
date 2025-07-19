/* eslint-disable react-hooks/rules-of-hooks, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useApiError from '../../hooks/useApiError';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  TableFooter,
  TablePaginationProps,
  CircularProgress,
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Search as SearchIcon,
  Clear as ClearIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { useAppSelector } from '../../store';
import { Loading } from '../feedback/Loading';
import Alert from '../common/Alert/Alert';

type Order = 'asc' | 'desc';

// Componente de paginación personalizado
function TablePaginationActions(props: TablePaginationProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    try {
      setIsProcessing(true);
      setPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    } catch (err) {
      handleError(err as Error);
      showError('Error al cambiar de página');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

interface Column<T> {
  id: keyof T | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  renderCell?: (row: T) => React.ReactNode;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selected: T[]) => void;
  onSort?: (field: keyof T, order: 'asc' | 'desc') => void;
  onSearch?: (searchText: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  page?: number;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  totalRows?: number;
  selectable?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchDebounce?: number;
  emptyMessage?: string | React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  rowId?: (row: T) => string | number;
  dense?: boolean;
  stickyHeader?: boolean;
  height?: number | string;
  maxHeight?: number | string;
  elevation?: number;
  variant?: 'elevation' | 'outlined';
  sx?: any;
  tableSx?: any;
  headerSx?: any;
  bodySx?: any;
  rowSx?: (row: T, index: number) => any;
  selectedRowSx?: (row: T, index: number) => any;
  hoverRow?: boolean;
  highlightSelected?: boolean;
  showToolbar?: boolean;
  toolbar?: React.ReactNode | ((props: { selected: T[]; onClearSelection: () => void }) => React.ReactNode);
  showHeader?: boolean;
  showFooter?: boolean;
  footer?: React.ReactNode | ((props: { selected: T[] }) => React.ReactNode);
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  rowCount?: number;
  rowHeight?: number | 'auto';
  headerRowHeight?: number | 'auto';
  footerRowHeight?: number | 'auto';
  onRowDoubleClick?: (row: T, event: React.MouseEvent) => void;
  onRowMouseEnter?: (row: T, event: React.MouseEvent) => void;
  onRowMouseLeave?: (row: T, event: React.MouseEvent) => void;
  onRowContextMenu?: (row: T, event: React.MouseEvent) => void;
  onCellClick?: (row: T, field: keyof T, event: React.MouseEvent) => void;
  onCellDoubleClick?: (row: T, field: keyof T, event: React.MouseEvent) => void;
  onCellMouseEnter?: (row: T, field: keyof T, event: React.MouseEvent) => void;
  onCellMouseLeave?: (row: T, field: keyof T, event: React.MouseEvent) => void;
  onCellContextMenu?: (row: T, field: keyof T, event: React.MouseEvent) => void;
  onHeaderClick?: (field: keyof T, event: React.MouseEvent) => void;
  onHeaderDoubleClick?: (field: keyof T, event: React.MouseEvent) => void;
  onHeaderContextMenu?: (field: keyof T, event: React.MouseEvent) => void;
  onSelectionModelChange?: (selectionModel: (string | number)[]) => void;
  selectionModel?: (string | number)[];
  checkboxSelection?: boolean;
  disableSelectionOnClick?: boolean;
  disableClickEventBubbling?: boolean;
  disableColumnMenu?: boolean;
  disableColumnSelector?: boolean;
  disableColumnResize?: boolean;
  disableColumnReorder?: boolean;
  disableColumnFilter?: boolean;
  disableColumnSort?: boolean;
  disableMultipleSelection?: boolean;
  disableVirtualization?: boolean;
  disableExtendRowFullWidth?: boolean;
  disableDensitySelector?: boolean;
  disableExport?: boolean;
  disableFilterPanel?: boolean;
  disableIgnoreModificationsIfProcessingProps?: boolean;
  disableSelectionOnClickOutside?: boolean;
  disableSelectionOnClickInside?: boolean;
  disableClickAwayListener?: boolean;
  disableEscapeKeyDown?: boolean;
  disableRestoreFocus?: boolean;
  disableAutoFocus?: boolean;
  disableEnforceFocus?: boolean;
  disableAutoPageSize?: boolean;
  disableColumnResizing?: boolean;
  disableColumnSizing?: boolean;
  disableColumnVisibility?: boolean;
  disableDensity?: boolean;
  disableFiltering?: boolean;
  disableGrouping?: boolean;
  disableHeaderFiltering?: boolean;
  disableHiding?: boolean;
  disableIgnoreModificationsIfProcessingPropsCache?: boolean;
  disableMultipleColumnsFiltering?: boolean;
  disableMultipleColumnsSorting?: boolean;
  disableMultipleSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  disableSelectionOnClick?: boolean;
  disableSorting?: boolean;
  disableVirtualization?: boolean;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  hideFooterSelectedRowCount?: boolean;
  hideFooterRowCount?: boolean;
  hideHeader?: boolean;
  hideHeaderPagination?: boolean;
  hideHeaderSelectedRowCount?: boolean;
  hideHeaderRowCount?: boolean;
  hideToolbar?: boolean;
  hideToolbarFilterButton?: boolean;
  hideToolbarDensityButton?: boolean;
  hideToolbarExportButton?: boolean;
  hideToolbarColumnsButton?: boolean;
  hideToolbarSearch?: boolean;
  hideToolbarDownloadButton?: boolean;
  hideToolbarPrintButton?: boolean;
  hideToolbarViewColumnsButton?: boolean;
  hideToolbarFilterPanelButton?: boolean;
  hideToolbarDensityPanelButton?: boolean;
  hideToolbarExportPanelButton?: boolean;
  hideToolbarColumnsPanelButton?: boolean;
  hideToolbarSearchPanelButton?: boolean;
  hideToolbarDownloadPanelButton?: boolean;
  hideToolbarPrintPanelButton?: boolean;
  hideToolbarViewColumnsPanelButton?: boolean;
  hideToolbarFilterPanel?: boolean;
  hideToolbarDensityPanel?: boolean;
  hideToolbarExportPanel?: boolean;
  hideToolbarColumnsPanel?: boolean;
  hideToolbarSearchPanel?: boolean;
  hideToolbarDownloadPanel?: boolean;
  hideToolbarPrintPanel?: boolean;
  hideToolbarViewColumnsPanel?: boolean;
  hideToolbarFilterIcon?: boolean;
  hideToolbarDensityIcon?: boolean;
  hideToolbarExportIcon?: boolean;
  hideToolbarColumnsIcon?: boolean;
  hideToolbarSearchIcon?: boolean;
  hideToolbarDownloadIcon?: boolean;
  hideToolbarPrintIcon?: boolean;
  hideToolbarViewColumnsIcon?: boolean;
  hideToolbarFilterText?: boolean;
  hideToolbarDensityText?: boolean;
  hideToolbarExportText?: boolean;
  hideToolbarColumnsText?: boolean;
  hideToolbarSearchText?: boolean;
  hideToolbarDownloadText?: boolean;
  hideToolbarPrintText?: boolean;
  hideToolbarViewColumnsText?: boolean;
  hideToolbarFilterChip?: boolean;
  hideToolbarDensityChip?: boolean;
  hideToolbarExportChip?: boolean;
  hideToolbarColumnsChip?: boolean;
  hideToolbarSearchChip?: boolean;
  hideToolbarDownloadChip?: boolean;
  hideToolbarPrintChip?: boolean;
  hideToolbarViewColumnsChip?: boolean;
  hideToolbarFilterBadge?: boolean;
  hideToolbarDensityBadge?: boolean;
  hideToolbarExportBadge?: boolean;
  hideToolbarColumnsBadge?: boolean;
  hideToolbarSearchBadge?: boolean;
  hideToolbarDownloadBadge?: boolean;
  hideToolbarPrintBadge?: boolean;
  hideToolbarViewColumnsBadge?: boolean;
  hideToolbarFilterLabel?: boolean;
  hideToolbarDensityLabel?: boolean;
  hideToolbarExportLabel?: boolean;
  hideToolbarColumnsLabel?: boolean;
  hideToolbarSearchLabel?: boolean;
  hideToolbarDownloadLabel?: boolean;
  hideToolbarPrintLabel?: boolean;
  hideToolbarViewColumnsLabel?: boolean;
  hideToolbarFilterTooltip?: boolean;
  hideToolbarDensityTooltip?: boolean;
  hideToolbarExportTooltip?: boolean;
  hideToolbarColumnsTooltip?: boolean;
  hideToolbarSearchTooltip?: boolean;
  hideToolbarDownloadTooltip?: boolean;
  hideToolbarPrintTooltip?: boolean;
  hideToolbarViewColumnsTooltip?: boolean;
  hideToolbarFilterButtonTooltip?: boolean;
  hideToolbarDensityButtonTooltip?: boolean;
  hideToolbarExportButtonTooltip?: boolean;
  hideToolbarColumnsButtonTooltip?: boolean;
  hideToolbarSearchButtonTooltip?: boolean;
  hideToolbarDownloadButtonTooltip?: boolean;
  hideToolbarPrintButtonTooltip?: boolean;
  hideToolbarViewColumnsButtonTooltip?: boolean;
  hideToolbarFilterPanelTooltip?: boolean;
  hideToolbarDensityPanelTooltip?: boolean;
  hideToolbarExportPanelTooltip?: boolean;
  hideToolbarColumnsPanelTooltip?: boolean;
  hideToolbarSearchPanelTooltip?: boolean;
  hideToolbarDownloadPanelTooltip?: boolean;
  hideToolbarPrintPanelTooltip?: boolean;
  hideToolbarViewColumnsPanelTooltip?: boolean;
  hideToolbarFilterIconButtonTooltip?: boolean;
  hideToolbarDensityIconButtonTooltip?: boolean;
  hideToolbarExportIconButtonTooltip?: boolean;
  hideToolbarColumnsIconButtonTooltip?: boolean;
  hideToolbarSearchIconButtonTooltip?: boolean;
  hideToolbarDownloadIconButtonTooltip?: boolean;
  hideToolbarPrintIconButtonTooltip?: boolean;
  hideToolbarViewColumnsIconButtonTooltip?: boolean;
  hideToolbarFilterChipTooltip?: boolean;
  hideToolbarDensityChipTooltip?: boolean;
  hideToolbarExportChipTooltip?: boolean;
  hideToolbarColumnsChipTooltip?: boolean;
  hideToolbarSearchChipTooltip?: boolean;
  hideToolbarDownloadChipTooltip?: boolean;
  hideToolbarPrintChipTooltip?: boolean;
  hideToolbarViewColumnsChipTooltip?: boolean;
  hideToolbarFilterBadgeTooltip?: boolean;
  hideToolbarDensityBadgeTooltip?: boolean;
  hideToolbarExportBadgeTooltip?: boolean;
  hideToolbarColumnsBadgeTooltip?: boolean;
  hideToolbarSearchBadgeTooltip?: boolean;
  hideToolbarDownloadBadgeTooltip?: boolean;
  hideToolbarPrintBadgeTooltip?: boolean;
  hideToolbarViewColumnsBadgeTooltip?: boolean;
  hideToolbarFilterLabelTooltip?: boolean;
  hideToolbarDensityLabelTooltip?: boolean;
  hideToolbarExportLabelTooltip?: boolean;
  hideToolbarColumnsLabelTooltip?: boolean;
  hideToolbarSearchLabelTooltip?: boolean;
  hideToolbarDownloadLabelTooltip?: boolean;
  hideToolbarPrintLabelTooltip?: boolean;
  hideToolbarViewColumnsLabelTooltip?: boolean;
  hideToolbarFilterButtonAriaLabel?: boolean;
  hideToolbarDensityButtonAriaLabel?: boolean;
  hideToolbarExportButtonAriaLabel?: boolean;
  hideToolbarColumnsButtonAriaLabel?: boolean;
  hideToolbarSearchButtonAriaLabel?: boolean;
  hideToolbarDownloadButtonAriaLabel?: boolean;
  hideToolbarPrintButtonAriaLabel?: boolean;
  hideToolbarViewColumnsButtonAriaLabel?: boolean;
  hideToolbarFilterPanelAriaLabel?: boolean;
  hideToolbarDensityPanelAriaLabel?: boolean;
  hideToolbarExportPanelAriaLabel?: boolean;
  hideToolbarColumnsPanelAriaLabel?: boolean;
  hideToolbarSearchPanelAriaLabel?: boolean;
  hideToolbarDownloadPanelAriaLabel?: boolean;
  hideToolbarPrintPanelAriaLabel?: boolean;
  hideToolbarViewColumnsPanelAriaLabel?: boolean;
  hideToolbarFilterIconButtonAriaLabel?: boolean;
  hideToolbarDensityIconButtonAriaLabel?: boolean;
  hideToolbarExportIconButtonAriaLabel?: boolean;
  hideToolbarColumnsIconButtonAriaLabel?: boolean;
  hideToolbarSearchIconButtonAriaLabel?: boolean;
  hideToolbarDownloadIconButtonAriaLabel?: boolean;
  hideToolbarPrintIconButtonAriaLabel?: boolean;
  hideToolbarViewColumnsIconButtonAriaLabel?: boolean;
  hideToolbarFilterChipAriaLabel?: boolean;
  hideToolbarDensityChipAriaLabel?: boolean;
  hideToolbarExportChipAriaLabel?: boolean;
  hideToolbarColumnsChipAriaLabel?: boolean;
  hideToolbarSearchChipAriaLabel?: boolean;
  hideToolbarDownloadChipAriaLabel?: boolean;
  hideToolbarPrintChipAriaLabel?: boolean;
  hideToolbarViewColumnsChipAriaLabel?: boolean;
  hideToolbarFilterBadgeAriaLabel?: boolean;
  hideToolbarDensityBadgeAriaLabel?: boolean;
  hideToolbarExportBadgeAriaLabel?: boolean;
  hideToolbarColumnsBadgeAriaLabel?: boolean;
  hideToolbarSearchBadgeAriaLabel?: boolean;
  hideToolbarDownloadBadgeAriaLabel?: boolean;
  hideToolbarPrintBadgeAriaLabel?: boolean;
  hideToolbarViewColumnsBadgeAriaLabel?: boolean;
  hideToolbarFilterLabelAriaLabel?: boolean;
  hideToolbarDensityLabelAriaLabel?: boolean;
  hideToolbarExportLabelAriaLabel?: boolean;
  hideToolbarColumnsLabelAriaLabel?: boolean;
  hideToolbarSearchLabelAriaLabel?: boolean;
  hideToolbarDownloadLabelAriaLabel?: boolean;
  hideToolbarPrintLabelAriaLabel?: boolean;
  hideToolbarViewColumnsLabelAriaLabel?: boolean;
}

function DataTable<T>(props: DataTableProps<T>) {
  // Hooks para manejo de errores y notificaciones
  const { error: apiError, handleError, clearError } = useApiError();
  const { showError, showSuccess } = useNotification();

  // Estado para controlar errores y loading internos
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    columns,
    data,
    loading,
    error: propError,
    onRowClick,
    onSort,
    onSearch,
    page,
    rowsPerPage,
    rowsPerPageOptions,
    totalRows,
    selectable,
    showPagination,
    showSearch,
    searchPlaceholder,
    searchDebounce,
    emptyMessage,
    loadingMessage,
    rowId,
    dense,
    stickyHeader,
    height,
    maxHeight,
    elevation,
    variant,
    sx,
    tableSx,
    headerSx,
    bodySx,
    rowSx,
    selectedRowSx,
    hoverRow,
    highlightSelected,
    showToolbar,
    toolbar,
    showHeader,
    showFooter,
    footer,
    loadingComponent,
    emptyComponent,
    rowCount,
    rowHeight,
    headerRowHeight,
    footerRowHeight,
    onRowDoubleClick,
    onRowMouseEnter,
    onRowMouseLeave,
    onRowContextMenu,
    onCellClick,
    onCellDoubleClick,
    onCellMouseEnter,
    onCellMouseLeave,
    onCellContextMenu,
    onHeaderClick,
    onHeaderDoubleClick,
    onHeaderContextMenu,
    onSelectionModelChange,
    selectionModel,
    checkboxSelection,
    disableSelectionOnClick,
    disableClickEventBubbling,
    disableColumnMenu,
    disableColumnSelector,
    disableColumnResize,
    disableColumnReorder,
    disableColumnFilter,
    disableColumnSort,
    disableMultipleSelection,
    disableVirtualization,
    disableExtendRowFullWidth,
    disableDensitySelector,
    disableExport,
    disableFilterPanel,
    disableIgnoreModificationsIfProcessingProps,
    disableSelectionOnClickOutside,
    disableSelectionOnClickInside,
    disableClickAwayListener,
    disableEscapeKeyDown,
    disableRestoreFocus,
    disableAutoFocus,
    disableEnforceFocus,
    disableAutoPageSize,
    disableColumnResizing,
    disableColumnSizing,
    disableColumnVisibility,
    disableDensity,
    disableFiltering,
    disableGrouping,
    disableHeaderFiltering,
    disableHiding,
    disableIgnoreModificationsIfProcessingPropsCache,
    disableMultipleColumnsFiltering,
    disableMultipleColumnsSorting,
    disableMultipleSelection,
    disableRowSelectionOnClick,
    disableSelectionOnClick,
    disableSorting,
    disableVirtualization,
    hideFooter,
    hideFooterPagination,
    hideFooterSelectedRowCount,
    hideFooterRowCount,
    hideHeader,
    hideHeaderPagination,
    hideHeaderSelectedRowCount,
    hideHeaderRowCount,
    hideToolbar,
    hideToolbarFilterButton,
    hideToolbarDensityButton,
    hideToolbarExportButton,
    hideToolbarColumnsButton,
    hideToolbarSearch,
    hideToolbarDownloadButton,
    hideToolbarPrintButton,
    hideToolbarViewColumnsButton,
    hideToolbarFilterPanelButton,
    hideToolbarDensityPanelButton,
    hideToolbarExportPanelButton,
    hideToolbarColumnsPanelButton,
    hideToolbarSearchPanelButton,
    hideToolbarDownloadPanelButton,
    hideToolbarPrintPanelButton,
    hideToolbarViewColumnsPanelButton,
    hideToolbarFilterPanel,
    hideToolbarDensityPanel,
    hideToolbarExportPanel,
    hideToolbarColumnsPanel,
    hideToolbarSearchPanel,
    hideToolbarDownloadPanel,
    hideToolbarPrintPanel,
    hideToolbarViewColumnsPanel,
    hideToolbarFilterIcon,
    hideToolbarDensityIcon,
    hideToolbarExportIcon,
    hideToolbarColumnsIcon,
    hideToolbarSearchIcon,
    hideToolbarDownloadIcon,
    hideToolbarPrintIcon,
    hideToolbarViewColumnsIcon,
    hideToolbarFilterText,
    hideToolbarDensityText,
    hideToolbarExportText,
    hideToolbarColumnsText,
    hideToolbarSearchText,
    hideToolbarDownloadText,
    hideToolbarPrintText,
    hideToolbarViewColumnsText,
    hideToolbarFilterChip,
    hideToolbarDensityChip,
    hideToolbarExportChip,
    hideToolbarColumnsChip,
    hideToolbarSearchChip,
    hideToolbarDownloadChip,
    hideToolbarPrintChip,
    hideToolbarViewColumnsChip,
    hideToolbarFilterBadge,
    hideToolbarDensityBadge,
    hideToolbarExportBadge,
    hideToolbarColumnsBadge,
    hideToolbarSearchBadge,
    hideToolbarDownloadBadge,
    hideToolbarPrintBadge,
    hideToolbarViewColumnsBadge,
    hideToolbarFilterLabel,
    hideToolbarDensityLabel,
    hideToolbarExportLabel,
    hideToolbarColumnsLabel,
    hideToolbarSearchLabel,
    hideToolbarDownloadLabel,
    hideToolbarPrintLabel,
    hideToolbarViewColumnsLabel,
    hideToolbarFilterTooltip,
    hideToolbarDensityTooltip,
    hideToolbarExportTooltip,
    hideToolbarColumnsTooltip,
    hideToolbarSearchTooltip,
    hideToolbarDownloadTooltip,
    hideToolbarPrintTooltip,
    hideToolbarViewColumnsTooltip,
    hideToolbarFilterButtonTooltip,
    hideToolbarDensityButtonTooltip,
    hideToolbarExportButtonTooltip,
    hideToolbarColumnsButtonTooltip,
    hideToolbarSearchButtonTooltip,
    hideToolbarDownloadButtonTooltip,
    hideToolbarPrintButtonTooltip,
    hideToolbarViewColumnsButtonTooltip,
    hideToolbarFilterPanelTooltip,
    hideToolbarDensityPanelTooltip,
    hideToolbarExportPanelTooltip,
    hideToolbarColumnsPanelTooltip,
    hideToolbarSearchPanelTooltip,
    hideToolbarDownloadPanelTooltip,
    hideToolbarPrintPanelTooltip,
    hideToolbarViewColumnsPanelTooltip,
    hideToolbarFilterIconButtonTooltip,
    hideToolbarDensityIconButtonTooltip,
    hideToolbarExportIconButtonTooltip,
    hideToolbarColumnsIconButtonTooltip,
    hideToolbarSearchIconButtonTooltip,
    hideToolbarDownloadIconButtonTooltip,
    hideToolbarPrintIconButtonTooltip,
    hideToolbarViewColumnsIconButtonTooltip,
    hideToolbarFilterChipTooltip,
    hideToolbarDensityChipTooltip,
    hideToolbarExportChipTooltip,
    hideToolbarColumnsChipTooltip,
    hideToolbarSearchChipTooltip,
    hideToolbarDownloadChipTooltip,
    hideToolbarPrintChipTooltip,
    hideToolbarViewColumnsChipTooltip,
    hideToolbarFilterBadgeTooltip,
    hideToolbarDensityBadgeTooltip,
    hideToolbarExportBadgeTooltip,
    hideToolbarColumnsBadgeTooltip,
    hideToolbarSearchBadgeTooltip,
    hideToolbarDownloadBadgeTooltip,
    hideToolbarPrintBadgeTooltip,
    hideToolbarViewColumnsBadgeTooltip,
    hideToolbarFilterLabelTooltip,
    hideToolbarDensityLabelTooltip,
    hideToolbarExportLabelTooltip,
    hideToolbarColumnsLabelTooltip,
    hideToolbarSearchLabelTooltip,
    hideToolbarDownloadLabelTooltip,
    hideToolbarPrintLabelTooltip,
    hideToolbarViewColumnsLabelTooltip,
    hideToolbarFilterButtonAriaLabel,
    hideToolbarDensityButtonAriaLabel,
    hideToolbarExportButtonAriaLabel,
    hideToolbarColumnsButtonAriaLabel,
    hideToolbarSearchButtonAriaLabel,
    hideToolbarDownloadButtonAriaLabel,
    hideToolbarPrintButtonAriaLabel,
    hideToolbarViewColumnsButtonAriaLabel,
    hideToolbarFilterPanelAriaLabel,
    hideToolbarDensityPanelAriaLabel,
    hideToolbarExportPanelAriaLabel,
    hideToolbarColumnsPanelAriaLabel,
    hideToolbarSearchPanelAriaLabel,
    hideToolbarDownloadPanelAriaLabel,
    hideToolbarPrintPanelAriaLabel,
    hideToolbarViewColumnsPanelAriaLabel,
    hideToolbarFilterIconButtonAriaLabel,
    hideToolbarDensityIconButtonAriaLabel,
    hideToolbarExportIconButtonAriaLabel,
    hideToolbarColumnsIconButtonAriaLabel,
    hideToolbarSearchIconButtonAriaLabel,
    hideToolbarDownloadIconButtonAriaLabel,
    hideToolbarPrintIconButtonAriaLabel,
    hideToolbarViewColumnsIconButtonAriaLabel,
    hideToolbarFilterChipAriaLabel,
    hideToolbarDensityChipAriaLabel,
    hideToolbarExportChipAriaLabel,
    hideToolbarColumnsChipAriaLabel,
    hideToolbarSearchChipAriaLabel,
    hideToolbarDownloadChipAriaLabel,
    hideToolbarPrintChipAriaLabel,
    hideToolbarViewColumnsChipAriaLabel,
    hideToolbarFilterBadgeAriaLabel,
    hideToolbarDensityBadgeAriaLabel,
    hideToolbarExportBadgeAriaLabel,
    hideToolbarColumnsBadgeAriaLabel,
    hideToolbarSearchBadgeAriaLabel,
    hideToolbarDownloadBadgeAriaLabel,
    hideToolbarPrintBadgeAriaLabel,
    hideToolbarViewColumnsBadgeAriaLabel,
    hideToolbarFilterLabelAriaLabel,
    hideToolbarDensityLabelAriaLabel,
    hideToolbarExportLabelAriaLabel,
    hideToolbarColumnsLabelAriaLabel,
    hideToolbarSearchLabelAriaLabel,
    hideToolbarDownloadLabelAriaLabel,
    hideToolbarPrintLabelAriaLabel,
    hideToolbarViewColumnsLabelAriaLabel,
  } = props;

  const [orderBy, setOrderBy] = useState<keyof T | ''>('');
  const [order, setOrder] = useState<Order>('asc');
  const [searchText, setSearchText] = useState('');
  const [localPage, setLocalPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(10);

  const handleRequestSort = useCallback((event: React.MouseEvent<unknown>, property: keyof T) => {
    try {
      setIsProcessing(true);
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);

      if (onSort) {
        onSort(property, isAsc ? 'desc' : 'asc');
      }
    } catch (err) {
      handleError(err as Error);
      showError('Error al ordenar la tabla');
    } finally {
      setIsProcessing(false);
    }
  }, [orderBy, order, onSort, handleError, showError]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsProcessing(true);
      const value = event.target.value;
      setSearchText(value);
      if (onSearch) {
        onSearch(value);
      }
    } catch (err) {
      handleError(err as Error);
      showError('Error al realizar la búsqueda');
    } finally {
      setIsProcessing(false);
    }
  }, [onSearch, handleError, showError]);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsProcessing(true);
      const newRowsPerPage = parseInt(event.target.value, 10);
      setRowsPerPage(newRowsPerPage);
      setPage(0); // Reset to first page
      if (onRowsPerPageChange) {
        onRowsPerPageChange(newRowsPerPage);
      }
    } catch (err) {
      handleError(err as Error);
      showError('Error al cambiar el número de filas por página');
    } finally {
      setIsProcessing(false);
    }
  }, [onRowsPerPageChange, handleError, showError]);

  const handleChangePage = useCallback((event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    try {
      setIsProcessing(true);
      setPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    } catch (err) {
      handleError(err as Error);
      showError('Error al cambiar de página');
    } finally {
      setIsProcessing(false);
    }
  }, [onPageChange, handleError, showError]);

  const visibleRows = useMemo(() => {
    if (!data) return [];
    if (searchText) {
      return data.filter((row) =>
        columns.some((column) =>
          String(row[column.id]).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    return data;
  }, [data, columns, searchText]);

  const sortedRows = useMemo(() => {
    if (!visibleRows) return [];
    if (orderBy) {
      return visibleRows.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return visibleRows;
  }, [visibleRows, orderBy, order]);

  const paginatedRows = useMemo(() => {
    if (!sortedRows) return [];
    return sortedRows.slice(localPage * localRowsPerPage, (localPage + 1) * localRowsPerPage);
  }, [sortedRows, localPage, localRowsPerPage]);

  useEffect(() => {
    if (error) {
      showError(errorMessage || error.message || 'Error en la tabla de datos');
    }
  }, [error, errorMessage, showError]);

  return (
    <Paper elevation={elevation || 1} variant={variant || 'elevation'} sx={{ width: '100%', overflow: 'hidden', ...sx }}>
      {(error || apiError) && (
        <Box sx={{ p: 2 }}>
          <Alert 
            severity="error" 
            title="Error" 
            message={errorMessage || (error ? error.message : apiError?.message) || 'Ha ocurrido un error al procesar los datos'} 
            onClose={clearError} 
          />
        </Box>
      )}
      
      {showSearch && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder={searchPlaceholder || "Buscar..."}
            value={searchText}
            onChange={handleSearchChange}
            fullWidth
            size="small"
            disabled={isProcessing || loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isProcessing ? <CircularProgress size={20} /> : <SearchIcon />}
                </InputAdornment>
              ),
              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => setSearchText('')}
                    size="small"
                    disabled={isProcessing || loading}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
      )}
      
      <TableContainer component={Paper} aria-label="Tabla de datos" role="region" tabIndex={0} aria-describedby="tabla-descripcion">
        <Box id="tabla-descripcion" hidden>
          Tabla interactiva con funcionalidades de ordenamiento, búsqueda y paginación
        </Box>
        <Table stickyHeader aria-label="Tabla de datos" role="grid" aria-rowcount={data.length}>
          <TableHead role="rowgroup">
            <TableRow role="row">
              {columns.map((column) => (
                <TableCell key={column.id as string} align={column.align || 'left'} style={{ minWidth: column.minWidth }} role="columnheader" aria-sort={orderBy === column.id ? order : 'none'}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={(event) => handleRequestSort(event, column.id)}
                      disabled={isProcessing || loading}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow
                hover={hoverRow}
                role="row"
                aria-rowindex={index + 1}
                tabIndex={-1}
                key={rowId ? rowId(row) : index}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id as string}
                    align={column.align}
                    role="gridcell"
                    aria-describedby={`${column.id}-header`}
                  >
                    {column.renderCell ? column.renderCell(row) : column.format ? column.format(row[column.id], row) : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showPagination && (
          <TablePagination
            component="div"
            count={totalRows ?? data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions || [5, 10, 25]}
            ActionsComponent={TablePaginationActions}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            disabled={isProcessing || loading}
          />
        )}
      </TableContainer>
    </Paper>
  );
}

export default DataTable;
// Also export as a named export to support `import { DataTable } ...`
export { DataTable };
