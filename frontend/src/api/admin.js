import client from './client';

export const getAuditLogs = () =>
  client.get('/audit/logs');

// Home admin
export const updateHomeSettings = (formData) =>
  client.post('/home/settings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const addFeaturedPlayer = (formData) =>
  client.post('/home/featured_player', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteFeaturedPlayer = (fid) =>
  client.delete(`/home/featured_player/${fid}`);

export const addHighlight = (formData) =>
  client.post('/home/highlight', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteHighlight = (hid) =>
  client.delete(`/home/highlight/${hid}`);

export const addHeroImage = (formData) =>
  client.post('/home/hero_image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteHeroImage = (hid) =>
  client.delete(`/home/hero_image/${hid}`);
