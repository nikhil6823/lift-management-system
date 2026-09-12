import api from './api';

export const getChatContacts = () => api.get('/chat/contacts').then((response) => response.data);
export const getChatMessages = (contactId) => api.get('/chat', { params: contactId ? { with: contactId } : undefined }).then((response) => response.data);
export const sendChatMessage = (data) => api.post('/chat', data).then((response) => response.data);
