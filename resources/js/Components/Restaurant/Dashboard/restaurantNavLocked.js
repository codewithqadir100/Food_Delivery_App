export function isRestaurantNavLocked(key, { isApproved = false, onboardingComplete = false } = {}) {
    if (key === "dashboard" || key === "menu" || key === "profile") {
        return false;
    }

    if (key === "subscription") {
        return !onboardingComplete;
    }

    if (key === "orders" || key === "analytics" || key === "settings") {
        return !isApproved;
    }

    return false;
}
