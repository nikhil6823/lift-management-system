import { Navigate, Route, Routes } from 'react-router-dom';
import { WorkspaceLayout } from '../components/common/WorkspaceLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import AdminLogin from '../pages/auth/AdminLogin';
import EmployeeLogin from '../pages/auth/EmployeeLogin';
import CustomerLogin from '../pages/auth/CustomerLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageLifts from '../pages/admin/ManageLifts';
import ManageEmployees from '../pages/admin/ManageEmployees';
import ServiceRequests from '../pages/admin/ServiceRequests';
import ExpenseOverview from '../pages/admin/ExpenseOverview';
import SalaryManagement from '../pages/admin/SalaryManagement';
import AttendanceOverview from '../pages/admin/AttendanceOverview';
import LiveTrackingDashboard from '../pages/admin/LiveTrackingDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import MyAttendance from '../pages/employee/MyAttendance';
import MyServiceJobs from '../pages/employee/MyServiceJobs';
import MyRoute from '../pages/employee/MyRoute';
import SubmitExpense from '../pages/employee/SubmitExpense';
import MySalarySlips from '../pages/employee/MySalarySlips';
import Profile from '../pages/Profile';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerRequests from '../pages/customer/CustomerRequests';
import CustomerBilling from '../pages/customer/CustomerBilling';

export function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<AdminLogin />} />
    <Route path="/employee/login" element={<EmployeeLogin />} />
    <Route path="/customer/login" element={<CustomerLogin />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<WorkspaceLayout />}>
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route element={<WorkspaceLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/lifts" element={<ManageLifts />} />
        <Route path="/admin/employees" element={<ManageEmployees />} />
        <Route path="/admin/service-requests" element={<ServiceRequests />} />
        <Route path="/admin/expenses" element={<ExpenseOverview />} />
        <Route path="/admin/salary" element={<SalaryManagement />} />
        <Route path="/admin/attendance" element={<AttendanceOverview />} />
        <Route path="/admin/tracking" element={<LiveTrackingDashboard />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute roles={['employee']} />}>
      <Route element={<WorkspaceLayout />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/attendance" element={<MyAttendance />} />
        <Route path="/employee/jobs" element={<MyServiceJobs />} />
        <Route path="/employee/route" element={<MyRoute />} />
        <Route path="/employee/expenses" element={<SubmitExpense />} />
        <Route path="/employee/salary" element={<MySalarySlips />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute roles={['customer']} />}>
      <Route element={<WorkspaceLayout />}>
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/requests" element={<CustomerRequests />} />
        <Route path="/customer/billing" element={<CustomerBilling />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>;
}
