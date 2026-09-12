export function AttendanceMarker({ record }) {
  return <span className={`dot ${record.status}`} title={record.status} />;
}
