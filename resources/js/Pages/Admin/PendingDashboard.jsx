import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Alert from "@/Components/Common/Alert";
import Card from "@/Components/Common/Card";
import { StatusBadge } from "@/Components/Restaurant/Dashboard";

export default function PendingDashboard() {
    return (
        <>
            <Head title="Pending Approval" />
            <AdminLayout
                title="Account pending"
                subtitle="Your admin access is waiting for super admin approval."
            >
                <Card>
                    <div className="space-y-4">
                        <StatusBadge status="pending" />
                        <Alert
                            type="warning"
                            title="Waiting for approval"
                            message="You can log in, but restaurant and admin verification tools will be available after a super admin approves your account."
                            closeable={false}
                        />
                    </div>
                </Card>
            </AdminLayout>
        </>
    );
}
