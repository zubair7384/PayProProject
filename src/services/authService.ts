import axios from "axios";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

const API_BASE_URL = "http://localhost:8000/api/auth";

const signin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_BASE_URL}/signin`, credentials, {
    withCredentials: true, // ✅ Required for cookies/auth headers
  });

  if (response.data.success) {
    // Store token and user info
    localStorage.setItem("token", response.data.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.data.user));
  }

  return response.data;
};

const signout = async (): Promise<void> => {
  try {
    // Call logout API
    await axios.post(`${API_BASE_URL}/logout`, {}, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with local cleanup even if API fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const verifyToken = async (): Promise<{
  success: boolean;
  data: { user: User };
}> => {
  const response = await axios.post(
    `${API_BASE_URL}/verify-token`,
    {},
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

const getProfile = async (): Promise<{ success: boolean; data: User }> => {
  const response = await axios.get(`${API_BASE_URL}/me`, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

const authService = {
  signin,
  signout,
  isAuthenticated,
  getCurrentUser,
  getToken,
  verifyToken,
  getProfile,
};

export default authService;
