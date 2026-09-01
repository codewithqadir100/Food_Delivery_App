export default function Navbar(){
    return (
            <nav className="flex justify-between items-center px-3 py-2 bg-blue-400">
                <h3>FoodDeliveryApp</h3>
                <ul className="flex gap-2">
                    <li><a href={ route('customer.dashboard') }>Customer Login</a></li>
                    <li><a href={ route('admin.dashboard') }>Admin Login</a></li>
                    <li><a href={ route('restaurant.dashboard') }>Restaurant Login</a></li>
                </ul>
            </nav>
    );
}