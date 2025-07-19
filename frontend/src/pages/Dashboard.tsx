import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { Button, Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { useSnackbar } from 'notistack'; // Using notistack for notifications instead of Mantine

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const { enqueueSnackbar } = useSnackbar();

  const handleCreateTask = () => {
    navigate('/tasks/new');
  };

  const handleViewTasks = () => {
    navigate('/tasks');
  };

  const handleViewMaterials = () => {
    navigate('/materials');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Role: {user?.roles.join(', ')}
        </Typography>
      </div>

      <Grid container spacing={4}>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Tasks
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateTask}
              >
                Create New Task
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleViewTasks}
                sx={{ mt: 2 }}
              >
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Materials
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleViewMaterials}
              >
                Manage Materials
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Notifications
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  enqueueSnackbar('This is a test notification', {
                    variant: 'info',
                    autoHideDuration: 3000,
                  });
                }}
              >
                Test Notification
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
