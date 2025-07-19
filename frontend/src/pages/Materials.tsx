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
  quantity: yup
    .number()
    .min(0, 'Quantity cannot be negative')
    .required('Quantity is required'),
  unit: yup
    .string()
    .oneOf(['kg', 'm', 'un', 'l', 'm2', 'm3'], 'Invalid unit')
    .required('Unit is required'),
  price: yup
    .number()
    .min(0, 'Price cannot be negative')
    .required('Price is required'),
  category: yup
    .string()
    .required('Category is required'),
});

interface Material {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
}

export const Materials: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const [open, setOpen] = React.useState(false);
  const [selectedMaterial, setSelectedMaterial] = React.useState<Material | null>(null);

  const handleOpen = (material: Material | null) => {
    setSelectedMaterial(material);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedMaterial(null);
    setOpen(false);
  };

  const handleCreate = () => {
    handleOpen(null);
  };

  const handleEdit = (material: Material) => {
    handleOpen(material);
  };

  const handleDelete = async (materialId: string) => {
    try {
      // Aquí iría la llamada a la API para eliminar el material
      showNotification({
        title: 'Success',
        message: 'Material deleted successfully',
        color: 'brand',
      });
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to delete material',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedMaterial) {
        // Actualizar material existente
        await dispatch(updateUser({ ...selectedMaterial, ...data })).unwrap();
        showNotification({
          title: 'Success',
          message: 'Material updated successfully',
          color: 'brand',
        });
      } else {
        // Crear nuevo material
        await dispatch(updateUser(data)).unwrap();
        showNotification({
          title: 'Success',
          message: 'Material created successfully',
          color: 'brand',
        });
      }
      handleClose();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save material',
        color: 'red',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Materials
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          Create Material
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Aquí iría el mapeo de los materiales desde Redux */}
            {/* {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>{material.name}</TableCell>
                <TableCell>{material.description}</TableCell>
                <TableCell>{material.quantity}</TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell>{material.price}</TableCell>
                <TableCell>{material.category}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(material)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(material.id)}>
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
          {selectedMaterial ? 'Edit Material' : 'Create Material'}
        </DialogTitle>
        <DialogContent>
          <Form
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            defaultValues={selectedMaterial}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormInput name="name" label="Name" fullWidth />
              <FormInput name="description" label="Description" fullWidth multiline rows={4} />
              <FormInput name="quantity" label="Quantity" type="number" fullWidth />
              <FormSelect
                name="unit"
                label="Unit"
                options={[
                  { value: 'kg', label: 'Kilograms' },
                  { value: 'm', label: 'Meters' },
                  { value: 'un', label: 'Units' },
                  { value: 'l', label: 'Liters' },
                  { value: 'm2', label: 'Square meters' },
                  { value: 'm3', label: 'Cubic meters' },
                ]}
                fullWidth
              />
              <FormInput name="price" label="Price" type="number" fullWidth />
              <FormInput name="category" label="Category" fullWidth />
            </Box>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedMaterial ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
