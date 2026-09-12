import api from './api';

export const getInvoices = () => api.get('/invoices').then((response) => response.data);
export const recordOnlinePayment = (id, data) => api.post(`/invoices/${id}/payments`, data).then((response) => response.data);
export const downloadInvoiceReceipt = (id) => api.get(`/invoices/${id}/receipt`, { responseType: 'blob' }).then((response) => response.data);
