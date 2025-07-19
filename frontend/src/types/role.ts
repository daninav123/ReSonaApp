export interface IPermission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface IRole {
  _id: string;
  name: string;
  description: string;
  permissions: string[]; // Array de nombres de permisos
  isSystemRole: boolean;
}

export enum Resource {
  USERS = 'USERS',
  CLIENTS = 'CLIENTS',
  PROVIDERS = 'PROVIDERS',
  MATERIALS = 'MATERIALS',
  BUDGETS = 'BUDGETS',
  TASKS = 'TASKS',
  EVENTS = 'EVENTS',
  SETTINGS = 'SETTINGS',
  AUDIT = 'AUDIT',
  NOTIFICATIONS = 'NOTIFICATIONS',
  DASHBOARD = 'DASHBOARD',
  INVOICES = 'INVOICES',
  QUOTES = 'QUOTES',
  CALENDAR = 'CALENDAR'
}

export enum Action {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ADMIN = 'ADMIN'
}
