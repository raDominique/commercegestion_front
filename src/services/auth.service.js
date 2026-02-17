// src/services/auth.service.js

import axiosInstance from './axios.config';
// Inscription utilisateur avec fichiers (multipart/form-data)
export async function registerUser(formData) {
  // formData doit être une instance de FormData
  try {
    const response = await axiosInstance.post('/v1/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    // On peut améliorer la gestion d'erreur selon les besoins
    throw error;
  }
}

import usersData from '../data/user.json';

export function login(username, password) {
  const user = usersData.users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem('user');
}

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!getCurrentUser();
}
