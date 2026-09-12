import { MapPin } from 'lucide-react';
export function LiftsMap({ lifts }) { return <section className="map-panel"><div className="map-grid" />{lifts.filter((lift) => lift.location?.latitude).map((lift) => <div className="map-point" key={lift._id}><MapPin size={18} /><span>{lift.code}</span></div>)}<div className="map-empty">{lifts.some((lift) => lift.location?.latitude) ? 'Lift coordinate markers' : 'Add coordinates to lifts to see them on a map.'}</div></section>; }

