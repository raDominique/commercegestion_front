// src/services/auth.service.js

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
