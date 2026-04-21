<script>
  import ArticleHeader from '$lib/components/Article/ArticleHeader.svelte';
  import Map from '$lib/components/Maps/Map.svelte';
  import MapLayer from '$lib/components/Maps/MapLayer.svelte';
  import Geocoder from '$lib/components/Maps/Geocoder.svelte';
  import Legend from '$lib/components/Maps/Legend.svelte';

  let { data } = $props();
  let longitude = $state(-74.0);
  let latitude = $state(40.7);
  let zoom = $state(9.5);
</script>

<div class="container">
 <ArticleHeader
    headline="Where to find the London plane, New York's most common tree"
    byline="NYCity News Service"
    pubDate="2026-04-20"
  />

  <p>
    Every ten years, thousands of volunteers canvass the city's street trees,
    recording their species, trunk diameter, health, and exact location. In the
    2015 survey, they found more than 600,000 trees and 133 different species.
  </p>

  <p>
    One tree dominates the count: the London plane. It was the tree favored by
    Robert Moses, the unelected "power broker" who controlled city parks for
    decades in the mid 20th century. He made sure the hearty hybrid was planted
    everywhere in New York, where it can be found in every borough and on nearly
    every block.
  </p>

  <p>
    According to the 2015 census, there are more than 87,000 London plane
    trees on New York's streets, 12% of the city's population of street trees.
    Here's where the most London planes are found:
  </p>


 <Geocoder
    label="Find your neighborhood"
    placeholder="Enter an address in New York…"
    onresult={(result) => {
      longitude = result.lng;
      latitude = result.lat;
      zoom = 15;
    }}
  />

  <Map
    {longitude}
    {latitude}
    {zoom}
    height={600}
    theme="positron"
    credit="OpenFreeMap / OpenStreetMap contributors"
  >
    <MapLayer
      id="nta-fill"
      type="fill"
      data={data.planetrees}
      paint={{
        'fill-color': [
          'step',
          ['get', 'total_planetree'],
          '#eef2f9',
          147,
          '#c2cfe6',
          269,
          '#8098cc',
          434,
          '#3366b3',
          697,
          '#0033a1',
        ],
        'fill-opacity': 0.7,
      }}
           popup={(feature) => {
    const p = feature.properties;
    return `<strong>${p.ntaname}</strong><br/>${p.total_planetree} plane trees`;
  }}
    />
    <MapLayer
      id="nta-outline"
      type="line"
      data={data.planetrees}
      paint={{
        'line-color': '#0033a1',
        'line-width': 0.5,
      }}
    />
  </Map>

    <Legend
    title="London plane trees"
    mode="threshold"
    items={[
      {
        color: '#eef2f9',
        to: 146,
      },
      {
        color: '#c2cfe6',
        from: 147,
        to: 268,
      },
      {
        color: '#8098cc',
        from: 269,
        to: 433,
      },
      {
        color: '#3366b3',
        from: 434,
        to: 696,
      },
      {
        color: '#0033a1',
        from: 697,
      },
    ]}
  />
  
</div>