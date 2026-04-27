<script>
  import ArticleHeader from '$lib/components/Article/ArticleHeader.svelte';
  import Map from '$lib/components/Maps/Map.svelte';
  import MapLayer from '$lib/components/Maps/MapLayer.svelte';
  import Geocoder from '$lib/components/Maps/Geocoder.svelte';
  import Legend from '$lib/components/Maps/Legend.svelte';

  let { data } = $props();

  let longitude = $state(-74.0);
  let latitude = $state(40.7);
  let zoom = $state(11);

  const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] };
  let searchPin = $state(EMPTY_GEOJSON);

  let selectedBorough = $state('All');
  let selectedStatus = $state('Active');

  const boroughs = ['All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

  const filteredMeters = $derived.by(() => {
    const features = data.parkingMeters.features.filter((f) => {
      const p = f.properties;
      const boroughMatch = selectedBorough === 'All' || p.borough === selectedBorough;
      const statusMatch = selectedStatus === 'All' || p.status === selectedStatus;
      return boroughMatch && statusMatch;
    });
    return { type: 'FeatureCollection', features };
  });

  const meterCount = $derived(filteredMeters.features.length);

  const searchCoords = $derived(
    searchPin.features.length > 0
      ? searchPin.features[0].geometry.coordinates
      : null
  );

  const meterPaint = $derived({
    'circle-radius': [
      'interpolate', ['linear'], ['zoom'],
      11, 3,
      14, 5,
      16, 8,
    ],
    'circle-color': [
      'match',
      ['get', 'status'],
      'Active', '#16a34a',
      'Inactive', '#dc2626',
      'Planned', '#2563eb',
      '#9ca3af',
    ],
    'circle-opacity': searchCoords
      ? [
          'interpolate', ['linear'],
          ['distance', { type: 'Point', coordinates: searchCoords }],
          0,    0.95,
          300,  0.80,
          700,  0.45,
          1200, 0.10,
          2000, 0.02,
        ]
      : 0.85,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
    'circle-stroke-opacity': searchCoords
      ? [
          'interpolate', ['linear'],
          ['distance', { type: 'Point', coordinates: searchCoords }],
          0,    0.7,
          700,  0.2,
          1500, 0,
        ]
      : 0.6,
  });

  const boroughCenters = {
    Manhattan: { lng: -73.9712, lat: 40.7831, zoom: 13 },
    Brooklyn: { lng: -73.9442, lat: 40.6782, zoom: 12 },
    Queens: { lng: -73.7949, lat: 40.7282, zoom: 12 },
    Bronx: { lng: -73.8648, lat: 40.8448, zoom: 12 },
    'Staten Island': { lng: -74.1502, lat: 40.5795, zoom: 12 },
    All: { lng: -74.0, lat: 40.7, zoom: 11 },
  };

  function selectBorough(b) {
    selectedBorough = b;
    const center = boroughCenters[b];
    longitude = center.lng;
    latitude = center.lat;
    zoom = center.zoom;
  }

  function meterPopup(feature) {
    const p = feature.properties;
    const loc = [p.on_street, p.from_street && `from ${p.from_street}`, p.to_street && `to ${p.to_street}`]
      .filter(Boolean)
      .join(' ');
    const statusColor = p.status === 'Active' ? '#16a34a' : p.status === 'Inactive' ? '#dc2626' : '#6b7280';
    return `
      <div style="font-family:sans-serif;font-size:13px;min-width:200px">
        <div style="font-weight:700;margin-bottom:6px">${loc || 'Unknown Location'}</div>
        <div style="margin-bottom:4px">
          <span style="display:inline-block;padding:2px 8px;border-radius:99px;background:${statusColor};color:#fff;font-size:11px;font-weight:600">${p.status || 'Unknown'}</span>
        </div>
        ${p.meter_hours ? `<div style="margin-top:6px"><strong>Hours:</strong> ${p.meter_hours}</div>` : ''}
        ${p.pay_by_cell_number ? `<div style="margin-top:4px"><strong>Pay-by-Phone #:</strong> ${p.pay_by_cell_number}</div>` : ''}
        ${p.borough ? `<div style="margin-top:4px"><strong>Borough:</strong> ${p.borough}</div>` : ''}
        ${p.meter_number ? `<div style="margin-top:4px;color:#6b7280;font-size:11px">Meter #${p.meter_number}</div>` : ''}
      </div>
    `;
  }
</script>

<div class="container">
  <ArticleHeader
    headline="Find Parking Meters Near You in NYC"
    byline="NYC Open Data"
    pubDate="2026-04-26"
  />

  <p>
    New York City has over 15,000 parking meters across its five boroughs. Use this map
    to find active meters near your destination — click any dot to see its hours,
    pay-by-phone number, and exact street location.
  </p>

  <div class="controls">
    <div class="filter-group">
      <span class="filter-label">Borough</span>
      <div class="filter-buttons">
        {#each boroughs as b}
          <button
            class="filter-btn"
            class:active={selectedBorough === b}
            onclick={() => selectBorough(b)}
          >{b}</button>
        {/each}
      </div>
    </div>

    <div class="filter-group">
      <span class="filter-label">Status</span>
      <div class="filter-buttons">
        {#each ['Active', 'All'] as s}
          <button
            class="filter-btn"
            class:active={selectedStatus === s}
            onclick={() => (selectedStatus = s)}
          >{s === 'All' ? 'All (incl. Inactive)' : s}</button>
        {/each}
      </div>
    </div>

    <div class="meter-count">
      Showing <strong>{meterCount.toLocaleString()}</strong> meters
    </div>
  </div>

  <Geocoder
    label="Find meters near an address"
    placeholder="Enter an address in New York…"
    viewbox="-74.2591,40.9176,-73.7004,40.4774"
    bounded={true}
    onclear={() => { searchPin = EMPTY_GEOJSON; }}
    onresult={(result) => {
      longitude = result.lng;
      latitude = result.lat;
      zoom = 16;
      searchPin = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [result.lng, result.lat] },
          properties: { name: result.displayName },
        }],
      };
    }}
  />

  <p class="zoom-hint">Search for an address or zoom in to street level to see nearby parking meters.</p>

  <Map
    {longitude}
    {latitude}
    {zoom}
    height={600}
    theme="positron"
    credit="OpenFreeMap / OpenStreetMap contributors | NYC Open Data"
  >
    <MapLayer
      id="parking-meters"
      type="circle"
      data={filteredMeters}
      minzoom={14}
      paint={meterPaint}
      popup={meterPopup}
    />
    <MapLayer
      id="search-pin-halo"
      type="circle"
      data={searchPin}
      paint={{
        'circle-radius': 14,
        'circle-color': '#fff',
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#1d4ed8',
        'circle-stroke-opacity': 0.6,
      }}
    />
    <MapLayer
      id="search-pin"
      type="circle"
      data={searchPin}
      paint={{
        'circle-radius': 7,
        'circle-color': '#1d4ed8',
        'circle-opacity': 1,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-stroke-opacity': 1,
      }}
      popup={(feature) => `<strong>📍 Your location</strong><br/><span style="font-size:12px;color:#6b7280">${feature.properties.name}</span>`}
    />
  </Map>

  <Legend
    title="Parking Meter Status"
    mode="categorical"
    items={[
      { color: '#16a34a', label: 'Active' },
      { color: '#dc2626', label: 'Inactive' },
      { color: '#9ca3af', label: 'Unknown / Other' },
    ]}
  />
</div>

<style lang="scss">
  .controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
    padding: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    min-width: 60px;
  }

  .filter-buttons {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 4px 12px;
    border: 1px solid #d1d5db;
    border-radius: 99px;
    background: #fff;
    font-size: 13px;
    cursor: pointer;
    color: #374151;
    transition: all 0.15s;

    &:hover {
      border-color: #6b7280;
    }

    &.active {
      background: #1d4ed8;
      border-color: #1d4ed8;
      color: #fff;
      font-weight: 600;
    }
  }

  .zoom-hint {
    font-size: 13px;
    color: #6b7280;
    margin: 8px 0 4px;
    padding: 8px 12px;
    background: #f0f9ff;
    border-left: 3px solid #0ea5e9;
    border-radius: 0 4px 4px 0;
  }

  .meter-count {
    font-size: 13px;
    color: #6b7280;
    margin-top: 2px;
  }
</style>
