import axios from "axios";
import { router } from "@inertiajs/react";

export function showFavouriteNotice(message) {
    window.dispatchEvent(
        new CustomEvent("favourite-notice", { detail: { message } }),
    );
}

export async function saveFavourite(restaurantId) {
    const response = await axios.post(
        route("customer.wishlist.store", restaurantId),
    );

    router.reload({ only: ["auth"] });
    showFavouriteNotice(response.data.message);

    return response.data;
}

export async function removeFavourite(restaurantId) {
    const response = await axios.delete(
        route("customer.wishlist.destroy", restaurantId),
    );

    router.reload({ only: ["auth"] });
    showFavouriteNotice(response.data.message);

    return response.data;
}
