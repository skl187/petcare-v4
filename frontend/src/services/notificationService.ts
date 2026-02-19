import { API_ENDPOINTS } from '../constants/api';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp?: string;
}

const getAuthHeaders = (): HeadersInit => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface NotificationTemplate {
  id?: string;
  template_key?: string;
  subject?: string;
  body?: string;
  body_html?: string;
  locale?: string;
}

export const previewTemplate = async (
  template_key: string,
  payload: Record<string, any> = {},
  locale = 'en'
): Promise<{ template: NotificationTemplate; rendered: { subject: string; body: string; body_html: string } }> => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.PREVIEW, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ template_key, payload, locale }),
  });

  if (!response.ok) {
    throw new Error(`Preview failed: ${response.statusText}`);
  }

  const result: ApiResponse<{ template: NotificationTemplate; rendered: { subject: string; body: string; body_html: string } }> = await response.json();
  return result.data;
};

export const createNotification = async (data: {
  template_key: string;
  channel: 'email' | 'sms' | 'push';
  user_id?: string | null;
  notification_key?: string | null;
  target?: Record<string, any> | null;
  payload?: Record<string, any> | null;
  scheduled_at?: string | null;
  locale?: string | null;
}) => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Create notification failed: ${response.status} ${txt}`);
  }

  const result: ApiResponse<any> = await response.json();
  return result.data;
};

// ---- Template CRUD (stored in app_settings.namespace = 'notification_templates') ----
export const listTemplates = async (page = 1, limit = 100) => {
  const url = `${API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.BASE}?page=${page}&limit=${limit}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Failed to list templates: ${response.statusText}`);
  const result: ApiResponse<{ data: any[]; page: number; limit: number }> = await response.json();
  return result.data;
};

export const getTemplate = async (key: string) => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.DETAIL(key), { method: 'GET', headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Failed to get template: ${response.statusText}`);
  const result: ApiResponse<any> = await response.json();
  return result.data;
};

export const createTemplate = async (payload: { template_key: string; name?: string; channel: string; description?: string; default_subject?: string; default_body?: string; default_body_html?: string; locale?: string; is_active?: boolean }) => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Create template failed: ${response.status} ${txt}`);
  }
  const result: ApiResponse<any> = await response.json();
  return result.data;
};

export const updateTemplate = async (key: string, payload: Partial<{ name: string; description: string; default_subject: string; default_body: string; default_body_html: string; locale: string; is_active: boolean }>) => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.DETAIL(key), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Update template failed: ${response.status} ${txt}`);
  }
  const result: ApiResponse<any> = await response.json();
  return result.data;
};

export const deleteTemplate = async (key: string) => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.DETAIL(key), { method: 'DELETE', headers: getAuthHeaders() });
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Delete template failed: ${response.status} ${txt}`);
  }
  const result: ApiResponse<any> = await response.json();
  return result.data;
};

// ---- Notification List CRUD ----
export const listPendingNotifications = async () => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.PENDING, { method: 'GET', headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Failed to list pending notifications: ${response.statusText}`);
  const result: ApiResponse<any[]> = await response.json();
  return result.data || [];
};

export const getNotificationDetail = async (id: string) => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id), { method: 'GET', headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Failed to get notification: ${response.statusText}`);
  const result: ApiResponse<any> = await response.json();
  return result.data;
};

export const resendNotification = async (id: string) => {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.RESEND(id), {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Resend notification failed: ${response.status} ${txt}`);
  }
  const result: ApiResponse<any> = await response.json();
  return result.data;
};
