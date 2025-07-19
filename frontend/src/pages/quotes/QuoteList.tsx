import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import quoteApi from '../../api/quoteApi';
import type { Quote } from '../../api/quoteApi';
import SearchFilters from '../../components/common/SearchFilters';
import StatusChip from '../../components/common/StatusChip';
import useApiError from '../../hooks/useApiError';
import { useNotification } from '../../contexts/NotificationContext';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const QuoteList: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    client: '',
    status: '',
    startDate: '',
    endDate: '',
    searchText: '',
    page: 1,
    limit: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  // Hooks para manejo de errores y notificaciones
  const { error, handleError, clearError } = useApiError();
  const { showSuccess, showError } = useNotification();
  
  const navigate = useNavigate();

  // Cargar presupuestos
  const loadQuotes = async () => {
    try {
      setLoading(true);
      clearError(); // Limpiar cualquier error previo
      
      const response = await quoteApi.getQuotes(filters);
      setQuotes(response.data);
      setPagination(response.pagination);
    } catch (err) {
      handleError(err);
      showError('No se pudieron cargar los presupuestos. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [filters]);

  // Manejar cambio de página
  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  // Manejar cambio de elementos por página
  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1,
    }));
  };

  // Manejar búsqueda y filtros
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Manejar solicitud de eliminación
  const handleDeleteRequest = (id: string) => {
    setSelectedQuoteId(id);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (selectedQuoteId) {
      try {
        clearError(); // Limpiar cualquier error previo
        
        await quoteApi.deleteQuote(selectedQuoteId);
        showSuccess('Presupuesto eliminado correctamente');
        setDeleteDialogOpen(false);
        loadQuotes();
      } catch (err) {
        handleError(err);
        showError('No se pudo eliminar el presupuesto. Intente nuevamente.');
      }
      setSelectedQuoteId(null);
    }
  };

  // Solicitar conversión a factura
  const handleConvertRequest = (id: string) => {
    setSelectedQuoteId(id);
    setConvertDialogOpen(true);
  };

  // Confirmar conversión a factura
  const handleConvertConfirm = async () => {
    if (selectedQuoteId) {
      try {
        clearError(); // Limpiar cualquier error previo
        
        const result = await quoteApi.convertToInvoice(selectedQuoteId);
        showSuccess('Presupuesto convertido a factura correctamente');
        setConvertDialogOpen(false);
        setSelectedQuoteId(null);
        
        // Navegar a la factura recién creada
        navigate(`/invoices/${result.invoice._id}`);
      } catch (err) {
        handleError(err);
        showError('No se pudo convertir el presupuesto a factura. Intente nuevamente.');
      }
    }
  };

  // Renderizar el estado del presupuesto con un chip de color
  const renderStatus = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      'draft': { color: 'default', label: 'Borrador' },
      'sent': { color: 'info', label: 'Enviado' },
      'accepted': { color: 'success', label: 'Aceptado' },
      'rejected': { color: 'error', label: 'Rechazado' },
      'expired': { color: 'warning', label: 'Expirado' },
      'converted': { color: 'secondary', label: 'Convertido' },
    };

    const { color, label } = statusMap[status] || { color: 'default', label: status };
    return (
      <StatusChip 
        status={status} 
        label={label} 
        color={color as any}
      />
    );
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Gestión de Presupuestos</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/quotes/new"
          >
            Nuevo Presupuesto
          </Button>
        </Box>
        
        {/* Mostrar alerta de error si existe */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error.message}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <SearchFilters
            filters={[
              { name: 'searchText', label: 'Buscar', type: 'text' },
              { name: 'client', label: 'Cliente', type: 'select', options: [] },
              {
                name: 'status',
                label: 'Estado',
                type: 'select',
                options: [
                  { value: 'draft', label: 'Borrador' },
                  { value: 'sent', label: 'Enviado' },
                  { value: 'accepted', label: 'Aceptado' },
                  { value: 'rejected', label: 'Rechazado' },
                  { value: 'expired', label: 'Expirado' },
                  { value: 'converted', label: 'Convertido' },
                ],
              },
              { name: 'startDate', label: 'Fecha Inicio', type: 'date' },
              { name: 'endDate', label: 'Fecha Fin', type: 'date' },
            ]}
            onFilterChange={handleFilterChange}
          />
        </Box>

        {/* Mostrar indicador de carga o tabla de resultados */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Válido hasta</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay presupuestos disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((quote) => (
                    <TableRow key={quote._id}>
                      <TableCell>{quote.quoteNumber}</TableCell>
                      <TableCell>
                        {typeof quote.client === 'object'
                          ? quote.client.name
                          : 'Cliente no disponible'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(quote.issueDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(quote.validUntil), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(quote.total)}
                      </TableCell>
                      <TableCell>{renderStatus(quote.status)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver detalles">
                          <IconButton
                            onClick={() => navigate(`/quotes/${quote._id}`)}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {quote.status !== 'converted' && (
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => navigate(`/quotes/edit/${quote._id}`)}
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Generar PDF">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => {
                              // Implementación futura de descarga de PDF
                              alert('Funcionalidad PDF en desarrollo');
                            }}
                          >
                            <PdfIcon />
                          </IconButton>
                        </Tooltip>
                        {quote.status === 'accepted' && (
                          <Tooltip title="Convertir a factura">
                            <IconButton
                              onClick={() => handleConvertRequest(quote._id as string)}
                              color="success"
                              size="small"
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {quote.status !== 'converted' && (
                          <Tooltip title="Eliminar">
                            <IconButton
                              onClick={() => handleDeleteRequest(quote._id as string)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  )))
                }
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={handleLimitChange}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        )}
      </Paper>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este presupuesto? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de conversión a factura */}
      <Dialog
        open={convertDialogOpen}
        onClose={() => setConvertDialogOpen(false)}
      >
        <DialogTitle>Convertir a factura</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Desea convertir este presupuesto en una factura? Esta acción no se puede deshacer y el presupuesto quedará marcado como convertido.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConvertConfirm} color="primary" autoFocus>
            Convertir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuoteList;
