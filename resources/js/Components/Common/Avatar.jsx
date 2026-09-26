import { useMemo, useState } from "react";

// Predefined appealing gradient pairs for initials
const AVATAR_GRADIENTS = [
    "from-amber-500 to-orange-600 text-white",
    "from-emerald-500 to-teal-600 text-white",
    "from-blue-500 to-indigo-600 text-white",
    "from-violet-500 to-purple-600 text-white",
    "from-rose-500 to-pink-600 text-white",
    "from-cyan-500 to-blue-600 text-white",
    "from-orange-500 to-red-600 text-white",
];

function getGradient(name = "") {
    if (!name) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
}

function getInitials(name = "") {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].slice(0, 1).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
    name = "",
    src = null,
    alt = "",
    size = "md",
    className = "",
    border = true,
    shape = "circle", // 'circle' | 'rounded'
}) {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-20 w-20 text-2xl font-bold",
    };

    const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";
    const borderClass = border ? "ring-2 ring-white shadow-sm" : "";
    const initials = useMemo(() => getInitials(name), [name]);
    const gradient = useMemo(() => getGradient(name), [name]);

    const hasValidImage = Boolean(src && !imageError);

    if (hasValidImage) {
        return (
            <div
                className={`relative shrink-0 overflow-hidden bg-[color:var(--color-gray-100)] ${sizeClasses[size] || sizeClasses.md} ${shapeClass} ${borderClass} ${className}`}
            >
                <img
                    src={src}
                    alt={alt || name || "Avatar"}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div
            title={name}
            className={`relative flex shrink-0 items-center justify-center font-bold tracking-wider select-none bg-gradient-to-br ${gradient} ${sizeClasses[size] || sizeClasses.md} ${shapeClass} ${borderClass} ${className}`}
        >
            <span>{initials}</span>
        </div>
    );
}
