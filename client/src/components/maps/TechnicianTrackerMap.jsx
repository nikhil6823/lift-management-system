import { MapPin, Radio, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDateTime } from '../../utils/dateHelpers';

const defaultCenter = [20.5937, 78.9629];

function MapViewport({ locations, lifts }) {
	const map = useMap();
	useEffect(() => {
		const points = [...locations.map((location) => [location.latitude, location.longitude]), ...lifts.map((lift) => [lift.location.latitude, lift.location.longitude])];
		if (!points.length) {
			map.setView(defaultCenter, 5);
			return;
		}
		if (points.length === 1) {
			map.setView(points[0], 13);
			return;
		}
		map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
	}, [locations, lifts, map]);
	return null;
}

export function TechnicianTrackerMap({ locations, lifts = [], onRemoveLocation }) {
	const validLocations = locations.filter((location) => Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude)));
	const mappedLifts = lifts.filter((lift) => Number.isFinite(Number(lift.location?.latitude)) && Number.isFinite(Number(lift.location?.longitude)));
	return <section className="map-panel tracker">
		<MapContainer className="tracker-map" center={defaultCenter} zoom={5} scrollWheelZoom>
			<TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			<MapViewport locations={validLocations} lifts={mappedLifts} />
			{validLocations.map((location) => <CircleMarker key={location._id} center={[location.latitude, location.longitude]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#d7605b', fillOpacity: 1 }}><Popup><strong>{location.employee?.user?.name || 'Technician'}</strong><br />Updated {formatDateTime(location.recordedAt)}<br />Accuracy: {location.accuracy ? `${Math.round(location.accuracy)} m` : 'Not available'}{location.photoData && <img className="location-photo" src={location.photoData} alt={`${location.employee?.user?.name || 'Technician'} location`} />}</Popup></CircleMarker>)}
			{mappedLifts.map((lift) => <CircleMarker key={lift._id} center={[lift.location.latitude, lift.location.longitude]} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: lift.customerStatus?.status === 'out-of-service' ? '#bf3e4d' : lift.customerStatus?.status === 'maintenance' ? '#d7832e' : '#0f766e', fillOpacity: 1 }}><Popup><strong>{lift.code} · {lift.name}</strong><br />Customer status: {lift.customerStatus?.status || lift.status}{lift.customerStatus?.note && <><br />Note: {lift.customerStatus.note}</>}{lift.images?.length > 0 && <img className="location-photo" src={lift.images[lift.images.length - 1].data} alt={`${lift.name} update`} />}</Popup></CircleMarker>)}
		</MapContainer>
		<div className="tracking-list">{validLocations.length ? validLocations.map((location) => <div key={location._id}><Radio size={15} /><strong>{location.employee?.user?.name || 'Technician'}</strong>{location.photoData && <img className="location-thumb" src={location.photoData} alt="Shared location" />}<span>{Number(location.latitude).toFixed(4)}, {Number(location.longitude).toFixed(4)} · {formatDateTime(location.recordedAt)}</span>{onRemoveLocation && <button className="remove-location" onClick={() => onRemoveLocation(location)} title="Remove this location" aria-label={`Remove ${location.employee?.user?.name || 'technician'} location`}><Trash2 size={14} />Remove</button>}</div>) : <p>No technician locations received yet.</p>}{mappedLifts.length > 0 && <div className="tracking-lifts"><MapPin size={15} /><strong>{mappedLifts.length} mapped lifts</strong><span>Marker colour shows each customer’s latest reported status.</span></div>}</div>
	</section>;
}
