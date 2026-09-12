export function Loader({ label = 'Loading' }) {
  return <div className="loader" role="status"><span /> {label}…</div>;
}

