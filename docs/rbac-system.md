# Documentación del Sistema RBAC en ReSonaApp

## Introducción

Esta documentación describe el sistema de Control de Acceso Basado en Roles (RBAC) implementado en ReSonaApp. El sistema RBAC permite una gestión granular de permisos y roles para controlar el acceso a diferentes funcionalidades de la aplicación.

## Arquitectura

El sistema RBAC está dividido en dos partes principales:

### Backend

- **Modelos**: Definición de las entidades principales `Permission` y `Role`
- **Controladores**: Manejo de la lógica de negocio para permisos y roles
- **Middleware**: Control de acceso mediante `permissionGuard` y `roleGuard`
- **Rutas API**: Endpoints RESTful para gestionar permisos y roles

### Frontend

- **Redux Slices**: Estado y acciones para permisos y roles
- **Componentes React**: Interfaces de usuario para gestión de roles y permisos
- **Hooks personalizados**: Funciones reutilizables para manejo de permisos

## Modelos de Datos

### Permiso (`Permission`)

```typescript
interface IPermission {
  _id: string;
  name: string; // Formato: "recurso:acción", ej. "user:read"
  resource: string; // Entidad sobre la que aplica el permiso, ej. "user"
  action: string; // Acción permitida, ej. "read", "write", "delete"
  description: string; // Descripción legible del permiso
}
```

### Rol (`Role`)

```typescript
interface IRole {
  _id: string;
  name: string; // Nombre único del rol
  description: string; // Descripción del rol
  permissions: string[]; // Array de IDs de permisos
  isSystemRole: boolean; // Indica si es un rol predefinido del sistema
}
```

### Usuario (`User`)

El modelo de usuario existente se ha extendido para trabajar con el sistema RBAC:

```typescript
interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  roles: string[]; // Array de nombres de roles (anteriormente era un string)
  // otros campos existentes...
}
```

## API Backend

### Endpoints de Permisos

| Método | Ruta                      | Descripción                     | Permisos requeridos |
|--------|-----------------------------|----------------------------------|---------------------|
| GET    | /api/permissions            | Listar todos los permisos        | permission:read     |
| GET    | /api/permissions/:id        | Obtener un permiso específico    | permission:read     |
| POST   | /api/permissions            | Crear un nuevo permiso           | permission:write    |
| PUT    | /api/permissions/:id        | Actualizar un permiso existente  | permission:write    |
| DELETE | /api/permissions/:id        | Eliminar un permiso              | permission:write    |

### Endpoints de Roles

| Método | Ruta                 | Descripción                  | Permisos requeridos |
|--------|----------------------|------------------------------|---------------------|
| GET    | /api/roles           | Listar todos los roles       | role:read           |
| GET    | /api/roles/:id       | Obtener un rol específico    | role:read           |
| POST   | /api/roles           | Crear un nuevo rol           | role:write          |
| PUT    | /api/roles/:id       | Actualizar un rol existente  | role:write          |
| DELETE | /api/roles/:id       | Eliminar un rol              | role:write          |

## Middleware de Control de Acceso

### `permissionGuard`

Este middleware controla el acceso a rutas específicas basado en permisos:

```typescript
export const permissionGuard = (requiredPermission: string) => {
  return async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      // Verifica si el usuario tiene el permiso requerido directamente o a través de sus roles
      // ...
    } catch (error) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
  };
};
```

### `roleGuard`

Este middleware controla el acceso a rutas específicas basado en roles:

```typescript
export const roleGuard = (requiredRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      // Verifica si el usuario tiene alguno de los roles requeridos
      // ...
    } catch (error) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
  };
};
```

## Componentes Frontend

### Gestión de Roles

- **RolesList**: Componente para listar, buscar, editar y eliminar roles
- **RoleForm**: Formulario para crear y editar roles, con selección de permisos

### Gestión de Permisos

- **PermissionsList**: Componente para listar, buscar, editar y eliminar permisos
- **PermissionForm**: Formulario para crear y editar permisos

### Selección de Roles para Usuarios

- **UserRoleSelector**: Selector múltiple de roles para asignar a usuarios

### Página de Administración RBAC

- **RbacAdminPage**: Página con pestañas para gestionar roles y permisos

## Redux

### Slice de Permisos

```typescript
// permissionSlice.ts
// Maneja el estado y acciones relacionadas con permisos
// Incluye thunks para operaciones asíncronas (fetch, create, update, delete)
```

### Slice de Roles

```typescript
// roleSlice.ts
// Maneja el estado y acciones relacionadas con roles
// Incluye thunks para operaciones asíncronas (fetch, create, update, delete)
```

## Flujo de Autenticación y Autorización

1. **Login**: El usuario se autentica con email/password
2. **JWT**: El servidor emite un token con información del usuario, incluyendo sus roles
3. **Solicitudes Autenticadas**: Las solicitudes incluyen el token JWT en el encabezado
4. **Verificación de Acceso**:
   - Backend: Middleware verifica permisos/roles para cada ruta protegida
   - Frontend: Los componentes se muestran/ocultan según permisos del usuario

## Mejores Prácticas y Consideraciones

### Seguridad

- Los roles y permisos del sistema no deben modificarse directamente
- Las operaciones críticas requieren múltiples permisos
- La asignación de roles debe ser restringida a usuarios administradores

### Rendimiento

- Utilizar caché para roles y permisos cuando sea posible
- Implementar paginación para listas grandes de permisos/roles

### Extensibilidad

- Para añadir un nuevo tipo de permiso:
  1. Crear el permiso en la interfaz de administración
  2. Asignarlo a los roles correspondientes
  3. Usar el middleware `permissionGuard` en las rutas relevantes

## Ejemplos de Uso

### Proteger una ruta en el backend

```typescript
// Proteger una ruta que requiere el permiso 'budget:write'
router.post('/budgets', 
  authenticate, 
  permissionGuard('budget:write'), 
  budgetController.createBudget
);
```

### Renderizado condicional en el frontend

```tsx
// Mostrar un botón solo si el usuario tiene el permiso necesario
const userPermissions = useSelector(selectUserPermissions);

return (
  <div>
    {userPermissions.includes('budget:write') && (
      <Button onClick={handleCreateBudget}>Crear Presupuesto</Button>
    )}
  </div>
);
```

## Solución de Problemas

### Acceso Denegado Inesperado

1. Verificar que el usuario tiene los roles correctos asignados
2. Verificar que los roles tienen los permisos necesarios
3. Revisar los logs del servidor para errores de autenticación/autorización

### Permisos No Aplicados

1. Verificar que el middleware de autorización está configurado correctamente
2. Comprobar que los nombres de permisos son exactamente los mismos en todo el sistema
3. Revisar el token JWT para confirmar que contiene la información correcta

## Conclusión

El sistema RBAC proporciona una capa de seguridad robusta y flexible para ReSonaApp. Permite una gestión granular de permisos, adaptándose a diferentes necesidades de negocio y roles de usuario.
