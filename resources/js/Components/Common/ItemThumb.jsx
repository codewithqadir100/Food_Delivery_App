export default function ItemThumb({ src, alt = "", className = "w-16" }) {
    return (
        <div
            className={`aspect-square shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)] ${className}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="h-full w-full object-cover"
                />
            ) : null}
        </div>
    );
}
