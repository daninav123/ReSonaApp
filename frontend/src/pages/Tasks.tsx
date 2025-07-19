import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUser, updateUser } from '../store/slices/userSlice';
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
import { Form, FormInput, FormTextarea } from '../components/form';
import { showNotification } from '@mantine/notifications';

const validationSchema = yup.object({
  title: yup
    .string()
    .min(3, 'Title must be at least 3 characters')
    .required('Title is required'),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  priority: yup
    .string()
    .oneOf(['LOW', 'MEDIUM', 'HIGH'], 'Invalid priority')
    .required('Priority is required'),
  status: yup
    .string()
    .oneOf(['PENDING', 'IN_PROGRESS', 'COMPLETED'], 'Invalid status')
    .required('Status is required'),
});

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
}

export const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const [open, setOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const handleOpen = (task: Task | null) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedTask(null);
    setOpen(false);
  };

  const handleCreate = () => {
    handleOpen(null);
  };

  const handleEdit = (task: Task) => {
    handleOpen(task);
  };

  const handleDelete = async (taskId: string) => {
    try {
      // Aquí iría la llamada a la API para eliminar la tarea
      showNotification({
        title: 'Success',
        message: 'Task deleted successfully',
        color: 'brand',
      });
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to delete task',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedTask) {
        // Actualizar tarea existente
        await dispatch(updateUser({ ...selectedTask, ...data })).unwrap();
        showNotification({
          title: 'Success',
          message: 'Task updated successfully',
          color: 'brand',
        });
      } else {
        // Crear nueva tarea
        await dispatch(updateUser(data)).unwrap();
        showNotification({
          title: 'Success',
          message: 'Task created successfully',
          color: 'brand',
        });
      }
      handleClose();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save task',
        color: 'red',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          Create Task
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Aquí iría el mapeo de las tareas desde Redux */}
            {/* {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(task)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(task.id)}>
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
          {selectedTask ? 'Edit Task' : 'Create Task'}
        </DialogTitle>
        <DialogContent>
          <Form
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            defaultValues={selectedTask}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormInput name="title" label="Title" fullWidth />
              <FormInput name="description" label="Description" fullWidth multiline rows={4} />
              <FormSelect
                name="priority"
                label="Priority"
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                ]}
                fullWidth
              />
              <FormSelect
                name="status"
                label="Status"
                options={[
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                ]}
                fullWidth
              />
            </Box>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
