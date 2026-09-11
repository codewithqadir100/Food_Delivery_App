import Sidebar from '@/Components/Restaurant/Dashboard/Sidebar';
import MobileNav from '@/Components/Restaurant/Dashboard/MobileNav';
import PerformanceChart from '@/Components/Restaurant/Dashboard/PerformanceChart';
import { Head } from '@inertiajs/react';

export default function RestaurantDashboard() {
    return (
        <>
            <Head title="Restaurant Dashboard" />

            <Sidebar></Sidebar>
            <MobileNav/>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Manage your restaurant, menu, and orders here.
                        </div>
                    </div>
                </div>
            </div>
            <PerformanceChart/>
            </>
    );
}