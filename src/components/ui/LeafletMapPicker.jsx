import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect, useRef } from 'react';

// UI Components from local library
import { Button } from './button';
import { Badge } from './badge';
import {
    Dialog,
    DialogContent,
    DialogClose,
} from './dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './tooltip';

// Material Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MyLocationIcon from '@mui/icons-material/MyLocation';

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

// Sous-composant pour les contrôles (Zoom + Géolocalisation)
function MapControls({ setTempPosition }) {
    const map = useMapEvents({
        click(e) {
            setTempPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    const handleLocateMe = (e) => {
        e.stopPropagation();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const newPos = [position.coords.latitude, position.coords.longitude];
                setTempPosition(newPos);
                map.flyTo(newPos, 18);
            });
        }
    };

    return (
        <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col gap-4 z-1000 pointer-events-auto">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            className="bg-white text-neutral-900 hover:bg-violet-50 rounded-2xl shadow-2xl h-14 w-14 border border-white/50 transition-all hover:scale-110 active:scale-95 group"
                            onClick={handleLocateMe}
                        >
                            <MyLocationIcon className="group-hover:text-violet-600 transition-colors" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Ma position actuelle</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/50 backdrop-blur-sm">
                <button
                    className="h-14 w-14 flex items-center justify-center hover:bg-violet-50 text-xl font-bold border-b border-neutral-100 transition-all hover:text-violet-600 active:bg-violet-100"
                    onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
                >
                    +
                </button>
                <button
                    className="h-14 w-14 flex items-center justify-center hover:bg-violet-50 text-xl font-bold transition-all hover:text-violet-600 active:bg-violet-100"
                    onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
                >
                    -
                </button>
            </div>
        </div>
    );
}

export default function LeafletMapPicker({ lat, lng, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempPos, setTempPosition] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const modalRef = useRef(null);

    // Initialise la position temporaire quand on ouvre le plein écran
    useEffect(() => {
        if (isOpen) {
            setTempPosition(lat && lng ? [parseFloat(lat), parseFloat(lng)] : MADAGASCAR_CENTER);
        }
    }, [isOpen, lat, lng]);

    // Gérer le mode plein écran du navigateur
    const toggleBrowserFullscreen = () => {
        if (!document.fullscreenElement) {
            modalRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Écouter les changements de fullscreen du navigateur (ex: touche Echap)
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const handleConfirm = () => {
        if (tempPos) {
            onChange({ lat: tempPos[0], lng: tempPos[1] });
        }
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsOpen(false);
    };

    const handleClose = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsOpen(false);
    };

    return (
        <div className="w-full">
            {/* BOUTON DÉCLENCHEUR */}
            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-between border-dashed border-2 h-16 hover:border-violet-500 hover:bg-violet-50 transition-all group px-4 py-2 rounded-xl"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-all ${lat ? 'bg-violet-100 text-violet-600 ring-2 ring-violet-50' : 'bg-neutral-100 text-neutral-400'}`}>
                        <LocationOnIcon />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-0.5">Emplacement du Site</p>
                        <p className="text-sm font-bold text-neutral-900 truncate max-w-45 sm:max-w-none">
                            {lat && lng ? `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}` : "DÉFINIR SUR LA CARTE"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="hidden sm:inline-flex bg-neutral-100 text-neutral-600 border-none px-2 py-1">Mode Satellite</Badge>
                    <OpenInFullIcon className="w-5 h-5 text-neutral-400 group-hover:text-violet-500 transition-all transform group-hover:scale-110" />
                </div>
            </Button>

            {/* MODAL PLEIN ÉCRAN */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    ref={modalRef}
                    className="max-w-none w-screen h-screen p-0 m-0 border-none rounded-none overflow-hidden bg-black z-99999"
                >
                    {/* Header Overlay - Glassmorphism */}
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-1001 pointer-events-none">
                        <div className="flex items-center gap-4 pointer-events-auto bg-white/95 backdrop-blur-xl p-2.5 pr-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClose}
                                className="rounded-xl h-11 w-11 hover:bg-neutral-100 text-neutral-500 hover:text-red-500 transition-all active:scale-90"
                            >
                                <CloseIcon />
                            </Button>
                            <div className="hidden sm:block border-l pl-4 border-neutral-200">
                                <h2 className="font-extrabold text-neutral-900 text-base tracking-tight leading-none mb-1">Positionnement GPS</h2>
                                <p className="text-[10px] text-violet-600 font-black uppercase tracking-widest">Vue Temps Réel Hybride</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pointer-events-auto">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={toggleBrowserFullscreen}
                                            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-white/20 h-12 w-12 hover:bg-white transition-all active:scale-90"
                                        >
                                            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Plein écran navigateur</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button
                                onClick={handleConfirm}
                                className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-2xl shadow-violet-500/40 rounded-2xl px-8 h-12 font-bold text-sm transition-all hover:scale-105 active:scale-95 ring-4 ring-violet-600/10"
                            >
                                <CheckCircleIcon fontSize="small" />
                                <span>Valider la position</span>
                            </Button>
                        </div>
                    </div>

                    {/* Zone de Carte */}
                    <div className="w-full h-full relative">
                        <MapContainer
                            center={tempPos || MADAGASCAR_CENTER}
                            zoom={16}
                            zoomControl={false}
                            style={{ width: '100%', height: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                url={HYBRID_URL}
                                maxZoom={21}
                                attribution='&copy; Google Maps'
                            />

                            <MapControls setTempPosition={setTempPosition} />

                            {tempPos && <Marker position={tempPos} />}

                            {/* Info Badge - Bottom */}
                            {tempPos && (
                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-1000 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-8 duration-500">
                                    <div className="bg-black/90 backdrop-blur-2xl text-white px-8 py-4 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-1">Latitude</span>
                                            <span className="text-base font-mono font-bold tracking-wider">{tempPos[0].toFixed(7)}</span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-1">Longitude</span>
                                            <span className="text-base font-mono font-bold tracking-wider">{tempPos[1].toFixed(7)}</span>
                                        </div>
                                        <div className="ml-2 hidden lg:block">
                                            <Badge variant="outline" className="border-violet-500/50 text-violet-400 font-bold bg-violet-500/5 px-3 py-1 rounded-full">Précision Satellite</Badge>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest drop-shadow-lg">
                                        Cliquez n'importe où pour déplacer le marqueur
                                    </p>
                                </div>
                            )}
                        </MapContainer>

                        {!tempPos && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-1000 flex flex-col items-center">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-red-600 blur-[80px] opacity-30 animate-pulse scale-150" />
                                    <LocationOnIcon className="text-red-500 text-8xl animate-bounce drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                </div>
                                <div className="bg-white px-8 py-3 rounded-2xl shadow-2xl border border-neutral-100 flex flex-col items-center">
                                    <span className="text-neutral-900 font-black text-sm uppercase tracking-tighter">SÉLECTIONNEZ UN EMPLACEMENT</span>
                                    <span className="text-neutral-400 text-[10px] font-bold">Cliquez sur un point précis de la vue satellite</span>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
