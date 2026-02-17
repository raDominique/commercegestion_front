import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix default marker icon issue in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const MADAGASCAR_CENTER = [-18.8792, 47.5079];

function LocationMarker({ position, onChange }) {
    useMapEvents({
        click(e) {
            onChange([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position ? <Marker position={position} /> : null;
}

export default function LeafletMapPicker({ lat, lng, onChange }) {
    const position = lat && lng ? [parseFloat(lat), parseFloat(lng)] : MADAGASCAR_CENTER;
    const mapRef = useRef();

    useEffect(() => {
        if (mapRef.current && lat && lng) {
            mapRef.current.setView([parseFloat(lat), parseFloat(lng)], 7);
        }
    }, [lat, lng]);

    return (
        <MapContainer
            center={position}
            zoom={7}
            style={{ width: '100%', height: 300, borderRadius: '0.5rem', marginBottom: '1rem' }}
            whenCreated={mapInstance => (mapRef.current = mapInstance)}
        >
            <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} onChange={([lat, lng]) => onChange({ lat, lng })} />
        </MapContainer>
    );
}
