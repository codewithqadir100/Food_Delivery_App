import HomeLayout from "../Layouts/AppLayout.jsx";
import Modal from "../Components/Common/Modal";
import { Head } from "@inertiajs/react";

export default function Home() {
    return (
        <>
        <HomeLayout>
            <Head title="Home Page" />
        </HomeLayout>
        </>
    );
}