import { formatDate, formatDateTime } from "../../utils/dateHelpers";
import { Table } from "../common/Table";
export function AttendanceCalendar({ records }) {
  return (
    <Table
      rows={records}
      empty="No attendance records in this period."
      columns={[
        { label: "Date", render: (r) => formatDate(r.workDate) },
        { label: "Employee", render: (r) => r.employee?.user?.name || "You" },
        {
          label: "Status",
          render: (r) => (
            <span className={`badge ${r.status}`}>{r.status}</span>
          ),
        },
        { label: "Clock in", render: (r) => formatDateTime(r.clockIn) },
        { label: "Clock out", render: (r) => formatDateTime(r.clockOut) },
      ]}
    />
  );
}
