import api from './api';
export const getSalarySlips = (params) => api.get('/salary-slips', { params }).then((r) => r.data);
export const createSalarySlip = (data) => api.post('/salary-slips', data).then((r) => r.data);
export const updateSalarySlip = (id, data) => api.patch(`/salary-slips/${id}`, data).then((r) => r.data);

