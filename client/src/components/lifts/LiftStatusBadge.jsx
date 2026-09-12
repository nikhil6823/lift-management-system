export function LiftStatusBadge({ status }) {
  return <span className={`badge lift-${status}`}>{status?.replaceAll('-', ' ')}</span>;
}

