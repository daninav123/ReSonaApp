# Data Components

This directory contains reusable data display components for the application.

## Components

### DataTable

A flexible and accessible table component with sorting, pagination, and search capabilities.

#### Features

- **Sorting**: Single column sorting with customizable sort handlers
- **Pagination**: Built-in pagination with customizable page sizes
- **Search**: Integrated search functionality
- **Accessibility**: Full keyboard navigation and ARIA support
- **Customization**: Custom cell rendering and styling
- **Responsive**: Adapts to different screen sizes
- **TypeScript Support**: Fully typed with TypeScript
- **Loading States**: Built-in loading and empty states

#### Usage

```tsx
import { DataTable } from './data';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role', sortable: true },
];

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

function UserList() {
  return (
    <DataTable
      columns={columns}
      data={users}
      onRowClick={(user) => console.log('Selected:', user)}
      rowId={(user) => user.id}
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | Column[] | [] | Array of column definitions |
| data | T[] | [] | Array of data objects |
| loading | boolean | false | Show loading state |
| onRowClick | (row: T) => void | - | Callback when a row is clicked |
| onSort | (field: keyof T, order: 'asc' | 'desc') => void | - | Callback when sorting changes |
| page | number | 0 | Current page (0-based) |
| rowsPerPage | number | 10 | Number of rows per page |
| rowsPerPageOptions | number[] | [5, 10, 25] | Available rows per page options |
| totalRows | number | data.length | Total number of rows for server-side pagination |
| searchPlaceholder | string | 'Search...' | Placeholder text for search input |
| emptyMessage | string | 'No data available' | Message to show when data is empty |
| dense | boolean | false | Use dense table styling |
| elevation | number | 0 | Elevation level of the paper component |

### Column Definition

Each column can have the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| id | string | - | Unique identifier for the column |
| label | string | - | Column header text |
| minWidth | number | - | Minimum width of the column |
| align | 'left' | 'right' | 'center' | 'left' | Text alignment |
| format | (value: any, row: T) => React.ReactNode | - | Function to format cell content |
| sortable | boolean | false | Whether the column is sortable |
| renderCell | (row: T) => React.ReactNode | - | Custom cell renderer |

## Best Practices

1. **Server-side Pagination**: For large datasets, use server-side pagination by providing `totalRows` and handling `onPageChange`.
2. **Custom Rendering**: Use `renderCell` for complex cell content.
3. **Accessibility**: Ensure all interactive elements are keyboard navigable.
4. **Performance**: Use `rowId` prop to help with efficient row updates.
5. **Responsive Design**: Test table behavior on different screen sizes.

## Future Improvements

- [ ] Add column resizing
- [ ] Add column reordering
- [ ] Add row selection
- [ ] Add expandable rows
- [ ] Add inline editing
- [ ] Add column filtering
- [ ] Add virtualization for large datasets
