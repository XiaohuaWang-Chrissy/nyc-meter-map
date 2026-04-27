export async function load({ fetch }) {
  const res = await fetch('/parking-meters.geojson');
  const parkingMeters = await res.json();

  return {
    showHeader: true,
    showFooter: true,
    parkingMeters,
  };
}