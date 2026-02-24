import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { Button } from './button'; // Votre composant Shadcn UI

// Material Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';

// Fix des icônes Leaflet par défaut
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
// Vue Hybride (Satellite + Noms des rues)
const HYBRID_URL = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

// Sous-composant pour gérer le clic
function MapEventsHandler({ setTempPosition }) {
    useMapEvents({
        click(e) {
            setTempPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default function LeafletMapPicker({ lat, lng, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempPos, setTempPosition] = useState(null);

    // Initialise la position temporaire quand on ouvre le plein écran
    useEffect(() => {
        if (isOpen) {
            setTempPosition(lat && lng ? [parseFloat(lat), parseFloat(lng)] : MADAGASCAR_CENTER);
        }
    }, [isOpen, lat, lng]);

    const handleConfirm = () => {
        if (tempPos) {
            onChange({ lat: tempPos[0], lng: tempPos[1] });
        }
        setIsOpen(false);
    };

    return (
        <div className="w-full">
            {/* BOUTON DÉCLENCHEUR : Il remplace la carte statique dans le formulaire */}
            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-between border-dashed border-2 h-14 hover:border-violet-500 hover:bg-violet-50 transition-all group"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${lat ? 'bg-violet-100 text-violet-600' : 'bg-neutral-100 text-neutral-400'}`}>
                        <LocationOnIcon fontSize="small" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-neutral-500 font-medium">Localisation</p>
                        <p className="text-sm font-semibold text-neutral-900">
                            {lat && lng ? `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}` : "Choisir sur la carte réelle"}
                        </p>
                    </div>
                </div>
                <OpenInFullIcon className="w-5 h-5 text-neutral-400 group-hover:text-violet-500 transition-colors" />
            </Button>

            {/* MODAL PLEIN ÉCRAN */}
            {isOpen && (
                <div className="fixed inset-0 z-10000 bg-black flex flex-col animate-in fade-in duration-200">

                    {/* BARRE DE NAVIGATION MODALE */}
                    <div className="bg-white p-4 flex items-center justify-between shadow-md z-1001">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                                <CloseIcon />
                            </Button>
                            <div>
                                <h2 className="font-bold text-neutral-900">Définir l'emplacement</h2>
                                <p className="text-[10px] text-violet-600 font-bold uppercase tracking-tighter">Vue Satellite Réelle</p>
                            </div>
                        </div>

                        <Button
                            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-lg shadow-violet-200"
                            onClick={handleConfirm}
                        >
                            <CheckCircleIcon fontSize="small" />
                            <span className="hidden sm:inline">Confirmer la position</span>
                            <span className="sm:hidden">Valider</span>
                        </Button>
                    </div>

                    {/* ZONE DE CARTE */}
                    <div className="flex-1 relative">
                        <MapContainer
                            center={tempPos || MADAGASCAR_CENTER}
                            zoom={15}
                            zoomControl={false} // On le cache pour un look plus propre
                            style={{ width: '100%', height: '100%' }}
                        >
                            <TileLayer
                                url={HYBRID_URL}
                                maxZoom={20}
                            />
                            <MapEventsHandler setTempPosition={setTempPosition} />
                            {tempPos && <Marker position={tempPos} />}

                            {/* Boutons de zoom repositionnés pour mobile */}
                            <div className="absolute bottom-10 right-4 flex flex-col gap-2 z-1000">
                                <Button size="icon" className="bg-white text-black hover:bg-neutral-100 shadow-md" onClick={() => window.dispatchEvent(new CustomEvent('zoom-in'))}>+</Button>
                                <Button size="icon" className="bg-white text-black hover:bg-neutral-100 shadow-md" onClick={() => window.dispatchEvent(new CustomEvent('zoom-out'))}>-</Button>
                            </div>
                        </MapContainer>

                        {/* Indication visuelle au centre si aucun point n'est mis */}
                        {!tempPos && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-1000 flex flex-col items-center">
                                <LocationOnIcon className="text-red-500 text-5xl animate-bounce" />
                                <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">Cliquez pour marquer</span>
                            </div>
                        )}
                    </div>

                    {/* PIED DE PAGE INFOS */}
                    <div className="bg-neutral-50 p-3 text-center border-t">
                        <p className="text-[11px] text-neutral-500 italic">
                            Astuce : Zoomez pour plus de précision. Les noms des rues et quartiers sont affichés par-dessus l'image.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}