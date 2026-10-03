import Card from "@/Components/Common/Card";
import HorizontalCarousel from "@/Components/Common/HorizontalCarousel";
import { StarRow } from "@/Components/Common/StarRating";

const SPOTLIGHT_COUNT = 10;

export default function MenuReviewSpotlight({ restaurantId, reviews = [] }) {
    if (!Array.isArray(reviews) || reviews.length < SPOTLIGHT_COUNT) {
        return null;
    }

    const openReviews = () => {
        window.dispatchEvent(
            new CustomEvent("open-restaurant-reviews", {
                detail: { restaurantId },
            }),
        );
    };

    return (
        <section
            aria-labelledby="menu-review-spotlight-title"
            className="menu-review-spotlight"
        >
            <div className="mb-[var(--spacing-5)] flex items-start justify-between gap-[var(--spacing-4)]">
                <div className="min-w-0">
                    <h2 id="menu-review-spotlight-title" className="menu-review-spotlight-title">
                        What people are saying
                    </h2>
                    <p className="menu-review-spotlight-subtitle">
                        A few words from people who ordered here.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openReviews}
                    className="menu-review-spotlight-link pt-1"
                >
                    See all
                </button>
            </div>

            <HorizontalCarousel gapClassName="gap-[var(--spacing-4)]" snap>
                {reviews.slice(0, SPOTLIGHT_COUNT).map((review) => (
                    <Card
                        key={review.id}
                        padding="md"
                        shadow={true}
                        className="menu-review-card"
                        aria-label={`${review.customer_name}, ${review.rating} out of 5`}
                    >
                        <h3 className="menu-review-card-name">
                            {review.customer_name}
                        </h3>
                        <StarRow value={review.rating} size={14} className="mt-[var(--spacing-2)]" />
                        <p className="menu-review-card-comment">
                            {review.comment}
                        </p>
                    </Card>
                ))}
            </HorizontalCarousel>
        </section>
    );
}
