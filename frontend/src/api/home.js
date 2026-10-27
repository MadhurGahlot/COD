import client from './client';

export const getHome = (year) =>
  client.get('/home/', { params: { year } });
