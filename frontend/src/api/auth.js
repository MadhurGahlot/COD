import client from './client';

export const login = (username, password) =>
  client.post('/auth/login', { username, password });

export const register = (username, email, password) =>
  client.post('/auth/register', { username, email, password });

export const registerPlayerProfile = (formData) =>
  client.post('/players/register_profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMyProfile = (year) =>
  client.get('/players/me/profile', { params: { year } });
