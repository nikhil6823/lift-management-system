import api from './api';
export const getLifts = (params) => api.get('/lifts', { params }).then((r) => r.data);
export const createLift = (data) => api.post('/lifts', data).then((r) => r.data);
export const updateLift = (id, data) => api.patch(`/lifts/${id}`, data).then((r) => r.data);
export const removeLift = (id) => api.delete(`/lifts/${id}`);
export const uploadLiftImage = (id, image) => { const body = new globalThis.FormData(); body.append('image', image); return api.post(`/lifts/${id}/images`, body).then((r) => r.data); };
export const reportLiftStatus = (id, data) => api.patch(`/lifts/${id}/customer-status`, data).then((r) => r.data);
