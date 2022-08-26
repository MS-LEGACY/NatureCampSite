

// You can remove the following line if you don't need support for RTL (right-to-left) labels:
maplibregl.setRTLTextPlugin('https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');
let map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${maptoken}`,
    center: geometry.coordinates,
    zoom: 9
});
const marker = new maplibregl.Marker()
    .setLngLat(geometry.coordinates)
    .addTo(map);
var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'top-left');