import { useContext, useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { SocketContext } from '../../context/SocketContext';
import { TechnicianTrackerMap } from '../../components/maps/TechnicianTrackerMap';
import { Loader } from '../../components/common/Loader';
import { getLatestLocations } from '../../services/locationService';
import { getLifts } from '../../services/liftService';
import { removeLocation } from '../../services/locationService';

export default function LiveTrackingDashboard() {
	const socket = useContext(SocketContext);
	const [locations, setLocations] = useState([]);
	const [lifts, setLifts] = useState([]);
	const [hiddenLiftIds, setHiddenLiftIds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const refreshLocations = () => Promise.all([getLatestLocations(), getLifts()])
		.then(([latestLocations, latestLifts]) => {
			setLocations(latestLocations);
			setLifts(latestLifts);
		})
		.catch((reason) => setError(reason.message))
		.finally(() => setLoading(false));

	const discardLocation = async (location) => {
		try {
			await removeLocation(location._id);
			const employeeId = location.employee?._id || location.employee;
			setLocations((current) => current.filter((item) => (item.employee?._id || item.employee) !== employeeId));
		} catch (reason) {
			setError(reason.message);
		}
	};

	useEffect(() => {
		refreshLocations();
		const interval = window.setInterval(refreshLocations, 5000);
		return () => window.clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!socket) return undefined;
		const update = (next) => setLocations((current) => {
			const nextEmployeeId = next.employee?._id || next.employee;
			return [next, ...current.filter((item) => (item.employee?._id || item.employee) !== nextEmployeeId)];
		});
		const statusUpdate = (next) => setLifts((current) => [next, ...current.filter((item) => item._id !== next._id)]);
		const liftRemoved = ({ id }) => setLifts((current) => current.filter((item) => item._id !== id));
		const locationRemoved = ({ id, employee, liftId, liftIds = [] }) => {
			const removedLiftIds = [...liftIds, liftId].filter(Boolean).map((value) => value.toString());
			if (removedLiftIds.length) setHiddenLiftIds((current) => [...new Set([...current, ...removedLiftIds])]);
			setLocations((current) => current.filter((item) => {
				const itemEmployeeId = item.employee?._id || item.employee;
				return item._id !== id && (!employee || itemEmployeeId !== employee);
			}));
		};
		socket.on('location:update', update);
		socket.on('lift:status-update', statusUpdate);
		socket.on('lift:removed', liftRemoved);
		socket.on('location:removed', locationRemoved);
		return () => {
			socket.off('location:update', update);
			socket.off('lift:status-update', statusUpdate);
			socket.off('lift:removed', liftRemoved);
			socket.off('location:removed', locationRemoved);
		};
	}, [socket]);

	const visibleLifts = lifts.filter((lift) => !hiddenLiftIds.includes(lift._id.toString()));
	return <div className="tracking-page"><div className="page-heading"><div><span className="eyebrow">Field visibility</span><h1>Live tracking</h1><p><Radio className="live-dot" size={15} /> Technician positions and customer-reported lift status.</p></div></div>{error && <div className="alert error">{error}</div>}{loading ? <Loader /> : <TechnicianTrackerMap locations={locations} lifts={visibleLifts} onRemoveLocation={discardLocation} />}</div>;
}
