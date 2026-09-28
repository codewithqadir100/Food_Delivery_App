export const FULFILLMENT_DELIVERY = "delivery";
export const FULFILLMENT_PICKUP = "pickup";

export function fulfillmentLabel(type) {
    return type === FULFILLMENT_PICKUP ? "Pickup" : "Delivery";
}
