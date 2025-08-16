// Frontend auth service for making API calls to Next.js API routes
const API_BASE = '/api';

export interface RegisterUserData {
  email: string;
  password: string;
  display_name: string;
  role?: 'admin' | 'user';
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Simple token management (in production, use proper JWT)
const createToken = (userId: number): string => {
  const tokenData = { userId, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
};

const getAuthHeaders = (): HeadersInit => {
  const user = localStorage.getItem('careerCompassUser');
  if (user) {
    const userData = JSON.parse(user);
    const token = createToken(userData.id);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
};

export const registerUser = async (userData: RegisterUserData): Promise<{ message: string; user: User }> => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

export const loginUser = async (userData: LoginUserData): Promise<{ message: string; user: User }> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};

export const logoutUser = async (): Promise<void> => {
  // Clear local storage
  localStorage.removeItem('careerCompassUser');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get current user');
  }

  return response.json();
};
