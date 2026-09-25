import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader, X, AlertCircle } from "lucide-react";
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

const parseAddress = (addressData, locationMode = "default") => {
    if (!addressData || !addressData.address) {
        return {
            name: "Location",
            area: "",
            city: "",
            address: "Selected Location",
        };
    }

    const addr = addressData.address;

    const name = addr.house_number
        ? `${addr.house_number} ${addr.road || ""}`.trim()
        : addr.road || "";

    const areaParts = [];
    if (addr.neighbourhood) areaParts.push(addr.neighbourhood);
    if (addr.suburb && !areaParts.includes(addr.suburb))
        areaParts.push(addr.suburb);
    if (addr.village && !areaParts.includes(addr.village))
        areaParts.push(addr.village);
    if (addr.locality && !areaParts.includes(addr.locality))
        areaParts.push(addr.locality);
    if (addr.hamlet && !areaParts.includes(addr.hamlet))
        areaParts.push(addr.hamlet);

    const area = areaParts.join(", ");

    let city = addr.city || addr.town || "";
    city = city
        .replace(
            /\s+(District|Division|Tehsil|Taluka|ڈسٹرکٹ|ڈویژن|تحصیل|تعلقہ)\s*$/i,
            "",
        )
        .trim();

    // Address
    const addressParts = [];
    if (name) addressParts.push(name);
    if (area && area !== name) addressParts.push(area);

    const shortAddress = addressParts.join(", ") || "Selected Location";

    return {
        name: name || "Location",
        area: area,
        city: city,
        address: shortAddress,
    };
};

export default function MapLocationPicker({
    onLocationSelect,
    initialLocation,
    locationMode = "default",
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(
        initialLocation || null,
    );
    const [error, setError] = useState("");
    const [map, setMap] = useState(null);
    const markerRef = useRef(null);
    const mapContainer = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!mapContainer.current) return;

        const leafletMap = L.map(mapContainer.current).setView(
            MAP_DEFAULT_CENTER,
            MAP_DEFAULT_ZOOM,
        );

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© FoodHub",
            maxZoom: 19,
        }).addTo(leafletMap);

        leafletMap.on("click", (e) => {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;

            processLocation(lat, lon, leafletMap);
        });

        setMap(leafletMap);

        if (initialLocation?.latitude && initialLocation?.longitude) {
            addMarker(
                leafletMap,
                initialLocation.latitude,
                initialLocation.longitude,
                initialLocation.name,
            );
            leafletMap.setView(
                [initialLocation.latitude, initialLocation.longitude],
                15,
            );
        }

        return () => leafletMap.remove();
    }, []);

    const addMarker = (mapInstance, lat, lon, title) => {
        if (markerRef.current) {
            mapInstance.removeLayer(markerRef.current);
        }

        const marker = L.marker([lat, lon], {
            icon: L.icon({
                iconUrl: new URL(
                    "leaflet/dist/images/marker-icon.png",
                    import.meta.url,
                ).href,
                iconRetinaUrl: new URL(
                    "leaflet/dist/images/marker-icon-2x.png",
                    import.meta.url,
                ).href,
                shadowUrl: new URL(
                    "leaflet/dist/images/marker-shadow.png",
                    import.meta.url,
                ).href,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            }),
        }).addTo(mapInstance);

        const popup = document.createElement("div");
        popup.className = "font-medium text-sm";
        popup.textContent = title || "Selected Location";

        marker.bindPopup(popup).openPopup();
        markerRef.current = marker;
    };

    const searchRequestRef = useRef(null);

    useEffect(() => {
        const query = searchQuery.trim();

        if (query.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            setIsSearching(false);
            setError("");
            return;
        }

        const timeoutId = setTimeout(async () => {
            setError("");
            setIsSearching(true);
            setShowDropdown(true);

            if (searchRequestRef.current) {
                searchRequestRef.current.abort();
            }

            const controller = new AbortController();
            searchRequestRef.current = controller;

            try {
                const response = await fetch(
                    `/api/geocoding/search?q=${encodeURIComponent(query)}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error("Search request failed.");
                }

                const results = await response.json();

                if (controller.signal.aborted) {
                    return;
                }

                if (!results || results.length === 0) {
                    setError("No locations found. Try a different search.");
                    setSearchResults([]);
                } else {
                    setSearchResults(results);
                    setError("");
                }
            } catch (err) {
                if (err.name === "AbortError") {
                    return;
                }

                console.error("Search failed:", err);
                setError("Search failed. Please try again.");
                setSearchResults([]);
            } finally {
                if (!controller.signal.aborted) {
                    setIsSearching(false);
                }
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSelectResult = async (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setSearchQuery(result.name || "");
        setShowDropdown(false);
        await processLocation(lat, lon, map);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (searchResults.length > 0) {
                handleSelectResult(searchResults[0]);
            } else if (searchQuery.trim()) {
                setError(
                    "No results found. Please select from dropdown or click on map.",
                );
            }
        }
    };

    const processLocation = async (lat, lon, mapInstance) => {
        try {
            const reverseResponse = await fetch(
                `/api/geocoding/reverse?lat=${lat}&lon=${lon}`,
            );
            const addressData = await reverseResponse.json();
            const parsed = parseAddress(addressData, locationMode);

            const locationData = {
                latitude: lat,
                longitude: lon,
                city: parsed.city,
                area: parsed.area,
                address: parsed.address,
                name: parsed.name,
            };

            setSelectedLocation(locationData);
            onLocationSelect(locationData);
            setShowDropdown(false);
            setError("");

            if (mapInstance) {
                addMarker(mapInstance, lat, lon, parsed.name);
                mapInstance.setView([lat, lon], 15);
            }
        } catch (err) {
            console.error("Location processing failed:", err);
            setError("Failed to process location. Please try again.");
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setShowDropdown(false);
        setError("");
    };

    return (
        <div className="w-full space-y-4">
            <div className="relative">
                <div className="flex items-center gap-2 border border-[color:var(--color-border)] rounded-[var(--radius-md)] px-3 py-2.5 bg-[color:var(--color-bg-primary)] transition-all focus-within:border-[color:var(--color-primary-500)] focus-within:ring-1 focus-within:ring-[color:var(--color-primary-100)]">
                    {isSearching ? (
                        <Loader
                            size={18}
                            className="text-[color:var(--color-primary-500)] animate-spin flex-shrink-0"
                        />
                    ) : (
                        <Search
                            size={18}
                            className="text-[color:var(--color-text-muted)] flex-shrink-0"
                        />
                    )}
                    <input
                        type="text"
                        placeholder="Search location or click on map..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }}
                        onKeyPress={handleKeyPress}
                        onFocus={() =>
                            searchResults.length > 0 && setShowDropdown(true)
                        }
                        className="flex-1 outline-none bg-transparent text-[color:var(--color-text-primary)] placeholder-[color:var(--color-text-muted)]"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="p-1 hover:bg-[color:var(--color-bg-secondary)] rounded transition-colors"
                        >
                            <X
                                size={18}
                                className="text-[color:var(--color-text-muted)]"
                            />
                        </button>
                    )}
                </div>

                {error && (
                    <div
                        className="absolute top-full left-0 right-0 mt-2 bg-[color:var(--color-danger-50)] border border-[color:var(--color-danger-200)] rounded-[var(--radius-md)] p-3 flex items-start gap-2"
                        style={{ zIndex: "var(--z-dropdown)" }}
                    >
                        <AlertCircle
                            size={16}
                            className="text-[color:var(--color-danger-500)] mt-0.5 flex-shrink-0"
                        />
                        <p className="text-xs text-[color:var(--color-danger-600)]">
                            {error}
                        </p>
                    </div>
                )}

                {showDropdown && searchResults.length > 0 && (
                    <div
                        className="absolute top-full left-0 right-0 mt-2 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] overflow-y-auto max-h-72"
                        style={{ zIndex: "var(--z-dropdown)" }}
                    >
                        {searchResults.map((result, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left px-4 py-3 hover:bg-[color:var(--color-bg-secondary)] border-b border-[color:var(--color-border-light)] last:border-b-0 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <MapPin
                                        size={16}
                                        className="text-[color:var(--color-primary-500)] mt-0.5 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[color:var(--color-text-primary)] truncate">
                                            {result.name}
                                        </p>
                                        <p className="text-xs text-[color:var(--color-text-muted)] line-clamp-2 mt-0.5">
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
                className="w-full h-96 rounded-[var(--radius-md)] border border-[color:var(--color-border)] overflow-hidden shadow-[var(--shadow-sm)]"
            />

            {selectedLocation && (
                <div className="bg-gradient-to-br from-[color:var(--color-primary-50)] to-[color:var(--color-bg-secondary)] p-4 rounded-[var(--radius-md)] border border-[color:var(--color-primary-200)]">
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <MapPin
                                size={18}
                                className="text-[color:var(--color-primary-600)] mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1">
                                <p className="font-semibold text-[color:var(--color-text-primary)] text-sm">
                                    {selectedLocation.name}
                                </p>
                                <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
                                    {selectedLocation.address}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[color:var(--color-primary-200)]">
                            <div className="bg-[color:var(--color-bg-primary)] p-2.5 rounded-md">
                                <p className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wide">
                                    City
                                </p>
                                <p className="text-sm font-bold text-[color:var(--color-primary-600)] mt-1">
                                    {selectedLocation.city || "—"}
                                </p>
                            </div>
                            <div className="bg-[color:var(--color-bg-primary)] p-2.5 rounded-md">
                                <p className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wide">
                                    Area
                                </p>
                                <p className="text-sm font-bold text-[color:var(--color-primary-600)] mt-1">
                                    {selectedLocation.area || "—"}
                                </p>
                            </div>
                            <div className="bg-[color:var(--color-bg-primary)] p-2.5 rounded-md">
                                <p className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wide">
                                    Coords
                                </p>
                                <p className="text-xs font-mono font-bold text-[color:var(--color-primary-600)] mt-1">
                                    {Number(selectedLocation.latitude).toFixed(
                                        4,
                                    )}
                                    <br />
                                    {Number(selectedLocation.longitude).toFixed(
                                        4,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
