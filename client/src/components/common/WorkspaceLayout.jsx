import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ChatWindow } from '../chat/ChatWindow';

export function WorkspaceLayout({ children }) {
  const [open, setOpen] = useState(false);
  return <div className="app-shell"><Navbar menuOpen={open} onMenu={() => setOpen((value) => !value)} /><Sidebar open={open} close={() => setOpen(false)} /><main className="main-content">{children || <Outlet />}</main><ChatWindow /></div>;
}
