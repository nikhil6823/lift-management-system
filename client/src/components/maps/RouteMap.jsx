import { Navigation } from 'lucide-react';
export function RouteMap({ jobs }) { return <section className="route-map"><Navigation size={26} /><div><strong>{jobs.length} job{jobs.length === 1 ? '' : 's'} on your route</strong><p>Use the job addresses to plan the safest efficient route. Live turn-by-turn navigation can be connected to your preferred map provider.</p></div></section>; }
