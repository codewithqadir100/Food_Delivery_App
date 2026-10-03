import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { MapPin, Plus } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import Alert from "@/Components/Common/Alert";
import Badge from "@/Components/Common/Badge";
import Button from "@/Components/Common/Button";
import Card from "@/Components/Common/Card";
import EmptyState from "@/Components/Common/EmptyState";
import Modal from "@/Components/Common/Modal";

export default function AddressIndex({ addresses = [] }) {
    const { flash = {} } = usePage().props;
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const remove = () => {
        if (!pendingDelete) {
            return;
        }

        setDeleting(true);
        router.delete(route("customer.addresses.destroy", pendingDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setPendingDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="My Addresses" />
            <AppLayout>
                <div className="mx-auto flex max-w-3xl flex-col gap-[var(--spacing-6)]">
                    <div className="flex flex-col gap-[var(--spacing-4)] sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="restaurant-main-heading">
                                My Addresses
                            </h1>
                            <p className="mt-1 max-w-xl text-sm text-[color:var(--color-text-muted)]">
                                Your first saved address stays primary and is
                                used to find nearby restaurants. At checkout you
                                can deliver to any address in this list.
                            </p>
                        </div>
                        {addresses.length > 0 && (
                            <Button
                                icon={Plus}
                                onClick={() =>
                                    router.visit(
                                        route("customer.addresses.create"),
                                    )
                                }
                            >
                                Add address
                            </Button>
                        )}
                    </div>

                    {flash.success && (
                        <Alert type="success" message={flash.success} />
                    )}

                    {addresses.length === 0 ? (
                        <Card padding="lg">
                            <EmptyState
                                icon={MapPin}
                                iconSize={36}
                                iconWrapClassName="h-24 w-24 bg-[color:var(--color-primary-50)]"
                                iconClassName="text-[color:var(--color-primary-500)]"
                                title="No addresses saved"
                                description="Add a delivery address so restaurants near you show up, and so you can check out."
                                action={
                                    <Button
                                        icon={Plus}
                                        onClick={() =>
                                            router.visit(
                                                route(
                                                    "customer.addresses.create",
                                                ),
                                            )
                                        }
                                    >
                                        Add address
                                    </Button>
                                }
                            />
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-[var(--spacing-4)]">
                            {addresses.map((address) => (
                                <Card key={address.id} padding="lg">
                                    <div className="flex flex-col gap-[var(--spacing-4)] sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex min-w-0 gap-[var(--spacing-3)]">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-600)]">
                                                <MapPin size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                                                        {
                                                            address.street_address
                                                        }
                                                    </h2>
                                                    {address.is_primary && (
                                                        <Badge
                                                            variant="success"
                                                            size="sm"
                                                        >
                                                            Primary
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                                                    {address.area_name},{" "}
                                                    {address.city_name}
                                                </p>
                                                {address.is_primary && (
                                                    <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                                                        Used to find nearby
                                                        restaurants.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-2 sm:pt-1">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            "customer.addresses.edit",
                                                            address.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() =>
                                                    setPendingDelete(address)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <Modal
                    isOpen={pendingDelete !== null}
                    onClose={() => {
                        if (!deleting) {
                            setPendingDelete(null);
                        }
                    }}
                    title="Remove this address?"
                    size="sm"
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                disabled={deleting}
                                onClick={() => setPendingDelete(null)}
                            >
                                Keep it
                            </Button>
                            <Button
                                variant="danger"
                                loading={deleting}
                                onClick={remove}
                            >
                                Remove
                            </Button>
                        </div>
                    }
                >
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                        {pendingDelete?.is_primary && addresses.length > 1
                            ? "This is your primary address. The oldest saved address will become primary."
                            : "This address will be removed from your account and from checkout."}
                    </p>
                </Modal>
            </AppLayout>
        </>
    );
}
