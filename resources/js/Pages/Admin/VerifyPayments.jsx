import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Wallet } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import EmptyState from "@/Components/Common/EmptyState";

export default function VerifyPayments({ payments }) {
    const items = payments?.data ?? [];
    const [selectedId, setSelectedId] = useState(null);
    const [processing, setProcessing] = useState(false);
    const selected = items.find((payment) => payment.id === selectedId) ?? null;

    const verify = () => {
        if (!selectedId) {
            return;
        }

        setProcessing(true);
        router.post(
            route("super-admin.payments.verify", selectedId),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setSelectedId(null);
                },
            },
        );
    };

    return (
        <>
            <Head title="Pending Payments" />
            <AdminLayout
                title="Pending payments"
                subtitle="Verifying a payment activates the subscription and approves a pending restaurant. This is payment confirmation, not a separate restaurant review."
            >
                <Modal
                    isOpen={Boolean(selected)}
                    onClose={() => {
                        if (!processing) {
                            setSelectedId(null);
                        }
                    }}
                    title="Verify payment?"
                    closeButton={!processing}
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setSelectedId(null)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="success"
                                loading={processing}
                                onClick={verify}
                            >
                                Verify payment
                            </Button>
                        </>
                    }
                >
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                        Confirm that payment for {selected?.restaurant?.name ?? "this restaurant"} was received. The {selected?.plan?.name ?? "selected"} plan will start, and a pending restaurant will be approved.
                    </p>
                </Modal>

                {items.length === 0 ? (
                    <EmptyState
                        title="No pending payments"
                        description="Paid plan requests will appear here until they are verified."
                        icon={Wallet}
                    />
                ) : (
                    <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-[color:var(--color-border)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--color-text-primary)]">
                                            Restaurant
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--color-text-primary)]">
                                            Plan
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--color-text-primary)]">
                                            Provider
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold text-[color:var(--color-text-primary)]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="border-b border-[color:var(--color-border-light)]"
                                        >
                                            <td className="px-4 py-4 font-medium text-[color:var(--color-text-primary)]">
                                                {payment.restaurant?.name}
                                            </td>
                                            <td className="px-4 py-4 text-[color:var(--color-text-secondary)]">
                                                {payment.plan?.name}
                                                <div className="text-xs">
                                                    Pricing to be announced
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[color:var(--color-text-secondary)]">
                                                {payment.provider}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() =>
                                                        setSelectedId(payment.id)
                                                    }
                                                >
                                                    Verify
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
