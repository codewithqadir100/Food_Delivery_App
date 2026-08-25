import HomeLayout from "../Layouts/layout.jsx";
import Navbar from "../Components/Navbar.jsx";
import { Head } from "@inertiajs/react";

export default function Home() {
    return (
        <>
        <Navbar></Navbar>
        <HomeLayout>
            <Head title="Home Page" />

            <div className="underline text-red-600">
                Hello
            </div>
        </HomeLayout>
        </>
    );
}