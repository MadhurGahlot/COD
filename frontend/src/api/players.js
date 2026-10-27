import client from './client';

export const getPlayers = (year) =>
  client.get('/players/', { params: { year } });

export const getPlayer = (playerId, year) =>
  client.get(`/players/${playerId}`, { params: { year } });

export const getLeaderboard = (year) =>
  client.get('/players/leaderboard', { params: { year } });

export const getPlayerStats = (playerId) =>
  client.get(`/players/stats/${playerId}`);

export const getComparePlayers = () =>
  client.get('/players/compare');

export const getCompareData = (p1, p2) =>
  client.get('/players/compare/data', { params: { p1, p2 } });

// Admin
export const createPlayer = (formData) =>
  client.post('/players/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updatePlayer = (playerId, formData) =>
  client.put(`/players/admin/${playerId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePlayer = (playerId) =>
  client.delete(`/players/admin/${playerId}`);

export const setMVP = (playerId, year) =>
  client.put(`/players/admin/${playerId}/set_mvp`, null, { params: { year } });

export const assignPlayer = (playerId, teamId) => {
  const formData = new FormData();
  formData.append('player_id', playerId);
  formData.append('team_id', teamId);
  return client.post('/players/admin/assign', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
