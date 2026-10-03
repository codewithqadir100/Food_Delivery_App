import { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import { Star, TrendingUp } from "lucide-react";
import Button from "@/Components/Common/Button";
import EmptyState from "@/Components/Common/EmptyState";
import { StarRow } from "@/Components/Common/StarRating";
import ReviewHelpfulButton from "@/Components/Customer/ReviewHelpfulButton";
import ReviewResponse from "@/Components/Customer/ReviewResponse";
import usePolledFeed from "@/Hooks/usePolledFeed";
import {
    REVIEW_SORTS,
    formatRating,
    formatReviewCount,
    reviewAge,
    starShare,
} from "@/Utils/reviews";

export default function RestaurantReviewsPanel({
    restaurantId,
    restaurantName,
    restaurantLogo = null,
    initialSummary = null,
    initialReviews = [],
    initialSort = "top",
    initialHasMore = false,
    feedRoute,
    viewer = "customer",
    enabled = true,
}) {
    const [summary, setSummary] = useState(
        initialSummary ?? { average: null, count: 0, distribution: {}, improving: false },
    );
    const [reviews, setReviews] = useState(initialReviews);
    const [sort, setSort] = useState(initialSort);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(initialReviews.length === 0);
    const expanded = useRef(false);
    const page = useRef(1);
    const sortReady = useRef(false);

    const applyPage = (data, { replace }) => {
        setSummary(data.summary);
        setHasMore(Boolean(data.has_more));
        setLoading(false);

        if (replace || !expanded.current) {
            page.current = data.page ?? 1;
            setReviews(data.reviews ?? []);
            return;
        }

        setReviews((current) =>
            current.map((review) => {
                const next = (data.reviews ?? []).find((item) => item.id === review.id);
                return next ?? review;
            }),
        );
    };

    usePolledFeed(
        enabled,
        route(feedRoute, { restaurant: restaurantId, sort }),
        () => ({ page: 1 }),
        (data) => applyPage(data, { replace: !expanded.current }),
    );

    useEffect(() => {
        expanded.current = false;
        page.current = 1;

        if (!sortReady.current) {
            sortReady.current = true;
            return;
        }

        setReviews([]);
        setLoading(true);
    }, [sort]);

    const showMore = async () => {
        const nextPage = page.current + 1;
        setLoadingMore(true);

        try {
            const { data } = await axios.get(
                route(feedRoute, { restaurant: restaurantId, sort, page: nextPage }),
            );
            expanded.current = true;
            page.current = nextPage;
            setHasMore(Boolean(data.has_more));
            setReviews((current) => {
                const ids = new Set(current.map((review) => review.id));
                return [...current, ...(data.reviews ?? []).filter((review) => !ids.has(review.id))];
            });
        } finally {
            setLoadingMore(false);
        }
    };

    const toggleHelpful = async (reviewId) => {
        const previous = reviews;
        setReviews((current) =>
            current.map((review) => {
                if (review.id !== reviewId) {
                    return review;
                }

                const marked = !review.marked_helpful;

                return {
                    ...review,
                    marked_helpful: marked,
                    helpful_count: Math.max(0, review.helpful_count + (marked ? 1 : -1)),
                };
            }),
        );

        try {
            const { data } = await axios.post(route("customer.reviews.helpful", reviewId));
            setReviews((current) =>
                current.map((review) =>
                    review.id === reviewId ? { ...review, ...data.data } : review,
                ),
            );
        } catch {
            setReviews(previous);
        }
    };

    const average = formatRating(summary.average);
    const countLabel = formatReviewCount(summary.count);

    return (
        <div className="space-y-4">
            {restaurantName && viewer === "customer" && (
                <p className="text-sm text-[color:var(--color-text-muted)]">Reviews</p>
            )}

            {summary.improving && (
                <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-primary-50)] px-4 py-3 text-sm font-medium text-[color:var(--color-primary-700)]">
                    <TrendingUp size={16} className="shrink-0" />
                    This restaurant is getting better reviews!
                </div>
            )}

            {average && (
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] p-4 sm:p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="shrink-0 sm:w-36">
                            <p className="text-4xl font-bold leading-none text-[color:var(--color-text-primary)]">
                                {average}
                            </p>
                            <StarRow value={summary.average} className="mt-2" />
                            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                                All ratings ({countLabel})
                            </p>
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-2">
                                    <span className="w-3 text-xs font-medium text-[color:var(--color-text-secondary)]">
                                        {star}
                                    </span>
                                    <Star
                                        size={12}
                                        className="fill-[color:var(--color-warning-500)] text-[color:var(--color-warning-500)]"
                                    />
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--color-gray-100)]">
                                        <div
                                            className="h-full rounded-full bg-[color:var(--color-warning-500)]"
                                            style={{
                                                width: `${starShare(summary.distribution, star, summary.count)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="scrollbar-none-mobile -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {REVIEW_SORTS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => setSort(item.key)}
                        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                            sort === item.key
                                ? "bg-[color:var(--color-primary-600)] text-white"
                                : "bg-[color:var(--color-gray-100)] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-gray-200)]"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {loading && reviews.length === 0 ? (
                <div className="space-y-3">
                    {[0, 1, 2].map((item) => (
                        <div
                            key={item}
                            className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[color:var(--color-gray-100)]"
                        />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <EmptyState
                    title={viewer === "customer" && summary.count > 0 ? "No written reviews yet" : "No reviews yet"}
                    description={
                        viewer === "restaurant"
                            ? "Reviews show up here after customers rate a delivered order."
                            : summary.count > 0
                              ? "Ratings are in the summary above. Written reviews show up here."
                              : "Reviews from delivered orders will show up here."
                    }
                />
            ) : (
                <div className="space-y-3">
                    {reviews.map((review) => (
                        <article
                            key={review.id}
                            className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-[color:var(--color-text-primary)]">
                                        {review.customer_name}
                                    </h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <StarRow value={review.rating} />
                                        <span className="text-xs text-[color:var(--color-text-muted)]">
                                            {reviewAge(review.created_at)}
                                        </span>
                                    </div>
                                </div>
                                {viewer === "restaurant" && review.order_id && (
                                    <Link
                                        href={route("restaurant.orders.show", review.order_id)}
                                        className="shrink-0 text-sm font-medium text-[color:var(--color-primary-600)] hover:underline"
                                    >
                                        {review.order_number}
                                    </Link>
                                )}
                            </div>
                            {review.comment && (
                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[color:var(--color-text-secondary)]">
                                    {review.comment}
                                </p>
                            )}
                            {viewer === "customer" && !review.own ? (
                                <div className="mt-2">
                                    <ReviewHelpfulButton
                                        reviewId={review.id}
                                        count={review.helpful_count}
                                        marked={review.marked_helpful}
                                        onToggle={toggleHelpful}
                                    />
                                </div>
                            ) : (
                                review.helpful_count > 0 && (
                                    <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">
                                        Helpful {review.helpful_count}
                                    </p>
                                )
                            )}
                            <ReviewResponse
                                review={review}
                                restaurantName={restaurantName}
                                restaurantLogo={restaurantLogo}
                                viewer={viewer}
                                onReplied={(updated) => {
                                    setReviews((current) =>
                                        current.map((item) =>
                                            item.id === updated.id
                                                ? { ...item, ...updated }
                                                : item,
                                        ),
                                    );
                                }}
                            />
                        </article>
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        variant="secondary"
                        size="sm"
                        loading={loadingMore}
                        onClick={showMore}
                    >
                        Show more
                    </Button>
                </div>
            )}
        </div>
    );
}
