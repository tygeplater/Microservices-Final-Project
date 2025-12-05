// Use relative path - nginx will proxy to backend
const API_BASE_URL = '/api/auth';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

const TOKEN_KEY = 'auth_token';

export const authService = {
  // Store token in localStorage
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Get authorization header
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Register a new user
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  },

  // Login and get token
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const authResponse = await response.json();
    this.setToken(authResponse.access_token);
    return authResponse;
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
      }
      throw new Error('Failed to get user info');
    }

    return response.json();
  },

  // Logout
  logout(): void {
    this.removeToken();
  },
};
