import { AttendanceCalendar } from '../../components/attendance/AttendanceCalendar';
import { Loader } from '../../components/common/Loader';
import { getAttendance } from '../../services/attendanceService';
import { useFetch } from '../../hooks/useFetch';

export default function AttendanceOverview() { const { data, loading, error } = useFetch(getAttendance, []); return <><div className="page-heading"><div><span className="eyebrow">Workforce presence</span><h1>Attendance overview</h1><p>Recent field-team clock-ins and clock-outs.</p></div></div>{error && <div className="alert error">{error}</div>}{loading ? <Loader /> : <AttendanceCalendar records={data} />}</>; }

