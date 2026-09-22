import Button from "@/Components/Common/Button";

export default function RestaurantPagination({ pagination, onPageChange }) {
    if (pagination.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-[var(--spacing-3)] pt-[var(--spacing-8)]">
            <Button
                variant="secondary"
                size="md"
                disabled={pagination.current_page === 1}
                onClick={() => onPageChange(pagination.current_page - 1)}
            >
                Previous
            </Button>

            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
                (page) => (
                    <Button
                        key={page}
                        variant={
                            page === pagination.current_page
                                ? "primary"
                                : "secondary"
                        }
                        size="md"
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </Button>
                ),
            )}

            <Button
                variant="secondary"
                size="md"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => onPageChange(pagination.current_page + 1)}
            >
                Next
            </Button>
        </div>
    );
}
