import { useState } from 'react';
export function useGeolocation() {
  const [error, setError] = useState('');
  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation is not supported by this browser'));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
      (reason) => { setError(reason.message); reject(new Error(reason.message)); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
  return { getLocation, error };
}

