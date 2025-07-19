import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Form, FormInput, FormSelect } from '../components/form';
import { showNotification } from '@mantine/notifications';

const validationSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  client: yup
    .string()
    .required('Client is required'),
  status: yup
    .string()
    .oneOf(['DRAFT', 'SENT', 'APPROVED', 'REJECTED'], 'Invalid status')
    .required('Status is required'),
  total: yup
    .number()
    .min(0, 'Total cannot be negative')
    .required('Total is required'),
});

interface Budget {
  id: string;
  name: string;
  description: string;
  client: string;
  status: string;
  total: number;
}

export const Budgets: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const [open, setOpen] = React.useState(false);
  const [selectedBudget, setSelectedBudget] = React.useState<Budget | null>(null);

  const handleOpen = (budget: Budget | null) => {
    setSelectedBudget(budget);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedBudget(null);
    setOpen(false);
  };

  const handleCreate = () => {
    handleOpen(null);
  };

  const handleEdit = (budget: Budget) => {
    handleOpen(budget);
  };

  const handleDelete = async (budgetId: string) => {
    try {
      // Aquí iría la llamada a la API para eliminar el presupuesto
      showNotification({
        title: 'Success',
        message: 'Budget deleted successfully',
        color: 'brand',
      });
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to delete budget',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedBudget) {
        // Actualizar presupuesto existente
        await dispatch(updateUser({ ...selectedBudget, ...data })).unwrap();
        showNotification({
          title: 'Success',
          message: 'Budget updated successfully',
          color: 'brand',
        });
      } else {
        // Crear nuevo presupuesto
        await dispatch(updateUser(data)).unwrap();
        showNotification({
          title: 'Success',
          message: 'Budget created successfully',
          color: 'brand',
        });
      }
      handleClose();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save budget',
        color: 'red',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Budgets
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          Create Budget
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Aquí iría el mapeo de los presupuestos desde Redux */}
            {/* {budgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell>{budget.name}</TableCell>
                <TableCell>{budget.description}</TableCell>
                <TableCell>{budget.client}</TableCell>
                <TableCell>
                  <MenuItem value={budget.status}>
                    {budget.status}
                  </MenuItem>
                </TableCell>
                <TableCell>{budget.total}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(budget)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(budget.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBudget ? 'Edit Budget' : 'Create Budget'}
        </DialogTitle>
        <DialogContent>
          <Form
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            defaultValues={selectedBudget}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormInput name="name" label="Name" fullWidth />
              <FormInput name="description" label="Description" fullWidth multiline rows={4} />
              <FormInput name="client" label="Client" fullWidth />
              <FormSelect
                name="status"
                label="Status"
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'SENT', label: 'Sent' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' },
                ]}
                fullWidth
              />
              <FormInput name="total" label="Total" type="number" fullWidth />
            </Box>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedBudget ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
