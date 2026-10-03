export const CANCELLED_BY_CUSTOMER = "customer";
export const CANCELLED_BY_RESTAURANT = "restaurant";

export const CUSTOMER_CANCELLABLE_STATUSES = ["pending", "confirmed"];

function applyStatusUpdate(order, update) {
    const same =
        order.status === update.status &&
        (order.cancelled_by ?? null) === (update.cancelled_by ?? null) &&
        (order.cancellation_reason ?? null) ===
            (update.cancellation_reason ?? null);

    if (same) return order;

    return {
        ...order,
        status: update.status,
        cancelled_by: update.cancelled_by ?? null,
        cancellation_reason: update.cancellation_reason ?? null,
        cancelled_at: update.cancelled_at ?? order.cancelled_at ?? null,
        confirmed_at: update.confirmed_at ?? order.confirmed_at ?? null,
        delivered_at: update.delivered_at ?? order.delivered_at ?? null,
    };
}

export function mergeOrderUpdates(orders, updates, { status = "all" } = {}) {
    if (!Array.isArray(orders) || orders.length === 0) {
        return orders ?? [];
    }

    if (!Array.isArray(updates) || updates.length === 0) {
        return orders;
    }

    const byId = new Map(updates.map((update) => [update.id, update]));
    let changed = false;
    const next = [];

    for (const order of orders) {
        const update = byId.get(order.id);
        const merged = update ? applyStatusUpdate(order, update) : order;

        if (merged !== order) {
            changed = true;
        }

        if (status !== "all" && merged.status !== status) {
            changed = true;
            continue;
        }

        next.push(merged);
    }

    return changed ? next : orders;
}
