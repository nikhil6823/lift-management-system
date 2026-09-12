import api from './api';
export const logLocation = (data, photo) => { const body = new globalThis.FormData(); body.append('latitude', data.latitude); body.append('longitude', data.longitude); if (data.accuracy !== undefined) body.append('accuracy', data.accuracy); if (photo) body.append('photo', photo); return api.post('/locations', body).then((r) => r.data); };
export const getLatestLocations = () => api.get('/locations/latest').then((r) => r.data);
export const removeLocation = (id) => api.delete(`/locations/${id}`);
