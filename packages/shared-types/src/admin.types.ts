// Admin User Types
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: number;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy?: number;
}

export interface AdminSession {
  id: string;
  adminId: number;
  tokenHash: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  timestamp: Date;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  admin?: {
    id: number;
    email: string;
    role: AdminRole;
  };
  message?: string;
}
// Admin User Types
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: number;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy?: number;
}

export interface AdminSession {
  id: string;
  adminId: number;
  tokenHash: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  timestamp: Date;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  admin?: {
    id: number;
    email: string;
    role: AdminRole;
  };
  message?: string;
}
