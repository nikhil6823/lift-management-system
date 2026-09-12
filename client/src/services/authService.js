import api from './api';
export const login = (data) => api.post('/auth/login', data).then((response) => response.data);
export const register = (data) => api.post('/auth/register', data).then((response) => response.data);
export const registerCustomer = (data) => api.post('/auth/customer-register', data).then((response) => response.data);
export const verifyEmail = (data) => api.post('/auth/verify-email', data).then((response) => response.data);
export const resendEmailVerification = (data) => api.post('/auth/resend-email-verification', data).then((response) => response.data);
export const verifyLoginCode = (data) => api.post('/auth/verify-login-code', data).then((response) => response.data);
export const getMe = () => api.get('/auth/me').then((response) => response.data);
export const updateProfile = (data) => api.patch('/auth/profile', data).then((response) => response.data);
