import api from './api';
export const getServiceRequests = (params) => api.get('/service-requests', { params }).then((r) => r.data);
export const createServiceRequest = (data) => api.post('/service-requests', data).then((r) => r.data);
export const updateServiceRequest = (id, data) => api.patch(`/service-requests/${id}`, data).then((r) => r.data);
export const uploadServiceMedia = (id, files) => { const body = new globalThis.FormData(); files.forEach((file) => body.append('media', file)); return api.post(`/service-requests/${id}/media`, body).then((r) => r.data); };
export const getServiceTracking = (id) => api.get(`/service-requests/${id}/tracking`).then((r) => r.data);
export const submitServiceReview = (id, data) => api.patch(`/service-requests/${id}/review`, data).then((r) => r.data);
export const downloadServiceReport = (id) => api.get(`/service-requests/${id}/report`, { responseType: 'blob' }).then((r) => r.data);
