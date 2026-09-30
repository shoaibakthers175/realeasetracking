import { apiClient } from './client';
import {
  ApiResponse,
  User,
  University,
  Feature,
  Release,
  BugTicket,
  SanityReport,
  Lead,
  AuditLog,
  NotificationItem,
  DashboardData,
  FeatureMatrixData,
} from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
  forgotPassword: async (email: string, reason?: string) => {
    const res = await apiClient.post<ApiResponse<{ status: string; requestId?: string; email?: string }>>('/auth/forgot-password', { email, reason });
    return res.data;
  },
  checkResetStatus: async (params: { email?: string; requestId?: string }) => {
    const res = await apiClient.get<ApiResponse<{ status: string; requestId: string; email: string; userName: string; token?: string; requestedAt: string; approvedAt?: string; approvedByName?: string; rejectionReason?: string }>>('/auth/password-reset-status', { params });
    return res.data;
  },
  getPasswordResetRequests: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/auth/password-reset-requests');
    return res.data;
  },
  approvePasswordResetRequest: async (id: string) => {
    const res = await apiClient.post<ApiResponse<{ resetReq: any; resetToken: string; resetLink: string }>>(`/auth/password-reset-requests/${id}/approve`);
    return res.data;
  },
  rejectPasswordResetRequest: async (id: string, reason?: string) => {
    const res = await apiClient.post<ApiResponse<any>>(`/auth/password-reset-requests/${id}/reject`, { reason });
    return res.data;
  },
  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/change-password', data);
    return res.data;
  },
};

export const dashboardApi = {
  getDashboardData: async (params?: { range?: string; startDate?: string; endDate?: string; environment?: string }) => {
    const res = await apiClient.get<ApiResponse<DashboardData>>('/dashboard', { params });
    return res.data;
  },
  cleanDemoData: async () => {
    const res = await apiClient.post<ApiResponse<any>>('/dashboard/clean-demo-data');
    return res.data;
  },
  resetDemoData: async () => {
    const res = await apiClient.post<ApiResponse<any>>('/dashboard/reset-demo-data');
    return res.data;
  },
};

export const universitiesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string; environment?: string }) => {
    const res = await apiClient.get<ApiResponse<University[]>>('/universities', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{
      university: University;
      overview: any;
      features: any[];
      releases: Release[];
      bugTickets: BugTicket[];
      sanityReports: SanityReport[];
      leads: Lead[];
    }>>(`/universities/${id}`);
    return res.data;
  },
  create: async (data: Partial<University>) => {
    const res = await apiClient.post<ApiResponse<University>>('/universities', data);
    return res.data;
  },
  update: async (id: string, data: Partial<University>) => {
    const res = await apiClient.patch<ApiResponse<University>>(`/universities/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/universities/${id}`);
    return res.data;
  },
};

export const featuresApi = {
  getAll: async (params?: { search?: string; category?: string; status?: string }) => {
    const res = await apiClient.get<ApiResponse<Feature[]>>('/features', { params });
    return res.data;
  },
  getMatrix: async (params?: { environment?: string }) => {
    const res = await apiClient.get<ApiResponse<FeatureMatrixData>>('/features/matrix', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{
      feature: Feature;
      releases: Release[];
      universityStatus: any[];
      totalLiveUniversities: number;
    }>>(`/features/${id}`);
    return res.data;
  },
  create: async (data: Partial<Feature>) => {
    const res = await apiClient.post<ApiResponse<Feature>>('/features', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Feature>) => {
    const res = await apiClient.patch<ApiResponse<Feature>>(`/features/${id}`, data);
    return res.data;
  },
};

export const releasesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    university?: string;
    feature?: string;
    releaseType?: string;
    environment?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    date?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<Release[]>>('/releases', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ release: Release; timeline: AuditLog[] }>>(`/releases/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<Release>>('/releases', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Release>) => {
    const res = await apiClient.patch<ApiResponse<Release>>(`/releases/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/releases/${id}`);
    return res.data;
  },
};

export const bugsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; priority?: string; status?: string; university?: string }) => {
    const res = await apiClient.get<ApiResponse<BugTicket[]>>('/bugs', { params });
    return res.data;
  },
  create: async (data: Partial<BugTicket>) => {
    const res = await apiClient.post<ApiResponse<BugTicket>>('/bugs', data);
    return res.data;
  },
  update: async (id: string, data: Partial<BugTicket>) => {
    const res = await apiClient.patch<ApiResponse<BugTicket>>(`/bugs/${id}`, data);
    return res.data;
  },
};

export const sanityApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; environment?: string; university?: string }) => {
    const res = await apiClient.get<ApiResponse<SanityReport[]>>('/sanity-reports', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<SanityReport>>(`/sanity-reports/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<SanityReport>>('/sanity-reports', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch<ApiResponse<SanityReport>>(`/sanity-reports/${id}`, data);
    return res.data;
  },
};

export const leadsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; university?: string; source?: string; status?: string; lsqStatus?: string; opportunityStatus?: string; erpStatus?: string }) => {
    const res = await apiClient.get<ApiResponse<Lead[]>>('/leads', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<Lead>>('/leads', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data;
  },
};

export const calendarApi = {
  getEvents: async (params?: { year?: number; month?: number; environment?: string }) => {
    const res = await apiClient.get<ApiResponse<any>>('/calendar', { params });
    return res.data;
  },
  getDayActivities: async (date: string) => {
    const res = await apiClient.get<ApiResponse<{ date: string; totalActivities: number; releases: Release[] }>>(`/calendar/day/${date}`);
    return res.data;
  },
};

export const reportsApi = {
  getReports: async (params?: { type?: string; university?: string; startDate?: string; endDate?: string }) => {
    const res = await apiClient.get<ApiResponse<any>>('/reports', { params });
    return res.data;
  },
};

export const auditApi = {
  getLogs: async (params?: { page?: number; limit?: number; event?: string; entityType?: string; search?: string }) => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs/logs', { params });
    return res.data;
  },
  getNotifications: async () => {
    const res = await apiClient.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>('/audit-logs/notifications');
    return res.data;
  },
  markRead: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/audit-logs/notifications/read');
    return res.data;
  },
};

export const searchApi = {
  globalSearch: async (q: string) => {
    const res = await apiClient.get<ApiResponse<{
      universities: University[];
      features: Feature[];
      releases: Release[];
      bugs: BugTicket[];
      leads: Lead[];
      total: number;
    }>>('/search', { params: { q } });
    return res.data;
  },
};

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<User>>('/users', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },
};

export const attachmentApi = {
  upload: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse<{ id: string; filename: string; originalName: string; url: string; size: number; mimeType: string }>>(
      '/attachments/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },
};
