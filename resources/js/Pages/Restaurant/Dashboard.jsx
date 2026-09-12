import RestaurantLayout from '@/Layouts/RestaurantLayout';
import { Head } from '@inertiajs/react';

export default function RestaurantDashboard() {
    const restaurantName = "KFC";
    return (
       <RestaurantLayout restaurantName={restaurantName}>
            <Head title={`${restaurantName} Dashboard`}/>
        </RestaurantLayout>
    );
}