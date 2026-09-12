import { useState } from 'react';
import { Clock3 } from 'lucide-react';
import { AttendanceCalendar } from '../../components/attendance/AttendanceCalendar';
import { Loader } from '../../components/common/Loader';
import { clockIn, clockOut, getAttendance } from '../../services/attendanceService';
import { useFetch } from '../../hooks/useFetch';
import { useGeolocation } from '../../hooks/useGeolocation';

export default function MyAttendance() { const records = useFetch(getAttendance, []); const { getLocation } = useGeolocation(); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const clock = async (action) => { setBusy(true); setMessage(''); try { let location; try { location = await getLocation(); } catch { location = undefined; } await action({ location }); setMessage('Attendance updated.'); await records.reload(); } catch (e) { setMessage(e.message); } finally { setBusy(false); } }; const today = records.data.find((record) => new Date(record.workDate).toDateString() === new Date().toDateString()); return <><div className="page-heading"><div><span className="eyebrow">Workday record</span><h1>My attendance</h1><p>Clock in as you begin and clock out when your workday ends.</p></div><div className="clock-actions"><button disabled={busy || Boolean(today?.clockIn)} onClick={() => clock(clockIn)}><Clock3 size={18} /> {busy ? 'Updating...' : 'Clock in'}</button><button className="secondary" disabled={busy || !today?.clockIn || Boolean(today?.clockOut)} onClick={() => clock(clockOut)}>Clock out</button></div></div>{(message || records.error) && <div className="alert error">{message || records.error}</div>}{!today && !records.loading && <div className="alert">No attendance record exists for today. You can clock in now.</div>}{records.loading ? <Loader /> : <AttendanceCalendar records={records.data} />}</>; }

