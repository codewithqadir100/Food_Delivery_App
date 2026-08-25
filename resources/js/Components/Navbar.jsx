import Home from "@/Pages/home";

export default function Navbar(){
    return (
            <nav className="flex justify-between items-center px-3 py-2 bg-blue-400">
                <h3>FoodDeliveryApp</h3>
                <ul className="flex gap-2">
                    <li>Login</li>
                    <li>Admin Login</li>
                    <li>Restaurant Login</li>
                </ul>
            </nav>
    );
}