import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('liftflow_token');
    if (!user || !token) return undefined;
    const connection = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { auth: { token } });
    setSocket(connection);
    return () => { connection.disconnect(); setSocket(null); };
  }, [user]);
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

