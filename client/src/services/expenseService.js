import api from './api';
export const getExpenses = (params) => api.get('/expenses', { params }).then((r) => r.data);
export const createExpense = (data) => api.post('/expenses', data).then((r) => r.data);
export const updateExpense = (id, data) => api.patch(`/expenses/${id}`, data).then((r) => r.data);

