import { Bell, ChevronDown, LogOut, Menu, Moon, Sun, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar({ onMenu, menuOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return <header className="navbar">
    <button className="icon-button mobile-menu" onClick={onMenu} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    <div className="navbar-title"><span>PV Tech Elevators</span></div>
    <div className="navbar-actions">
      <button className="icon-button" onClick={() => setDarkMode((enabled) => !enabled)} title={darkMode ? 'Use light mode' : 'Use dark mode'} aria-label={darkMode ? 'Use light mode' : 'Use dark mode'} aria-pressed={darkMode}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>
      <div className="notification-menu"><button className="icon-button" onClick={() => setNotificationsOpen((open) => !open)} aria-label="Notifications" aria-expanded={notificationsOpen} title="View notifications"><Bell size={19} /></button>{notificationsOpen && <div className="notification-dropdown" role="status"><strong>Notifications</strong><p>You are all caught up.</p></div>}</div>
      <div className="profile-menu"><button className="profile-trigger" onClick={() => setProfileOpen((open) => !open)} title="Open profile menu" aria-label="Open profile menu" aria-expanded={profileOpen}><span className="profile-initial">{user?.name?.[0]?.toUpperCase()}</span><span className="profile-copy"><strong>{user?.name}</strong><small>{user?.role}</small></span><ChevronDown size={15} /></button>{profileOpen && <div className="profile-dropdown"><button className="profile-menu-item" onClick={() => { navigate('/profile'); setProfileOpen(false); }}><UserRound size={16} />View profile</button><button className="profile-menu-item" onClick={logout}><LogOut size={16} />Sign out</button></div>}</div>
    </div>
  </header>;
}
