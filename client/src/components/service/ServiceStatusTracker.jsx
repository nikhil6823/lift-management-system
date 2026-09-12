export function ServiceStatusTracker({ status }) { return <span className={`badge service-${status}`}>{status?.replaceAll('-', ' ')}</span>; }

