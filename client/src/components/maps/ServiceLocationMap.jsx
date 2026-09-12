import { MapPin } from 'lucide-react';
export function ServiceLocationMap({ request }) { return <div className="service-location"><MapPin size={18} /> {request?.lift?.address || request?.lift?.building || 'No service location recorded'}</div>; }

