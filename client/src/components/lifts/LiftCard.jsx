import { Building2, CalendarClock, MapPin, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';
import { LiftStatusBadge } from './LiftStatusBadge';

export function LiftCard({ lift, onEdit, onRemove }) {
  return <article className="lift-card">
    <div className="card-row"><div><span className="eyebrow">{lift.code}</span><h3>{lift.name}</h3></div><LiftStatusBadge status={lift.status} /></div>
    <p><Building2 size={16} /> {lift.building}</p><p><MapPin size={16} /> {lift.address || 'Address not recorded'}</p><p><CalendarClock size={16} /> Next service: {formatDate(lift.nextServiceDate)}</p>
    {lift.warrantyUntil && <p>Warranty until: {formatDate(lift.warrantyUntil)}</p>}
    {lift.assignedCustomer && <p className="lift-customer">Customer: {lift.assignedCustomer.name}</p>}
    {lift.customerStatus?.status && <p className="customer-report">Customer report: <LiftStatusBadge status={lift.customerStatus.status} /></p>}
    {lift.images?.length > 0 && <div className="lift-gallery">{lift.images.slice(-3).map((image) => <img key={image._id || image.data} src={image.data} alt={image.name || `${lift.name} upload`} title={`Uploaded by ${image.uploadedBy?.name || 'customer'}`} />)}</div>}
    {(onEdit || onRemove) && <div className="lift-card-actions">{onEdit && <button className="text-button" onClick={() => onEdit(lift)}>Edit lift</button>}{onRemove && <button className="text-button lift-remove" onClick={() => onRemove(lift)}><Trash2 size={15} />Remove lift</button>}</div>}
  </article>;
}
