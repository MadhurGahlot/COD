import client from './client';

export const getTeams = (year) =>
  client.get('/teams/', { params: { year } });

export const getTeam = (teamId, year) =>
  client.get(`/teams/${teamId}`, { params: { year } });

// Admin
export const createTeam = (data) =>
  client.post('/teams/admin/teams', data);

export const updateTeam = (teamId, data) =>
  client.put(`/teams/admin/teams/${teamId}`, data);

export const deleteTeam = (teamId) =>
  client.delete(`/teams/admin/teams/${teamId}`);
