export const formatAddress = (address) => {
    if (!address) return "";
    return `${address.street_address}, ${address.area_name}, ${address.city_name}`;
};

export const isAddressComplete = (address) => {
    return (
        address &&
        address.latitude &&
        address.longitude &&
        address.city_name &&
        address.area_name &&
        address.street_address &&
        address.street_address.trim().length > 5
    );
};

export const getMapCenter = (address) => {
    if (!address) return { lat: 25.2048, lng: 55.2708 };
    return {
        lat: parseFloat(address.latitude),
        lng: parseFloat(address.longitude),
    };
};

export const canOrderFromAddress = (address) => {
    return isAddressComplete(address);
};

export const formatAddressForDisplay = (address) => {
    if (!address) return "No address set";
    return `${address.street_address}, ${address.area_name}, ${address.city_name}`;
};
