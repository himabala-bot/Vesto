const getApiBaseUrl = () => {
  let base = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').trim();
  // Strip trailing slashes
  base = base.replace(/\/+$/, '');
  // If user provided base domain without /api (e.g., https://vesto-backend.onrender.com), append /api
  if (!base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('vesto_access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('vesto_refresh_token');
  }

  public setTokens(access: string, refresh: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('vesto_access_token', access);
    localStorage.setItem('vesto_refresh_token', refresh);
  }

  public clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('vesto_access_token');
    localStorage.removeItem('vesto_refresh_token');
    localStorage.removeItem('vesto_user');
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized (attempt refresh)
      if (response.status === 401 && this.getRefreshToken() && !endpoint.includes('/auth/')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.getAuthToken()}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      }

      if (response.status === 204) {
        return {} as T;
      }

      let data: any;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || `HTTP ${response.status} Error` };
      }

      if (!response.ok) {
        const errorMsg =
          data?.detail ||
          data?.error ||
          data?.message ||
          (typeof data === 'object' && Object.values(data)[0]) ||
          `Request failed with status ${response.status}`;
        throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }

      return data as T;
    } catch (error: any) {
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refresh = this.getRefreshToken();
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) {
        this.clearTokens();
        return false;
      }

      const data = await res.json();
      if (data.access) {
        localStorage.setItem('vesto_access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('vesto_refresh_token', data.refresh);
        }
        return true;
      }
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // Auth Endpoints
  auth = {
    login: (credentials: { username?: string; email?: string; password: string }) =>
      this.request<{ access: string; refresh: string; user: any }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      this.request<{ access: string; refresh: string; user: any; message: string }>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => this.request<any>('/auth/me/'),
    changePassword: (data: { old_password: string; new_password: string }) =>
      this.request<{ message: string }>('/auth/change-password/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Settings
  settings = {
    get: () => this.request<any>('/settings/'),
    update: (data: any) =>
      this.request<any>('/settings/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  };

  // Categories
  categories = {
    getAll: async (): Promise<any[]> => {
      const res = await this.request<any>('/categories/');
      return Array.isArray(res) ? res : (res?.results || []);
    },
    create: (data: any) =>
      this.request<any>('/categories/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      this.request<any>(`/categories/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<any>(`/categories/${id}/`, {
        method: 'DELETE',
      }),
  };

  // Transactions
  transactions = {
    getAll: async (params?: Record<string, string | number | undefined>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            searchParams.append(key, String(val));
          }
        });
      }
      const query = searchParams.toString();
      const res = await this.request<any>(`/transactions/${query ? `?${query}` : ''}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.results)) return res.results;
      return [];
    },
    create: (data: any) =>
      this.request<any>('/transactions/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      this.request<any>(`/transactions/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<any>(`/transactions/${id}/`, {
        method: 'DELETE',
      }),
  };

  // Budgets
  budgets = {
    getAll: async (month?: string): Promise<any[]> => {
      const query = month ? `?month=${month}` : '';
      const res = await this.request<any>(`/budgets/${query}`);
      return Array.isArray(res) ? res : (res?.results || []);
    },
    create: (data: any) =>
      this.request<any>('/budgets/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      this.request<any>(`/budgets/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<any>(`/budgets/${id}/`, {
        method: 'DELETE',
      }),
    copyPrevious: (targetMonth: string) =>
      this.request<any>('/budgets/copy-previous/', {
        method: 'POST',
        body: JSON.stringify({ target_month: targetMonth }),
      }),
  };

  // Savings Goals
  goals = {
    getAll: async (): Promise<any[]> => {
      const res = await this.request<any>('/goals/');
      return Array.isArray(res) ? res : (res?.results || []);
    },
    create: (data: any) =>
      this.request<any>('/goals/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      this.request<any>(`/goals/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<any>(`/goals/${id}/`, {
        method: 'DELETE',
      }),
    contribute: (id: number, data: { amount: string | number; notes?: string; date?: string; log_transaction?: boolean }) =>
      this.request<any>(`/goals/${id}/contribute/`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Recurring Expenses
  recurring = {
    getAll: async (): Promise<any[]> => {
      const res = await this.request<any>('/recurring/');
      return Array.isArray(res) ? res : (res?.results || []);
    },
    create: (data: any) =>
      this.request<any>('/recurring/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      this.request<any>(`/recurring/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<any>(`/recurring/${id}/`, {
        method: 'DELETE',
      }),
    logPayment: (id: number, dateStr?: string) =>
      this.request<any>(`/recurring/${id}/log_payment/`, {
        method: 'POST',
        body: JSON.stringify({ date: dateStr }),
      }),
  };

  // Analytics
  analytics = {
    getDashboard: (month?: string) => {
      const query = month ? `?month=${month}` : '';
      return this.request<any>(`/analytics/dashboard/${query}`);
    },
    getInsights: (month?: string) => {
      const query = month ? `?month=${month}` : '';
      return this.request<any>(`/analytics/insights/${query}`);
    },
  };
}

export const api = new ApiClient();
