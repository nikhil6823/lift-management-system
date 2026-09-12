import api from './api';
export const getAttendance = (params) => api.get('/attendance', { params }).then((r) => r.data);
export const clockIn = (data) => api.post('/attendance/clock-in', data).then((r) => r.data);
export const clockOut = (data) => api.post('/attendance/clock-out', data).then((r) => r.data);

