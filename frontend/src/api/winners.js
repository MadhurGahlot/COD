import client from './client';

export const getWinners = (year) =>
  client.get('/winners/', { params: { year } });

export const getHallOfFame = (year) =>
  client.get('/winners/hall_of_fame', { params: { year } });

export const createWinner = (formData) =>
  client.post('/winners/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteWinner = (wid) =>
  client.delete(`/winners/${wid}`);
