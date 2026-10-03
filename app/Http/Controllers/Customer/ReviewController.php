<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreReviewRequest;
use App\Models\Order;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews) {}

    public function prompt(): JsonResponse
    {
        $order = $this->reviews->promptOrder(Auth::user());

        return response()->json([
            'order' => $order ? $this->reviews->promptPayload($order) : null,
        ]);
    }

    public function seen(): JsonResponse
    {
        return response()->json(['success' => true]);
    }

    public function store(StoreReviewRequest $request, Order $order): JsonResponse
    {
        $this->authorize('review', $order);

        $review = $this->reviews->save(
            $order,
            (int) $request->validated('rating'),
            $request->validated('comment'),
        );

        $review->load('customer:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Thanks for sharing your review.',
            'review' => $this->reviews->present($review),
            'summary' => $this->reviews->summary($order->restaurant),
        ]);
    }

    public function skip(Order $order): JsonResponse
    {
        abort_unless(
            Auth::id() === $order->customer_id && Auth::user()->isCustomer(),
            403,
        );

        $this->reviews->skip($order);

        return response()->json(['success' => true]);
    }

    public function helpful(Review $review): JsonResponse
    {
        $this->authorize('helpful', $review);

        return response()->json([
            'success' => true,
            'data' => $this->reviews->toggleHelpful($review, Auth::user()),
        ]);
    }

    public function loginForHelpful(Review $review): RedirectResponse
    {
        redirect()->setIntendedUrl(route('customer.restaurants.reviews', $review->restaurant_id));

        return redirect()->route('login');
    }
}
