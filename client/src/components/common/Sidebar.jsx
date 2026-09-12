import { Activity, Banknote, CalendarDays, ClipboardList, Map, ReceiptText, Users, Wrench } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const adminLinks = [
  ['Overview', '/admin', Activity], ['Lifts', '/admin/lifts', Wrench], ['Employees', '/admin/employees', Users], ['Service requests', '/admin/service-requests', ClipboardList], ['Attendance', '/admin/attendance', CalendarDays], ['Expenses', '/admin/expenses', ReceiptText], ['Salary', '/admin/salary', Banknote], ['Live tracking', '/admin/tracking', Map],
];
const employeeLinks = [
  ['My workspace', '/employee', Activity], ['Attendance', '/employee/attendance', CalendarDays], ['Service jobs', '/employee/jobs', ClipboardList], ['My route', '/employee/route', Map], ['Submit expense', '/employee/expenses', ReceiptText], ['Salary slips', '/employee/salary', Banknote],
];
const customerLinks = [
  ['My lifts', '/customer', Wrench], ['Requests', '/customer/requests', ClipboardList], ['Billing', '/customer/billing', ReceiptText],
];

export function Sidebar({ open, close }) {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'customer' ? customerLinks : employeeLinks;
  return <aside className={`sidebar ${open ? 'is-open' : ''}`}>
    <nav>{links.map(([label, to, Icon]) => <NavLink key={to} end={to === '/admin' || to === '/employee' || to === '/customer'} to={to} onClick={close}><Icon size={18} />{label}</NavLink>)}</nav>
    <p className="sidebar-foot">Operational clarity,<br />floor by floor.</p>
  </aside>;
}
