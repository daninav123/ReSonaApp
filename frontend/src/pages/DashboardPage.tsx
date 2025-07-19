import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Grid, 
  Tab, 
  Tabs, 
  useTheme, 
  styled,
  CardContent,
  Container,
  Card as MuiCard,
  Typography,
  Badge,
  Skeleton,
  type CardProps,
  type TabsProps,
  Button,
  Tooltip as MuiTooltip,
  IconButton,
} from '@mui/material';
import { 
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  Speed as GaugeChartIcon,
  MoreVert as MoreVertIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  type ChartData as ChartJSData,
} from 'chart.js';
import { Bar, Line, Doughnut, PolarArea } from 'react-chartjs-2';
import { useAppSelector } from '../store/hooks';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend
);

// Types
type RoleType = 'ceo' | 'admin' | 'user' | 'comercial' | 'tecnico' | 'jefe de almacen' | 'jefe de equipo' | 'montador' | 'tecnico auxiliar' | 'tecnico audiovisual' | 'dj' | 'gerente' | 'supervisor' | 'asistente' | 'consultor' | 'analista' | 'desarrollador' | 'diseñador' | 'especialista' | 'coordinador';

interface CardData {
  title: string;
  count: number;
  variant: 'primary' | 'success' | 'warning' | 'error' | 'info';
  label?: string;
}

// Styled components
const StyledCard = styled(MuiCard)<CardProps>(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

// Componente envoltorio para Grid con propiedades correctas de tipado
const GridItem = (props: any) => (
  <Grid item {...props} />
);

const StyledTabs = styled(Tabs)<TabsProps>(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    height: 4,
  },
}));

// Mock data for dashboard cards by role
// Using Partial<Record> para evitar tener que definir todas las propiedades de RoleType
const CARDS_BY_ROLE: Partial<Record<RoleType, CardData[]>> = {
  ceo: [
    { title: 'Total Ventas', count: 12500, variant: 'primary', label: '+12%' },
    { title: 'Clientes Nuevos', count: 42, variant: 'success', label: '+8' },
    { title: 'Tickets Abiertos', count: 18, variant: 'warning' },
    { title: 'Tareas Pendientes', count: 7, variant: 'error' },
  ],
  admin: [
    { title: 'Usuarios Activos', count: 24, variant: 'primary' },
    { title: 'Tareas Completadas', count: 15, variant: 'success' },
    { title: 'Notificaciones', count: 3, variant: 'info' },
  ],
  user: [
    { title: 'Mis Proyectos', count: 5, variant: 'primary' },
    { title: 'Tareas Pendientes', count: 3, variant: 'warning' },
  ],
  comercial: [
    { title: 'Oportunidades', count: 12, variant: 'primary' },
    { title: 'Clientes Potenciales', count: 8, variant: 'success' },
    { title: 'Reuniones Hoy', count: 3, variant: 'info' },
  ],
  tecnico: [
    { title: 'Servicios Programados', count: 6, variant: 'primary' },
    { title: 'Pendientes de Aprobación', count: 2, variant: 'warning' },
  ],
  'jefe de almacen': [
    { title: 'Productos en Stock', count: 245, variant: 'primary' },
    { title: 'Productos por Reponer', count: 12, variant: 'warning' },
  ],
  'jefe de equipo': [
    { title: 'Equipos Activos', count: 8, variant: 'primary' },
    { title: 'Tareas del Día', count: 15, variant: 'info' },
  ],
  montador: [
    { title: 'Montajes Programados', count: 4, variant: 'primary' },
    { title: 'Materiales Necesarios', count: 12, variant: 'info' },
  ],
  'tecnico auxiliar': [
    { title: 'Asignaciones', count: 5, variant: 'primary' },
    { title: 'Tareas Completadas', count: 12, variant: 'success' },
  ],
  'tecnico audiovisual': [
    { title: 'Eventos Programados', count: 3, variant: 'primary' },
    { title: 'Equipos Disponibles', count: 8, variant: 'success' },
  ],
  dj: [
    { title: 'Sesiones Programadas', count: 5, variant: 'primary' },
    { title: 'Solicitudes Pendientes', count: 2, variant: 'warning' },
  ],
};

const DashboardPage: React.FC = () => {
  // Función para exportar datos del gráfico como CSV
  const exportChartData = (chartType: string) => {
    try {
      let data: { labels: string[], values: number[] } = { labels: [], values: [] };
      let filename = '';
      
      switch (chartType) {
        case 'ventas':
          data.labels = barChartData.labels as string[];
          data.values = barChartData.datasets[0].data as number[];
          filename = 'ventas-mensuales.csv';
          break;
        case 'actividad':
          data.labels = lineChartData.labels as string[];
          data.values = lineChartData.datasets[0].data as number[];
          filename = 'actividad-usuarios.csv';
          break;
        case 'presupuesto':
          data.labels = doughnutChartData.labels as string[];
          data.values = doughnutChartData.datasets[0].data as number[];
          filename = 'distribucion-presupuesto.csv';
          break;
        case 'inventario':
          data.labels = polarAreaData.labels as string[];
          data.values = polarAreaData.datasets[0].data as number[];
          filename = 'inventario-materiales.csv';
          break;
        default:
          throw new Error('Tipo de gráfico no reconocido');
      }
      
      // Crear contenido CSV
      const csvContent = [
        // Cabecera
        ['Categoría', 'Valor'].join(','),
        // Datos
        ...data.labels.map((label, index) => [
          `"${label}"`,
          data.values[index]
        ].join(','))
      ].join('\n');
      
      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Datos exportados: ${filename}`);
    } catch (error) {
      console.error('Error al exportar datos:', error);
      alert('No se pudieron exportar los datos. Por favor, inténtelo de nuevo.');
    }
  };
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  
  // Reset error state on component mount
  useEffect(() => {
    setHasError(false);
  }, []);
  
  // Error boundary
  if (hasError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Ocurrió un error al cargar el panel de control
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
        >
          Recargar página
        </Button>
      </Container>
    );
  }
  const [activeRole, setActiveRole] = useState<RoleType>('admin');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user role from Redux store with fallback to 'user'
  // Corregido para usar roles en lugar de role (según tipo de datos)
  const userRole = (useAppSelector((state) => state.auth.user?.roles?.[0]) || 'user') as RoleType;
  
  // Set active role based on user role when component mounts
  useEffect(() => {
    try {
      if (userRole && CARDS_BY_ROLE[userRole]) {
        setActiveRole(userRole);
      } else {
        // Fallback to a valid role if user's role is not in CARDS_BY_ROLE
        setActiveRole('user');
      }
    } catch (error) {
      console.error('Error setting active role:', error);
      setActiveRole('user');
    }
  }, [userRole]);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: RoleType) => {
    setActiveRole(newValue);
  };

  // Get cards for current role
  const cards = useMemo(() => {
    return CARDS_BY_ROLE[activeRole] || CARDS_BY_ROLE.user || [];
  }, [activeRole]);

  // Get badge color based on variant
  const getBadgeColor = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  };

  // Chart data and options
  const barChartData = useMemo<ChartJSData<'bar'>>(() => ({
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }), []);

  const lineChartData = useMemo<ChartJSData<'line'>>(() => ({
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Actividad',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }), []);
  
  const doughnutChartData = useMemo<ChartJSData<'doughnut'>>(() => ({
    labels: ['Marketing', 'Desarrollo', 'Recursos Humanos', 'Operaciones', 'Ventas'],
    datasets: [
      {
        data: [25, 30, 15, 20, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }), []);
  
  const polarAreaData = useMemo<ChartJSData<'polarArea'>>(() => ({
    labels: ['Equipo Audio', 'Iluminación', 'Video', 'Escenarios', 'Accesorios'],
    datasets: [
      {
        data: [85, 60, 75, 40, 25],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }), []);

  // Opciones para gráficos de barras y líneas con tipado correcto
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }), []) as any;
  
  // Opciones para gráficos de dona con tipado correcto
  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${value})`;  
          }
        }
      }
    },
  }), []);
  
  // Opciones para gráficos de área polar con tipado correcto
  const polarAreaOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 10
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const maxValue = 100;
            const percentage = Math.round((value / maxValue) * 100);
            return `${label}: ${percentage}% disponible`;  
          }
        }
      }
    },
  }), []);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <GridItem key={item} xs={12} sm={6} md={4} lg={3}>
              <Skeleton variant="rectangular" height={118} />
              <Skeleton animation="wave" />
              <Skeleton animation="wave" width="60%" />
            </GridItem>
          ))}
        </Grid>
      </Container>
    );
  }

  // Detector de dispositivos móviles usando useState y useEffect
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Actualizar estado isMobile al cambiar el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Role Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, md: 3 } }}>
        <StyledTabs
          value={activeRole}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="dashboard role tabs"
          sx={{ minHeight: { xs: '48px', md: '64px' } }}
        >
          {Object.keys(CARDS_BY_ROLE).map((role) => (
            <Tab 
              key={role} 
              label={role.charAt(0).toUpperCase() + role.slice(1)}
              value={role}
              sx={{ textTransform: 'none' }}
            />
          ))}
        </StyledTabs>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {cards.map((card, index) => (
          <GridItem key={index} xs={6} sm={6} md={4} lg={3}>
            <StyledCard>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={isMobile ? 1 : 2}>
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
                    {card.title}
                  </Typography>
                  {card.label && (
                    <Badge 
                      color={getBadgeColor(card.variant) as any}
                      sx={{ 
                        p: { xs: 0.5, sm: 1 }, 
                        borderRadius: 1,
                        '& .MuiBadge-badge': {
                          right: -5,
                          top: 5,
                        }
                      }}
                    >
                      {card.label}
                    </Badge>
                  )}
                </Box>
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  component="div" 
                  sx={{ fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
                >
                  {card.count.toLocaleString()}
                </Typography>
              </CardContent>
            </StyledCard>
          </GridItem>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: { xs: 1, md: 2 } }}>
        <GridItem xs={12} md={6}>
          <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'background.paper', borderRadius: 1, height: '100%' }} className="chart-wrapper">
            <Box display="flex" alignItems="center" mb={isMobile ? 1 : 2}>
              <BarChartIcon color="primary" sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
              <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>Ventas Mensuales</Typography>
              <Box flexGrow={1} />
              <MuiTooltip title="Exportar datos">
                <IconButton size="small" onClick={() => exportChartData('ventas')} sx={{ mx: 0.5 }}>
                  <DownloadIcon sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Ver reporte completo">
                <IconButton size="small">
                  <MoreVertIcon sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box sx={{ height: { xs: 250, sm: 300 } }} className="chart-container">
              <Bar data={barChartData} options={{...chartOptions, maintainAspectRatio: false}} />
            </Box>
          </Box>
        </GridItem>
        <GridItem xs={12} md={6}>
          <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'background.paper', borderRadius: 1, height: '100%' }} className="chart-wrapper">
            <Box display="flex" alignItems="center" mb={isMobile ? 1 : 2}>
              <LineChartIcon color="secondary" sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
              <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>Actividad de Usuarios</Typography>
              <Box flexGrow={1} />
              <MuiTooltip title="Exportar datos">
                <IconButton size="small" onClick={() => exportChartData('actividad')} sx={{ mx: 0.5 }}>
                  <DownloadIcon sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Ver calendario">
                <IconButton size="small">
                  <MoreVertIcon sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box sx={{ height: { xs: 250, sm: 300 } }} className="chart-container">
              <Line data={lineChartData} options={{...chartOptions, maintainAspectRatio: false}} />
            </Box>
          </Box>
        </GridItem>
        <GridItem xs={12} md={6}>
          <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'background.paper', borderRadius: 1, height: '100%', mt: { xs: 2, md: 3 } }} className="chart-wrapper">
            <Box display="flex" alignItems="center" mb={isMobile ? 1 : 2}>
              <PieChartIcon color="info" sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
              <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>Distribución de Presupuesto</Typography>
              <Box flexGrow={1} />
              <MuiTooltip title="Exportar datos">
                <IconButton size="small" onClick={() => exportChartData('presupuesto')} sx={{ mx: 0.5 }}>
                  <DownloadIcon sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Ver detalles">
                <IconButton size="small">
                  <MoreVertIcon sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box sx={{ height: { xs: 250, sm: 300 }, display: 'flex', justifyContent: 'center' }} className="chart-container">
              <Box sx={{ maxWidth: { xs: '100%', md: 500 }, width: '100%' }}>
                <Doughnut 
                  data={doughnutChartData} 
                  options={{
                    ...doughnutOptions, 
                    maintainAspectRatio: false,
                    plugins: {
                      ...doughnutOptions.plugins,
                      legend: {
                        ...doughnutOptions.plugins?.legend,
                        position: isMobile ? 'bottom' : 'right',
                        labels: { 
                          boxWidth: isMobile ? 10 : 15,
                          padding: isMobile ? 10 : 15,
                          font: { size: isMobile ? 10 : 12 }
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </Box>
          </Box>
        </GridItem>
        <GridItem xs={12} md={6}>
          <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'background.paper', borderRadius: 1, height: '100%', mt: { xs: 2, md: 3 } }} className="chart-wrapper">
            <Box display="flex" alignItems="center" mb={isMobile ? 1 : 2}>
              <GaugeChartIcon color="error" sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
              <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>Inventario de Materiales</Typography>
              <Box flexGrow={1} />
              <MuiTooltip title="Exportar datos">
                <IconButton size="small" onClick={() => exportChartData('inventario')} sx={{ mx: 0.5 }}>
                  <DownloadIcon sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Ver inventario">
                <IconButton size="small">
                  <MoreVertIcon sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box sx={{ height: { xs: 250, sm: 300 }, display: 'flex', justifyContent: 'center' }} className="chart-container">
              <Box sx={{ maxWidth: { xs: '100%', md: 500 }, width: '100%' }}>
                <PolarArea 
                  data={polarAreaData} 
                  options={{
                    ...polarAreaOptions, 
                    maintainAspectRatio: false,
                    plugins: {
                      ...polarAreaOptions.plugins,
                      legend: {
                        ...polarAreaOptions.plugins?.legend,
                        position: isMobile ? 'bottom' : 'right',
                        labels: { 
                          boxWidth: isMobile ? 10 : 15,
                          padding: isMobile ? 10 : 15,
                          font: { size: isMobile ? 10 : 12 }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
