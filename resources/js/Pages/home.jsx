import HomeLayout from "../Layouts/AppLayout.jsx";
import Navbar from "../Components/Common/Navbar.jsx";
import Button from "../Components/Common/Button.jsx";
import Card from "../Components/Common/Card.jsx";
import Modal from "../Components/Common/Modal.jsx";
import TextInput from "../Components/Forms/TextInput.jsx";
import Alert from "../Components/Common/Alert.jsx";
import Sidebar from "../Components/Common/Sidebar.jsx";
import { Head } from "@inertiajs/react";

export default function Home() {
    return (
        <>
        <HomeLayout>
            <Head title="Home Page" />

            <div className="underline text-red-600">
                Hello <Button>Get Now This</Button>
            </div>
            <TextInput></TextInput>
            <Card>Hello</Card>

            <div>
                <Modal>This is Modal</Modal>

                <Alert>This is</Alert>
            </div>

        </HomeLayout>
        </>
    );
}