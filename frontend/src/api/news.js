import client from './client';

export const getNews = (year) =>
  client.get('/news/', { params: { year } });

export const createNews = (formData) =>
  client.post('/news/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteNews = (nid) =>
  client.delete(`/news/${nid}`);
