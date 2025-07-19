import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Tab, 
  Tabs, 
  useTheme, 
  useMediaQuery,
  alpha,
  Skeleton
} from '@mui/material';
import { Card, Typography, Button } from '../components/common';
import { styled } from '@mui/material/styles';
import { Badge as MuiBadge, badgeClasses } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { RootState } from '../store/store';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Container } from '@mantine/core';
import { Chart } from '../components/Chart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface CardData {
  title: string;
  count: number;
  variant: 'primary' | 'success' | 'warning';
  label: string;
}

// Estilos personalizados para las pestañas
const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 120,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const StyledBadge = styled(MuiBadge)(({ theme, color = 'default' }) => ({
  [`& .${badgeClasses.badge}`]: {
    right: -10,
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: 8,
    padding: '4px 8px',
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'capitalize',
  },
}));

// Añadir función para calcular contraste
const getContrastColor = (bgColor: string) => {
  // Convertir color a RGB
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  
  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Devolver color de texto basado en luminancia
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
  // Añadir contraste mejorado
  backgroundColor: theme.palette.background.paper,
  color: getContrastColor(theme.palette.background.paper),
  // Alto contraste para modo accesibilidad
  '@media (prefers-contrast: high)': {
    border: '2px solid #000',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 4,
    borderRadius: '2px 2px 0 0',
  },
  '& .MuiTab-root': {
    minHeight: 56,
    [theme.breakpoints.up('sm')]: {
      minWidth: 120,
    },
  },
}));

const CountBadge = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 20,
  height: 20,
  padding: theme.spacing(0, 0.75),
  borderRadius: 10,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontSize: '0.75rem',
  fontWeight: 500,
  marginLeft: theme.spacing(1),
}));

const cardsByRole: Record<string, CardData[]> = {
  ceo: [
    { title: 'Próximos Eventos', count: 5, variant: 'primary', label: 'Pendiente' },
    { title: 'Presupuestos Pendientes', count: 8, variant: 'primary', label: 'Pendiente' },
    { title: 'Clientes Activos', count: 12, variant: 'success', label: 'Activo' },
    { title: 'Stock Bajo', count: 2, variant: 'warning', label: 'Por reparar' },
  ],
  comercial: [
    { title: 'Clientes Activos', count: 12, variant: 'success', label: 'Activo' },
    { title: 'Presupuestos Pendientes', count: 8, variant: 'primary', label: 'Pendiente' },
    { title: 'Nuevos Leads', count: 3, variant: 'primary', label: 'Nuevo' },
  ],
  tecnico: [
    { title: 'Eventos Asignados', count: 4, variant: 'success', label: 'Asignado' },
    { title: 'Stock Bajo', count: 2, variant: 'warning', label: 'Por reparar' },
    { title: 'Tareas Pendientes', count: 7, variant: 'primary', label: 'Pendiente' },
  ],
  'jefe de almacen': [
    { title: 'Stock Bajo', count: 5, variant: 'warning', label: 'Reponer' },
    { title: 'Pedidos Pendientes', count: 2, variant: 'primary', label: 'Pendiente' },
  ],
  'jefe de equipo': [
    { title: 'Equipos Asignados', count: 3, variant: 'success', label: 'Activo' },
    { title: 'Incidencias', count: 1, variant: 'warning', label: 'Urgente' },
  ],
  montador: [
    { title: 'Montajes Pendientes', count: 4, variant: 'primary', label: 'Pendiente' },
    { title: 'Montajes Completados', count: 12, variant: 'success', label: 'Completado' },
  ],
  'tecnico auxiliar': [
    { title: 'Tareas Asignadas', count: 6, variant: 'primary', label: 'Pendiente' },
  ],
  'tecnico audiovisual': [
    { title: 'Eventos AV', count: 3, variant: 'success', label: 'Activo' },
    { title: 'Equipos en Uso', count: 8, variant: 'success', label: 'En uso' },
  ],
  dj: [
    { title: 'Próximos Shows', count: 2, variant: 'primary', label: 'Próximo' },
    { title: 'Listas de Reproducción', count: 5, variant: 'success', label: 'Activo' },
  ],
};

const getUserRole = () => {
  // TODO: Sustituir por fetch a /api/me o decodificar JWT
  const role = localStorage.getItem('role')?.toLowerCase() || 'ceo';
  return Object.keys(cardsByRole).includes(role) ? role : 'ceo';
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeRole, setActiveRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const cards = cardsByRole[activeRole] || [];

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      const role = user?.role?.toLowerCase() || 'ceo';
      setActiveRole(role);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [user]);

  const handleRoleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveRole(newValue);
  };

  const getBadgeColor = (variant: string): 'primary' | 'success' | 'warning' | 'default' => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const barData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Eventos',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Eventos por Mes',
      },
    },
  };

  const lineData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Ventas',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Ventas Anuales',
      },
    },
  };

  const materialsData = {
    labels: ['Wood', 'Metal', 'Plastic', 'Glass', 'Concrete'],
    data: [120, 85, 65, 45, 110]
  };

  const budgetsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    data: [25000, 32000, 18000, 42000, 37000]
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <h1>Dashboard</h1>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Skeleton variant="rectangular" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="40%" sx={{ mb: 4 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </div>
    );
  }

  return (
    <Container className="page-container">
      <h1>Dashboard</h1>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Panel de Control
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Resumen de actividades y métricas importantes
          </Typography>
        </Box>

        <Box 
          sx={{ 
            mb: 4,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '1px',
              backgroundColor: theme.palette.divider,
            }
          }}
        >
          <StyledTabs
            value={activeRole}
            onChange={handleRoleChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="roles tabs"
            sx={{
              position: 'relative',
              zIndex: 1,
              '& .MuiTabs-scroller': {
                overflow: 'visible !important',
              },
            }}
          >
            {Object.entries(cardsByRole).map(([role, cards]) => (
              <StyledTab
                key={role}
                value={role}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                    {cards.length > 0 && (
                      <CountBadge>
                        {cards.length}
                      </CountBadge>
                    )}
                  </Box>
                }
                disableRipple
                sx={{
                  textTransform: 'capitalize',
                  '&.Mui-selected': {
                    color: 'text.primary',
                    fontWeight: 600,
                  },
                }}
              />
            ))}
          </StyledTabs>
        </Box>

        {cards.length > 0 ? (
          <Grid container spacing={3}>
            {cards.map(({ title, count, variant, label }) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={title}>
                <DashboardCard
                  sx={{
                    '&:hover': {
                      '& .card-hover-indicator': {
                        backgroundColor: getBadgeColor(variant),
                      },
                    },
                  }}
                >
                  <div className="card-hover-indicator" />
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 2,
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        color="text.secondary"
                        sx={{
                          transition: theme.transitions.create('color'),
                          '&:hover': {
                            color: 'text.primary',
                          },
                        }}
                      >
                        {title}
                      </Typography>
                      <StyledBadge
                        badgeContent={label}
                        color={getBadgeColor(variant) as any}
                        sx={{ 
                          ml: 1,
                          '& .MuiBadge-badge': {
                            backgroundColor: (theme) => {
                              const colors = {
                                primary: theme.palette.primary.main,
                                success: theme.palette.success.main,
                                warning: theme.palette.warning.main,
                              };
                              return colors[getBadgeColor(variant) as keyof typeof colors] || theme.palette.grey[400];
                            },
                            color: (theme) => {
                              const colors = {
                                primary: theme.palette.primary.contrastText,
                                success: theme.palette.success.contrastText,
                                warning: theme.palette.warning.contrastText,
                              };
                              return colors[getBadgeColor(variant) as keyof typeof colors] || theme.palette.common.white;
                            },
                          },
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold', 
                        my: 2,
                        position: 'relative',
                        zIndex: 1,
                        background: (theme) => 
                          `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block',
                      }}
                    >
                      {count}
                    </Typography>
                    <Box 
                      sx={{ 
                        mt: 'auto', 
                        pt: 2, 
                        borderTop: `1px solid`,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          '&:hover': {
                            color: 'primary.main',
                          },
                          transition: theme.transitions.create('color'),
                        }}
                      >
                        Ver detalles
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'inline-flex',
                            ml: 0.5,
                            transform: 'translateX(0)',
                            transition: theme.transitions.create('transform'),
                            '&:hover': {
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          →
                        </Box>
                      </Typography>
                      <Box 
                        sx={{
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                          },
                          transition: theme.transitions.create(['background-color', 'transform']),
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Box>
                    </Box>
                  </Box>
                </DashboardCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              No hay datos disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360 }}>
              No se encontraron métricas para este rol en este momento. Intenta con otro rol o verifica más tarde.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => setActiveRole('ceo')}
              startIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            >
              Volver al inicio
            </Button>
          </Card>
        )}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <Typography variant="h6" component="h3" sx={{ p: 2 }}>
                Eventos por Mes
              </Typography>
              <Box sx={{ p: 2 }}>
                <Bar data={barData} options={barOptions} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <Typography variant="h6" component="h3" sx={{ p: 2 }}>
                Ventas Anuales
              </Typography>
              <Box sx={{ p: 2 }}>
                <Line data={lineData} options={lineOptions} />
              </Box>
            </Card>
          </Grid>
        </Grid>
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h2>Materials Inventory</h2>
            <Chart 
              title="Materials by Quantity" 
              labels={materialsData.labels} 
              data={materialsData.data}
              backgroundColor="rgba(75, 192, 192, 0.6)"
            />
          </div>
          
          <div>
            <h2>Budget Overview</h2>
            <Chart 
              title="Monthly Budgets" 
              labels={budgetsData.labels} 
              data={budgetsData.data}
              backgroundColor="rgba(153, 102, 255, 0.6)"
            />
          </div>
        </div>
      </Box>
    </Container>
  );
};

export default DashboardPage;
