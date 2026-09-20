const EARTH_RADIUS_KM = 6371;

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
};

export const isWithinDeliveryZone = (
    restaurantLat,
    restaurantLon,
    serviceRadiusKm,
    customerLat,
    customerLon,
) => {
    const distance = calculateDistance(
        restaurantLat,
        restaurantLon,
        customerLat,
        customerLon,
    );
    return distance <= serviceRadiusKm;
};

export const calculateDeliveryCharge = (distance, baseFee, perKmFee) => {
    return baseFee + Math.ceil(distance * perKmFee);
};

const toRad = (degrees) => (degrees * Math.PI) / 180;
