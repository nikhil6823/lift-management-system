import { MapPin, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { ServiceRequestCard } from '../../components/service/ServiceRequestCard';
import { ServiceRequestForm } from '../../components/service/ServiceRequestForm';
import { Loader } from '../../components/common/Loader';
import { getLifts } from '../../services/liftService';
import { createServiceRequest, downloadServiceReport, getServiceRequests, getServiceTracking, submitServiceReview, uploadServiceMedia } from '../../services/serviceRequestService';
import { useFetch } from '../../hooks/useFetch';

function saveFile(blob, name) { const url = globalThis.URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); globalThis.URL.revokeObjectURL(url); }

export default function CustomerRequests() {
  const lifts = useFetch(getLifts, []);
  const requests = useFetch(getServiceRequests, []);
  const [creating, setCreating] = useState(false);
  const [tracking, setTracking] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [notice, setNotice] = useState('');
  const save = async (data, media) => { try { const request = await createServiceRequest(data); if (media.length) await uploadServiceMedia(request._id, media); setCreating(false); setNotice(data.requestType === 'emergency' ? 'Emergency breakdown request sent to the support team.' : 'Your request is with the service team.'); requests.reload(); } catch (reason) { setNotice(reason.message); } };
  const track = async (request) => { try { setTracking(await getServiceTracking(request._id)); } catch (reason) { setNotice(reason.message); } };
  const download = async (request) => { try { saveFile(await downloadServiceReport(request._id), `${request.ticketNumber}-service-report.txt`); } catch (reason) { setNotice(reason.message); } };
  const review = async (event) => { event.preventDefault(); try { await submitServiceReview(reviewing._id, { rating, feedback }); setReviewing(null); setNotice('Thank you for your feedback.'); requests.reload(); } catch (reason) { setNotice(reason.message); } };
  return <><div className="page-heading action-heading"><div><span className="eyebrow">Support desk</span><h1>Service, emergency & lift requests</h1><p>Request repairs, emergency assistance, maintenance rescheduling, a new lift, or general support.</p></div><button onClick={() => setCreating(true)}><Plus size={18} /> New request</button></div>{notice && <div className={notice.includes('error') ? 'alert error' : 'alert'}>{notice}</div>}{creating && <section className="form-card"><h2>New customer request</h2><ServiceRequestForm customer lifts={lifts.data} onSave={save} onCancel={() => setCreating(false)} /></section>}{tracking && <section className="form-card tracking-card"><div className="section-title"><h2>Technician arrival</h2><button className="text-button" onClick={() => setTracking(null)}>Close</button></div><p><strong>{tracking.request.assignedTechnician?.user?.name || 'Technician'}</strong> is {tracking.request.technicianArrivalStatus?.replaceAll('-', ' ') || 'not assigned'}.</p><p>Arrival ETA: {tracking.request.technicianArrivalEta ? new Date(tracking.request.technicianArrivalEta).toLocaleString() : 'Not provided'} · Expected completion: {tracking.request.estimatedCompletion ? new Date(tracking.request.estimatedCompletion).toLocaleString() : 'Not provided'}</p>{tracking.location ? <><p><MapPin size={16} /> Latest update: {new Date(tracking.location.recordedAt).toLocaleString()}</p><a className="button-link" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${tracking.location.latitude}&mlon=${tracking.location.longitude}#map=16/${tracking.location.latitude}/${tracking.location.longitude}`}>Open technician location</a></> : <p>No location update is available yet.</p>}</section>}{reviewing && <section className="form-card"><h2>Rate your service</h2><form className="form-grid" onSubmit={review}><label>Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((item) => <option key={item} value={item}>{item} star{item === 1 ? '' : 's'}</option>)}</select></label><label className="full">Feedback<textarea rows="3" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Tell us about the technician and completed work." /></label><div className="form-actions"><button type="button" className="secondary" onClick={() => setReviewing(null)}>Cancel</button><button><Star size={16} /> Submit review</button></div></form></section>}{requests.loading || lifts.loading ? <Loader /> : <div className="card-grid service-grid">{requests.data.map((request) => <ServiceRequestCard key={request._id} request={request} onTrack={track} onDownload={download} onReview={(item) => { setReviewing(item); setRating(5); setFeedback(''); }} />)}{!requests.data.length && <p className="empty-state">No requests yet. Create one when you need help.</p>}</div>}</>;
}
