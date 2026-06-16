import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 1. Clean up Leaflet's default marker asset bug so your pins show up
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 2. Track user panning & zooming to filter properties by boundary
function MapController({ setBounds }) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      setBounds({
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth()
      });
    },
  });
  return null;
}

export default function RealEstateMap({ 
  height = "100vh", 
  center = [40.7128, -74.0060],
  zoom = 12,
  singleProperty = null 
}) {
  const [properties, setProperties] = useState([]);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    if (!singleProperty) return;
    setProperties([singleProperty]);
  }, [singleProperty]);


  // 3. Connect MapTiler Tile URL using your secure environment variable
  const maptilerUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`;

  useEffect(() => {
    if (!bounds) return;

    const { west, south, east, north } = bounds;


    // Fetch real estate data within map viewpoint from your Express app
    fetch(`/api/properties?west=${west}&south=${south}&east=${east}&north=${north}`)
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error('Database fetch failed:', err));
  }, [bounds, singleProperty]);

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height, width: "100%" }}
    >
      <TileLayer
        url={maptilerUrl}
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        tileSize={512}
        zoomOffset={-1}
      />
      
      <MapController setBounds={setBounds} />

      {properties.map(prop => (
        <Marker key={prop.id} position={[prop.lat, prop.lng]}>
          <Popup>
            <strong>{prop.title}</strong><br />
            ${prop.price.toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}