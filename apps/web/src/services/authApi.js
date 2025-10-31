// Auth API service for all authentication endpoints

const API_BASE = '/api/auth';

/**
 * Start signup process - sends verification code to email
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean}>}
 */
export const startSignup = async (name, email) => {
  const response = await fetch(`${API_BASE}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ name, email }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to start signup');
  }

  return data;
};

/**
 * Verify email verification code
 * @param {string} email - User's email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise<{success: boolean}>}
 */
export const verifyCode = async (email, code) => {
  const response = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, code }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Verification failed');
  }

  return data;
};

/**
 * Complete signup by setting password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user: object, token: string}>}
 */
export const completeSignup = async (email, password) => {
  const response = await fetch(`${API_BASE}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }

  return data;
};

/**
 * Login with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user: object}>}
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
};

/**
 * Logout current user
 * @returns {Promise<{message: string}>}
 */
export const logout = async () => {
  const response = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Logout failed');
  }

  return data;
};

/**
 * Get current authenticated user
 * @param {string} token - JWT token
 * @returns {Promise<{user: object}>}
 */
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get user');
  }

  return data;
};

/**
 * Initiate Google OAuth login
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE}/google`;
};

/**
 * Initiate Facebook OAuth login
 */
export const loginWithFacebook = () => {
  window.location.href = `${API_BASE}/facebook`;
};
