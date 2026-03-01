import {
    GoogleMap,
    Marker,
    useLoadScript
} from "@react-google-maps/api";

import { useState, useEffect, useRef, useCallback } from "react";

import { Button } from "./button";
import { Badge } from "./badge";
import { Dialog, DialogContent } from "./dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const MADAGASCAR_CENTER = {
    lat: -18.8792,
    lng: 47.5079,
};

const containerStyle = {
    width: "100%",
    height: "100%",
};

export default function GoogleMapPicker({ lat, lng, onChange }) {

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const [isOpen, setIsOpen] = useState(false);
    const [tempPos, setTempPos] = useState(null);
    const [map, setMap] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const modalRef = useRef(null);

    /* ================= INIT POSITION ================= */

    useEffect(() => {
        if (isOpen) {
            setTempPos(
                lat && lng
                    ? { lat: parseFloat(lat), lng: parseFloat(lng) }
                    : MADAGASCAR_CENTER
            );
        }
    }, [isOpen, lat, lng]);

    /* ================= MAP EVENTS ================= */

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    const handleMapClick = (e) => {
        setTempPos({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        });
    };

    /* ================= GEOLOC ================= */

    const locateMe = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const newPos = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };

            setTempPos(newPos);
            map?.panTo(newPos);
            map?.setZoom(18);
        });
    };

    /* ================= FULLSCREEN ================= */

    const toggleBrowserFullscreen = () => {
        if (!document.fullscreenElement) {
            modalRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handler = () =>
            setIsFullscreen(!!document.fullscreenElement);

        document.addEventListener(
            "fullscreenchange",
            handler
        );

        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handler
            );
    }, []);

    /* ================= CONFIRM ================= */

    const handleConfirm = () => {
        if (tempPos) onChange(tempPos);
        document.exitFullscreen?.();
        setIsOpen(false);
    };

    if (!isLoaded) return null;

    return (
        <div className="w-full">

            {/* Trigger */}
            <Button
                type="button"
                variant="outline"
                className="w-full h-16 border-dashed border-2"
                onClick={() => setIsOpen(true)}
            >
                {lat && lng
                    ? `${lat}, ${lng}`
                    : "DÉFINIR SUR LA CARTE"}
            </Button>

            <Dialog open={isOpen}>
                <DialogContent className="max-w-none w-screen h-screen p-0 m-0 border-none rounded-none overflow-hidden">

                    <div
                        ref={modalRef}
                        className="w-full h-full"
                    >

                        {/* HEADER */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between z-50">

                            <Button
                                size="icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <CloseIcon />
                            </Button>

                            <div className="flex gap-3">

                                <Button
                                    size="icon"
                                    onClick={toggleBrowserFullscreen}
                                >
                                    {isFullscreen
                                        ? <FullscreenExitIcon />
                                        : <FullscreenIcon />}
                                </Button>

                                <Button
                                    onClick={handleConfirm}
                                    className="bg-violet-600 text-white"
                                >
                                    <CheckCircleIcon />
                                    Valider
                                </Button>

                            </div>
                        </div>

                        {/* GOOGLE MAP */}
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={tempPos || MADAGASCAR_CENTER}
                            zoom={16}
                            onLoad={onLoad}
                            onClick={handleMapClick}
                            options={{
                                mapTypeId: "hybrid",
                                disableDefaultUI: true,
                                gestureHandling: "greedy",
                            }}
                        >
                            {tempPos && (
                                <Marker position={tempPos} />
                            )}
                        </GoogleMap>

                        {/* CONTROLS */}
                        <div className="absolute right-6 top-1/2 flex flex-col gap-4 z-50">

                            <Button
                                size="icon"
                                onClick={locateMe}
                            >
                                <MyLocationIcon />
                            </Button>

                            <div className="flex flex-col bg-white rounded-xl">
                                <button onClick={() => map?.setZoom(map.getZoom() + 1)}>+</button>
                                <button onClick={() => map?.setZoom(map.getZoom() - 1)}>-</button>
                            </div>

                        </div>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    );
}