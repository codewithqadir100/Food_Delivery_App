import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL(
        "leaflet/dist/images/marker-icon-2x.png",
        import.meta.url,
    ).href,
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
        .href,
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
        .href,
});

const MAP_DEFAULT_CENTER = [25.3548, 68.3711];
const MAP_DEFAULT_ZOOM = 12;

export default function MapLocationPicker({
    onLocationSelect,
    initialLocation,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(
        initialLocation || null,
    );
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const mapContainer = useRef(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        const leafletMap = L.map(mapContainer.current).setView(
            MAP_DEFAULT_CENTER,
            MAP_DEFAULT_ZOOM,
        );

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
        }).addTo(leafletMap);

        leafletMap.on("click", (e) =>
            handleMapClick(e.latlng.lat, e.latlng.lng),
        );

        if (initialLocation) {
            const initialMarker = L.marker([
                initialLocation.latitude,
                initialLocation.longitude,
            ])
                .addTo(leafletMap)
                .bindPopup(initialLocation.fullAddress || "Selected Location");
            leafletMap.setView(
                [initialLocation.latitude, initialLocation.longitude],
                15,
            );
            setMarker(initialMarker);
        }

        setMap(leafletMap);

        return () => leafletMap.remove();
    }, []);

    const handleSearch = async (query) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pk&limit=5`,
            );
            const results = await response.json();
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed:", error);
        }

        setIsSearching(false);
    };

    const handleMapClick = async (lat, lon) => {
        await processLocation(lat, lon);
    };

    const handleSelectResult = async (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        await processLocation(lat, lon);
        setSearchQuery("");
        setSearchResults([]);
    };

    const processLocation = async (lat, lon) => {
        try {
            const reverseResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            );
            const addressData = await reverseResponse.json();

            const locationData = {
                latitude: lat,
                longitude: lon,
                city: addressData.address.city || addressData.address.town,
                area: addressData.address.suburb || addressData.address.town,
                fullAddress: addressData.display_name,
            };

            setSelectedLocation(locationData);
            onLocationSelect(locationData);

            if (map) {
                if (marker) {
                    map.removeLayer(marker);
                }
                const newMarker = L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(locationData.fullAddress);
                setMarker(newMarker);
                map.setView([lat, lon], 15);
            }
        } catch (error) {
            console.error("Location processing failed:", error);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="relative">
                <div className="flex items-center gap-2 border border-[color:var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 bg-[color:var(--color-bg-primary)]">
                    {isSearching ? (
                        <Loader
                            size={18}
                            className="text-[color:var(--color-text-muted)] animate-spin"
                        />
                    ) : (
                        <Search
                            size={18}
                            className="text-[color:var(--color-text-muted)]"
                        />
                    )}
                    <input
                        type="text"
                        placeholder="Search your location..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch(e.target.value);
                        }}
                        className="flex-1 outline-none bg-transparent text-[color:var(--color-text-primary)] placeholder-[color:var(--color-text-muted)]"
                    />
                </div>

                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] z-50 max-h-64 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left px-4 py-3 hover:bg-[color:var(--color-bg-secondary)] border-b border-[color:var(--color-border-light)] last:border-b-0 transition-colors"
                            >
                                <div className="flex items-start gap-2">
                                    <MapPin
                                        size={16}
                                        className="text-[color:var(--color-primary-500)] mt-1 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[color:var(--color-text-primary)] truncate">
                                            {result.name}
                                        </p>
                                        <p className="text-xs text-[color:var(--color-text-muted)] line-clamp-2">
                                            {result.display_name}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div
                ref={mapContainer}
                className="w-full h-96 rounded-[var(--radius-md)] border border-[color:var(--color-border)] overflow-hidden"
            />

            {selectedLocation && (
                <div className="bg-[color:var(--color-bg-secondary)] p-4 rounded-[var(--radius-md)] border border-[color:var(--color-border)] space-y-2">
                    <h3 className="font-semibold text-[color:var(--color-text-primary)]">
                        Selected Location
                    </h3>
                    <div className="space-y-1 text-sm">
                        <p className="text-[color:var(--color-text-secondary)]">
                            {selectedLocation.fullAddress}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[color:var(--color-border-light)]">
                            <div>
                                <span className="text-[color:var(--color-text-muted)]">
                                    City:{" "}
                                </span>
                                <span className="text-[color:var(--color-text-primary)]">
                                    {selectedLocation.city}
                                </span>
                            </div>
                            <div>
                                <span className="text-[color:var(--color-text-muted)]">
                                    Area:{" "}
                                </span>
                                <span className="text-[color:var(--color-text-primary)]">
                                    {selectedLocation.area}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
