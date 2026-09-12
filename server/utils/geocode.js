// Plug a provider (Google Maps, Mapbox, etc.) in here when address geocoding is enabled.
export async function geocodeAddress() {
  throw new Error('No geocoding provider is configured');
}

