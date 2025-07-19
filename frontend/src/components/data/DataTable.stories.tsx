import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Box, Button } from '@mui/material';

// Sample data types and data
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    joinDate: '2023-01-15',
    status: 'active',
    lastLogin: '2023-06-10 14:30:00',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Editor',
    joinDate: '2023-02-20',
    status: 'active',
    lastLogin: '2023-06-09 10:15:00',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    role: 'Viewer',
    joinDate: '2023-03-10',
    status: 'inactive',
    lastLogin: '2023-05-28 16:45:00',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    role: 'Editor',
    joinDate: '2023-04-05',
    status: 'pending',
    lastLogin: '2023-06-05 09:20:00',
  },
  {
    id: 5,
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    role: 'Viewer',
    joinDate: '2023-05-12',
    status: 'active',
    lastLogin: '2023-06-11 11:10:00',
  },
];

// Column definitions
const columns = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role', sortable: true },
  { 
    id: 'joinDate', 
    label: 'Join Date', 
    sortable: true,
    format: (value: string) => new Date(value).toLocaleDateString()
  },
  { 
    id: 'status', 
    label: 'Status',
    sortable: true,
    renderCell: (user: User) => (
      <Box 
        sx={{
          display: 'inline-block',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: user.status === 'active' ? 'success.light' : 
                  user.status === 'inactive' ? 'grey.300' : 'warning.light',
          color: user.status === 'active' ? 'success.contrastText' : 
                user.status === 'inactive' ? 'text.secondary' : 'warning.contrastText',
          textTransform: 'capitalize',
          fontSize: '0.75rem',
          fontWeight: 'medium'
        }}
      >
        {user.status}
      </Box>
    )
  },
  { 
    id: 'actions', 
    label: 'Actions',
    renderCell: (user: User) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" variant="outlined">Edit</Button>
        <Button 
          size="small" 
          color={user.status === 'active' ? 'error' : 'primary'}
          variant="outlined"
        >
          {user.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
      </Box>
    )
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A flexible and accessible table component with sorting, pagination, and search capabilities.',
      },
    },
  },
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    dense: {
      control: 'boolean',
      description: 'Use dense table styling',
    },
    hoverRow: {
      control: 'boolean',
      description: 'Show hover effect on rows',
    },
    showHeader: {
      control: 'boolean',
      description: 'Show/hide table header',
    },
  },
  args: {
    loading: false,
    dense: false,
    hoverRow: true,
    showHeader: true,
  },
};

export default meta;

type Story = StoryObj<typeof DataTable>;

export const Basic: Story = {
  args: {
    columns,
    data: users,
    rowId: (user) => user.id,
  },
};

export const WithPagination: Story = {
  args: {
    columns: columns.slice(0, 4), // Show fewer columns for pagination example
    data: users,
    rowsPerPage: 3,
    rowId: (user) => user.id,
  },
};

export const WithSearch: Story = {
  args: {
    columns: columns.filter(col => col.id !== 'actions'),
    data: users,
    searchPlaceholder: 'Search users...',
    rowId: (user) => user.id,
  },
};

export const LoadingState: Story = {
  args: {
    columns,
    data: [],
    loading: true,
    loadingMessage: 'Loading user data...',
    rowId: (user) => user.id,
  },
};

export const EmptyState: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'No users found. Try adjusting your search or add a new user.',
    rowId: (user) => user.id,
  },
};

export const Dense: Story = {
  args: {
    columns,
    data: users,
    dense: true,
    rowId: (user) => user.id,
  },
};

export const CustomRowStyling: Story = {
  args: {
    columns: columns.filter(col => col.id !== 'actions'),
    data: users,
    rowSx: (row: User) => ({
      '&:hover': { backgroundColor: 'action.hover' },
      ...(row.status === 'inactive' && {
        opacity: 0.7,
        backgroundColor: 'background.default',
      }),
    }),
    rowId: (user) => user.id,
  },
};

export const WithCustomEmptyState: Story = {
  args: {
    columns,
    data: [],
    emptyComponent: (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 2 }}>📊</Box>
        <Box sx={{ typography: 'h6', mb: 1 }}>No Data Available</Box>
        <Box sx={{ color: 'text.secondary', mb: 2 }}>
          There are no records to display. Try adjusting your filters or add a new record.
        </Box>
        <Button variant="contained">Add New Record</Button>
      </Box>
    ),
    rowId: (user) => user.id,
  },
};
