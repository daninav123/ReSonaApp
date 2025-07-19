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
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import invoiceApi from '../../api/invoiceApi';
import type { Invoice } from '../../api/invoiceApi';
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

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Hooks para manejo de errores y notificaciones
  const { error, handleError, clearError } = useApiError();
  const { showSuccess, showError } = useNotification();

  const navigate = useNavigate();

  // Cargar facturas
  const loadInvoices = async () => {
    try {
      setLoading(true);
      clearError(); // Limpiar cualquier error previo
      
      const response = await invoiceApi.getInvoices(filters);
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (err) {
      handleError(err);
      showError('No se pudieron cargar las facturas. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
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
    setSelectedInvoiceId(id);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleDeleteInvoice = async () => {
    if (selectedInvoiceId) {
      try {
        clearError(); // Limpiar cualquier error previo
        
        await invoiceApi.deleteInvoice(selectedInvoiceId);
        showSuccess('Factura eliminada correctamente');
        setDeleteDialogOpen(false);
        loadInvoices();
      } catch (err) {
        handleError(err);
        showError('No se pudo eliminar la factura. Intente nuevamente.');
      }
      setSelectedInvoiceId(null);
    }
  };

  // Renderizar el estado de la factura con un chip de color
  const renderStatus = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      'draft': { color: 'default', label: 'Borrador' },
      'sent': { color: 'info', label: 'Enviada' },
      'paid': { color: 'success', label: 'Pagada' },
      'overdue': { color: 'error', label: 'Vencida' },
      'cancelled': { color: 'warning', label: 'Cancelada' },
      'partially-paid': { color: 'warning', label: 'Pago parcial' },
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
          <Typography variant="h5">Facturas</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/invoices/create"
          >
            Nueva Factura
          </Button>
        </Box>
        
        {/* Mostrar alerta de error si existe */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error.message}
          </Alert>
        )}

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
                { value: 'sent', label: 'Enviada' },
                { value: 'paid', label: 'Pagada' },
                { value: 'overdue', label: 'Vencida' },
                { value: 'cancelled', label: 'Cancelada' },
                { value: 'partially-paid', label: 'Pago parcial' },
              ],
            },
            { name: 'startDate', label: 'Fecha Inicio', type: 'date' },
            { name: 'endDate', label: 'Fecha Fin', type: 'date' },
          ]}
          onFilterChange={handleFilterChange}
        />

        {/* Mostrar indicador de carga */}
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
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay facturas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        {typeof invoice.client === 'object'
                          ? invoice.client.name
                          : 'Cliente no disponible'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.issueDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(invoice.total)}
                      </TableCell>
                      <TableCell>{renderStatus(invoice.status)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver detalles">
                          <IconButton
                            onClick={() => navigate(`/invoices/${invoice._id}`)}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => navigate(`/invoices/edit/${invoice._id}`)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
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
                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => handleDeleteRequest(invoice._id as string)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
            ¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteInvoice} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvoiceList;
