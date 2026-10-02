import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SNAPSHOT_ZOOM = 16;

function markerIcon() {
    return L.icon({
        iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
            .href,
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
        shadowSize: [41, 41],
    });
}

export default function LocationSnapshot({ latitude, longitude, label }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const lat = Number(latitude);
        const lng = Number(longitude);
        const container = containerRef.current;

        if (!container || Number.isNaN(lat) || Number.isNaN(lng)) {
            return undefined;
        }

        const map = L.map(container, {
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            touchZoom: false,
        }).setView([lat, lng], SNAPSHOT_ZOOM);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        L.marker([lat, lng], {
            icon: markerIcon(),
            keyboard: false,
            title: label || "Restaurant",
        }).addTo(map);

        const frame = requestAnimationFrame(() => map.invalidateSize());

        return () => {
            cancelAnimationFrame(frame);
            map.remove();
        };
    }, [latitude, longitude, label]);

    return (
        <div
            ref={containerRef}
            className="h-40 w-full overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-bg-tertiary)]"
            role="img"
            aria-label={label ? `Map of ${label}` : "Restaurant location"}
        />
    );
}
