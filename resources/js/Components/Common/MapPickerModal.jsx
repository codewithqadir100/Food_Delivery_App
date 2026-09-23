import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function MapPickerModal({
    isOpen,
    onClose,
    onLocationSelect,
    initialLat,
    initialLon,
}) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapCenter] = useState({
        lat: initialLat || 25.2048,
        lng: initialLon || 55.2708,
    });

    useEffect(() => {
        if (!isOpen || !mapRef.current) return;

        setLoading(true);
        const loadMap = async () => {
            try {
                const L = (await import("leaflet")).default;
                await import("leaflet/dist/leaflet.css");

                if (map) {
                    map.remove();
                }

                const newMap = L.map(mapRef.current).setView(
                    [mapCenter.lat, mapCenter.lng],
                    13,
                );

                L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                        attribution: "© OpenStreetMap contributors",
                        maxZoom: 19,
                    },
                ).addTo(newMap);

                const newMarker = L.marker([
                    mapCenter.lat,
                    mapCenter.lng,
                ]).addTo(newMap);
                setMarker(newMarker);
                setMap(newMap);

                newMap.on("click", async (e) => {
                    const { lat, lng } = e.latlng;
                    newMarker.setLatLng([lat, lng]);
                    newMap.setView([lat, lng], 13);

                    try {
                        setLoading(true);
                        const response = await axios.get(
                            "/api/geocoding/reverse",
                            {
                                params: { latitude: lat, longitude: lng },
                            },
                        );

                        const { city_name, area_name } = response.data.data;
                        onLocationSelect(lat, lng, city_name, area_name);
                    } catch (error) {
                        console.error("Geocoding error:", error);
                        alert(
                            "Could not get location details. Please try again.",
                        );
                    } finally {
                        setLoading(false);
                    }
                });

                setLoading(false);
            } catch (error) {
                console.error("Map load error:", error);
                setLoading(false);
            }
        };

        loadMap();

        return () => {
            if (map) {
                map.remove();
                setMap(null);
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[color:var(--color-bg-primary)] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[color:var(--color-border-light)] flex items-center justify-between">
                    <h2 className="font-semibold text-[color:var(--color-text-primary)]">
                        Select Your Location
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 relative min-h-[400px]" ref={mapRef}>
                    {loading && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
                            <div className="text-white text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                                <p>Loading map...</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)]">
                    <p className="text-sm text-[color:var(--color-text-muted)] mb-3">
                        Click on the map to select your delivery location
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-[color:var(--color-primary-600)] text-white rounded-lg hover:bg-[color:var(--color-primary-700)] font-medium transition-colors"
                    >
                        Close Map
                    </button>
                </div>
            </div>
        </div>
    );
}
