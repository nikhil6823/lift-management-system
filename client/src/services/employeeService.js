import api from './api';
export const getEmployees = () => api.get('/employees').then((r) => r.data);
export const createEmployee = (data) => api.post('/employees', data).then((r) => r.data);
export const updateEmployee = (id, data) => api.patch(`/employees/${id}`, data).then((r) => r.data);
export const removeEmployee = (id) => api.delete(`/employees/${id}`).then((r) => r.data);

