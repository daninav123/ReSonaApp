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
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: yup
    .string()
    .min(9, 'Phone must be at least 9 characters')
    .required('Phone is required'),
  address: yup
    .string()
    .min(10, 'Address must be at least 10 characters')
    .required('Address is required'),
  type: yup
    .string()
    .oneOf(['INDIVIDUAL', 'COMPANY'], 'Invalid client type')
    .required('Type is required'),
  status: yup
    .string()
    .oneOf(['ACTIVE', 'INACTIVE'], 'Invalid status')
    .required('Status is required'),
});

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  status: string;
}

export const Clients: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const [open, setOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);

  const handleOpen = (client: Client | null) => {
    setSelectedClient(client);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedClient(null);
    setOpen(false);
  };

  const handleCreate = () => {
    handleOpen(null);
  };

  const handleEdit = (client: Client) => {
    handleOpen(client);
  };

  const handleDelete = async (clientId: string) => {
    try {
      // Aquí iría la llamada a la API para eliminar el cliente
      showNotification({
        title: 'Success',
        message: 'Client deleted successfully',
        color: 'brand',
      });
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to delete client',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedClient) {
        // Actualizar cliente existente
        await dispatch(updateUser({ ...selectedClient, ...data })).unwrap();
        showNotification({
          title: 'Success',
          message: 'Client updated successfully',
          color: 'brand',
        });
      } else {
        // Crear nuevo cliente
        await dispatch(updateUser(data)).unwrap();
        showNotification({
          title: 'Success',
          message: 'Client created successfully',
          color: 'brand',
        });
      }
      handleClose();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save client',
        color: 'red',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Clients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          Create Client
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Aquí iría el mapeo de los clientes desde Redux */}
            {/* {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>
                  <MenuItem value={client.type}>
                    {client.type}
                  </MenuItem>
                </TableCell>
                <TableCell>
                  <MenuItem value={client.status}>
                    {client.status}
                  </MenuItem>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(client.id)}>
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
          {selectedClient ? 'Edit Client' : 'Create Client'}
        </DialogTitle>
        <DialogContent>
          <Form
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            defaultValues={selectedClient}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormInput name="name" label="Name" fullWidth />
              <FormInput name="email" label="Email" type="email" fullWidth />
              <FormInput name="phone" label="Phone" fullWidth />
              <FormInput name="address" label="Address" fullWidth multiline rows={2} />
              <FormSelect
                name="type"
                label="Type"
                options={[
                  { value: 'INDIVIDUAL', label: 'Individual' },
                  { value: 'COMPANY', label: 'Company' },
                ]}
                fullWidth
              />
              <FormSelect
                name="status"
                label="Status"
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
                fullWidth
              />
            </Box>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedClient ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
