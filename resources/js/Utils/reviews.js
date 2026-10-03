export const REVIEW_SORTS = [
    { key: "top", label: "Top reviews" },
    { key: "newest", label: "Newest" },
    { key: "highest", label: "Highest rating" },
    { key: "lowest", label: "Lowest rating" },
];

export const REVIEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function formatReviewCount(count) {
    const total = Number(count) || 0;

    if (total <= 0) {
        return null;
    }

    if (total < 100) {
        return String(total);
    }

    return `${Math.floor(total / 100) * 100}+`;
}

export function formatRating(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        return null;
    }

    return number.toFixed(1);
}

export function reviewAge(value) {
    const then = new Date(value).getTime();

    if (!Number.isFinite(then)) {
        return "";
    }

    const seconds = Math.max(0, (Date.now() - then) / 1000);

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return days === 1 ? "1 day ago" : `${days} days ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return months === 1 ? "1 month ago" : `${months} months ago`;
    }

    const years = Math.floor(days / 365);

    return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function canWriteReview(order) {
    if (!order || order.status !== "delivered" || !order.delivered_at) {
        return false;
    }

    return Date.now() - new Date(order.delivered_at).getTime() <= REVIEW_WINDOW_MS;
}

export function starShare(distribution, star, total) {
    const count = Number(distribution?.[star] ?? 0);

    if (!total || count <= 0) {
        return 0;
    }

    return Math.max(6, Math.round((count / total) * 100));
}
