<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\ReviewHelpful;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReviewService
{
    public const PROMPT_DELAY_MINUTES = 5;

    public const WINDOW_DAYS = 7;

    public const MAX_DISMISSALS = 2;

    public const COMMENT_MAX = 500;

    public const PER_PAGE = 10;

    public const SPOTLIGHT_LIMIT = 10;

    public const SORTS = ['top', 'newest', 'highest', 'lowest'];

    public function canWrite(Order $order, User $user): bool
    {
        return $user->isCustomer()
            && $user->id === $order->customer_id
            && $order->status === Order::STATUS_DELIVERED
            && $order->delivered_at !== null
            && $order->delivered_at->greaterThanOrEqualTo(now()->subDays(self::WINDOW_DAYS));
    }

    public function promptOrder(User $user): ?Order
    {
        return Order::query()
            ->where('customer_id', $user->id)
            ->where('status', Order::STATUS_DELIVERED)
            ->whereNotNull('delivered_at')
            ->where('delivered_at', '<=', now()->subMinutes(self::PROMPT_DELAY_MINUTES))
            ->where('delivered_at', '>=', now()->subDays(self::WINDOW_DAYS))
            ->where('review_prompt_dismissals', '<', self::MAX_DISMISSALS)
            ->whereDoesntHave('review')
            ->with('restaurant:id,name')
            ->latest('delivered_at')
            ->first();
    }

    public function skip(Order $order): void
    {
        if ($order->review_prompt_dismissals >= self::MAX_DISMISSALS || $order->review()->exists()) {
            return;
        }

        $order->update([
            'review_prompt_dismissals' => $order->review_prompt_dismissals + 1,
            'review_prompt_dismissed_at' => now(),
        ]);
    }

    public function save(Order $order, int $rating, ?string $comment): Review
    {
        $comment = $comment !== null ? trim($comment) : null;

        return Review::query()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'customer_id' => $order->customer_id,
                'restaurant_id' => $order->restaurant_id,
                'rating' => $rating,
                'comment' => $comment === '' ? null : $comment,
            ],
        );
    }

    /**
     * @return array{average: float|null, count: int, distribution: array<int, int>, improving: bool}
     */
    public function summary(Restaurant $restaurant): array
    {
        $rows = $restaurant->reviews()
            ->selectRaw('rating, COUNT(*) as aggregate')
            ->groupBy('rating')
            ->pluck('aggregate', 'rating');

        $distribution = [];
        $count = 0;
        $sum = 0;

        for ($star = 1; $star <= 5; $star++) {
            $total = (int) ($rows[$star] ?? $rows[(string) $star] ?? 0);
            $distribution[$star] = $total;
            $count += $total;
            $sum += $star * $total;
        }

        $average = $count === 0 ? null : round($sum / $count, 1);

        $recentCount = (int) $restaurant->reviews()
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        $recentAverage = $restaurant->reviews()
            ->where('created_at', '>=', now()->subDays(30))
            ->avg('rating');

        $improving = $count >= 5
            && $recentCount >= 3
            && $recentAverage !== null
            && $average !== null
            && round((float) $recentAverage, 1) > $average;

        return [
            'average' => $average,
            'count' => $count,
            'distribution' => $distribution,
            'improving' => $improving,
        ];
    }

    public function list(Restaurant $restaurant, string $sort, int $page, ?User $viewer = null, bool $withOrder = false, bool $commentsOnly = false): LengthAwarePaginator
    {
        $query = $restaurant->reviews()
            ->with('customer:id,name')
            ->withCount('helpfuls');

        if ($commentsOnly) {
            $query->whereNotNull('comment')->where('comment', '!=', '');
        }

        if ($withOrder) {
            $query->with('order:id,order_number');
        }

        if ($viewer?->isCustomer()) {
            $query->withExists([
                'helpfuls as marked_helpful' => fn ($helpful) => $helpful->where('customer_id', $viewer->id),
            ]);
        }

        match ($sort) {
            'newest' => $query->latest(),
            'highest' => $query->orderByDesc('rating')->latest(),
            'lowest' => $query->orderBy('rating')->latest(),
            default => $query->orderByDesc('helpfuls_count')->orderByDesc('rating')->latest(),
        };

        return $query->paginate(self::PER_PAGE, ['*'], 'page', $page);
    }

    /**
     * @return array<string, mixed>
     */
    public function present(Review $review, bool $withOrder = false, ?User $viewer = null): array
    {
        $payload = [
            'id' => $review->id,
            'customer_name' => $review->reviewerFirstName(),
            'rating' => $review->rating,
            'comment' => $review->comment,
            'reply' => $review->reply,
            'replied_at' => $review->replied_at?->toIso8601String(),
            'created_at' => $review->created_at?->toIso8601String(),
            'helpful_count' => (int) ($review->helpfuls_count ?? $review->helpfuls()->count()),
            'marked_helpful' => (bool) ($review->marked_helpful ?? false),
            'own' => $viewer !== null && $viewer->id === $review->customer_id,
        ];

        if ($withOrder) {
            $payload['order_id'] = $review->order_id;
            $payload['order_number'] = $review->order?->order_number;
        }

        return $payload;
    }

    public function reply(Review $review, string $reply): Review
    {
        $review->update([
            'reply' => $reply,
            'replied_at' => now(),
        ]);

        return $review->refresh();
    }

    /**
     * @return array{marked_helpful: bool, helpful_count: int}
     */
    public function toggleHelpful(Review $review, User $user): array
    {
        $existing = ReviewHelpful::query()
            ->where('review_id', $review->id)
            ->where('customer_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $marked = false;
        } else {
            ReviewHelpful::query()->create([
                'review_id' => $review->id,
                'customer_id' => $user->id,
            ]);
            $marked = true;
        }

        return [
            'marked_helpful' => $marked,
            'helpful_count' => $review->helpfuls()->count(),
        ];
    }

    public static function bucketCount(int $count): ?string
    {
        if ($count <= 0) {
            return null;
        }

        if ($count < 100) {
            return (string) $count;
        }

        return (intdiv($count, 100) * 100).'+';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function spotlight(Restaurant $restaurant): array
    {
        $reviews = $restaurant->reviews()
            ->with('customer:id,name')
            ->withCount('helpfuls')
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->orderByDesc('rating')
            ->latest()
            ->limit(self::SPOTLIGHT_LIMIT)
            ->get();

        if ($reviews->count() < self::SPOTLIGHT_LIMIT) {
            return [];
        }

        return $reviews
            ->map(fn (Review $review) => $this->present($review))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function promptPayload(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'restaurant_id' => $order->restaurant_id,
            'restaurant_name' => $order->restaurant?->name,
            'fulfillment_type' => $order->fulfillment_type ?? Order::FULFILLMENT_DELIVERY,
            'dismissals' => (int) $order->review_prompt_dismissals,
        ];
    }
}
