<?php

declare(strict_types=1);

use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\ReviewHelpful;
use App\Models\User;
use App\Services\ReviewService;
use Inertia\Testing\AssertableInertia as Assert;

function orderReadyForReview(Restaurant $restaurant, ?User $customer = null, string $status = Order::STATUS_PENDING): Order
{
    $customer ??= reviewCustomer();
    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);

    return Order::query()->create([
        'customer_id' => $customer->id,
        'restaurant_id' => $restaurant->id,
        'customer_address_id' => $address->id,
        'status' => $status,
        'subtotal' => 500,
        'delivery_fee' => 100,
        'total' => 600,
    ]);
}

function reviewCustomer(string $name = 'Farzeen Ali'): User
{
    return User::factory()->create([
        'name' => $name,
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
}

function deliveredReviewOrder(Restaurant $restaurant, ?User $customer = null, ?DateTimeInterface $deliveredAt = null): Order
{
    $customer ??= reviewCustomer();

    $order = orderReadyForReview($restaurant, $customer, Order::STATUS_DELIVERED);
    $order->update([
        'delivered_at' => $deliveredAt ?? now()->subMinutes(ReviewService::PROMPT_DELAY_MINUTES + 1),
    ]);

    return $order->refresh();
}

test('a customer can review a delivered order once and update it inside the window', function () {
    $restaurant = Restaurant::factory()->create();
    $customer = reviewCustomer();
    $order = deliveredReviewOrder($restaurant, $customer);

    $this->actingAs($customer)
        ->postJson(route('customer.orders.review.store', $order), [
            'rating' => 5,
            'comment' => '  Still thinking about it  ',
        ])
        ->assertOk()
        ->assertJsonPath('review.rating', 5)
        ->assertJsonPath('review.customer_name', 'Farzeen')
        ->assertJsonPath('summary.count', 1)
        ->assertJsonPath('summary.average', 5);

    expect(Review::query()->count())->toBe(1);

    $this->actingAs($customer)
        ->postJson(route('customer.orders.review.store', $order), [
            'rating' => 4,
            'comment' => '   ',
        ])
        ->assertOk()
        ->assertJsonPath('review.rating', 4)
        ->assertJsonPath('review.comment', null);

    expect(Review::query()->count())->toBe(1);
    expect($order->review()->first()->comment)->toBeNull();
});

test('reviews are refused outside the window and for someone elses order', function () {
    $restaurant = Restaurant::factory()->create();
    $customer = reviewCustomer();
    $other = reviewCustomer('Other Person');
    $pending = orderReadyForReview($restaurant, $customer);
    $fresh = deliveredReviewOrder($restaurant, $customer, now()->subMinutes(2));
    $expired = deliveredReviewOrder($restaurant, $customer, now()->subDays(8));

    $this->actingAs($customer)
        ->postJson(route('customer.orders.review.store', $pending), ['rating' => 5])
        ->assertForbidden();

    $this->actingAs($customer)
        ->postJson(route('customer.orders.review.store', $expired), ['rating' => 5])
        ->assertForbidden();

    $this->actingAs($other)
        ->postJson(route('customer.orders.review.store', $fresh), ['rating' => 5])
        ->assertForbidden();

    $this->actingAs($customer)
        ->postJson(route('customer.orders.review.store', $fresh), ['rating' => 9])
        ->assertStatus(422);

    expect(Review::query()->count())->toBe(0);
});

test('the review prompt waits five minutes, stays available after one skip, and stops after two', function () {
    $restaurant = Restaurant::factory()->create(['name' => 'Hamid Biryani']);
    $customer = reviewCustomer();
    deliveredReviewOrder($restaurant, $customer, now()->subMinutes(4));
    $ready = deliveredReviewOrder($restaurant, $customer);

    $this->actingAs($customer)
        ->getJson(route('customer.reviews.prompt'))
        ->assertOk()
        ->assertJsonPath('order.id', $ready->id)
        ->assertJsonPath('order.restaurant_name', 'Hamid Biryani')
        ->assertJsonPath('order.dismissals', 0);

    $this->actingAs($customer)
        ->postJson(route('customer.orders.review.skip', $ready))
        ->assertOk();

    expect($ready->refresh()->review_prompt_dismissals)->toBe(1);

    $this->actingAs($customer)
        ->getJson(route('customer.reviews.prompt'))
        ->assertJsonPath('order.id', $ready->id)
        ->assertJsonPath('order.dismissals', 1);

    $this->actingAs($customer)
        ->postJson(route('customer.orders.review.skip', $ready))
        ->assertOk();

    $this->actingAs($customer)
        ->getJson(route('customer.reviews.prompt'))
        ->assertJsonPath('order', null);

    expect($ready->refresh()->review_prompt_dismissals)->toBe(2);
});

test('a customer cannot skip someone elses review prompt', function () {
    $restaurant = Restaurant::factory()->create();
    $order = deliveredReviewOrder($restaurant);

    $this->actingAs(reviewCustomer('Someone Else'))
        ->postJson(route('customer.orders.review.skip', $order))
        ->assertForbidden();

    expect($order->refresh()->review_prompt_dismissals)->toBe(0);
});

test('helpful is a toggle and cannot be used on your own review', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $author = reviewCustomer();
    $voter = reviewCustomer('Ayesha Khan');
    $order = deliveredReviewOrder($restaurant, $author);

    $this->actingAs($author)->postJson(route('customer.orders.review.store', $order), [
        'rating' => 5,
        'comment' => 'Loved it',
    ])->assertOk();

    $review = $order->review()->first();

    $this->actingAs($author)
        ->postJson(route('customer.reviews.helpful', $review))
        ->assertForbidden();

    $this->actingAs($voter)
        ->postJson(route('customer.reviews.helpful', $review))
        ->assertOk()
        ->assertJsonPath('data.marked_helpful', true)
        ->assertJsonPath('data.helpful_count', 1);

    $this->actingAs($voter)
        ->postJson(route('customer.reviews.helpful', $review))
        ->assertOk()
        ->assertJsonPath('data.marked_helpful', false)
        ->assertJsonPath('data.helpful_count', 0);

    expect(ReviewHelpful::query()->count())->toBe(0);
});

test('guests can read reviews and helpful sends them to login', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $order = deliveredReviewOrder($restaurant, reviewCustomer());

    Review::query()->create([
        'order_id' => $order->id,
        'customer_id' => $order->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 5,
        'comment' => 'Worth it',
    ]);

    $review = $order->review()->first();

    $this->getJson(route('customer.restaurants.reviews.feed', $restaurant))
        ->assertOk()
        ->assertJsonPath('reviews.0.customer_name', 'Farzeen')
        ->assertJsonPath('reviews.0.own', false)
        ->assertJsonPath('summary.count', 1);

    $this->get(route('customer.restaurants.reviews', $restaurant))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Customer/RestaurantReviews'));

    $this->get(route('customer.reviews.helpful.login', $review))
        ->assertRedirect(route('login'));

    expect(session('url.intended'))->toBe(route('customer.restaurants.reviews', $restaurant));
});

test('review sorts put the most helpful review first and bucket large counts', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();

    $lowHelp = deliveredReviewOrder($restaurant, reviewCustomer('Sara Noor'), now()->subHour());
    $top = deliveredReviewOrder($restaurant, reviewCustomer('Hina Qureshi'), now()->subMinutes(30));

    $quiet = Review::query()->create([
        'order_id' => $lowHelp->id,
        'customer_id' => $lowHelp->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 5,
        'comment' => 'Fine',
    ]);

    $popular = Review::query()->create([
        'order_id' => $top->id,
        'customer_id' => $top->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 3,
        'comment' => 'Okay',
    ]);

    ReviewHelpful::query()->create([
        'review_id' => $popular->id,
        'customer_id' => reviewCustomer('Voter One')->id,
    ]);
    ReviewHelpful::query()->create([
        'review_id' => $popular->id,
        'customer_id' => reviewCustomer('Voter Two')->id,
    ]);

    $this->getJson(route('customer.restaurants.reviews.feed', ['restaurant' => $restaurant, 'sort' => 'top']))
        ->assertOk()
        ->assertJsonPath('reviews.0.id', $popular->id);

    $this->getJson(route('customer.restaurants.reviews.feed', ['restaurant' => $restaurant, 'sort' => 'highest']))
        ->assertJsonPath('reviews.0.id', $quiet->id);

    $this->getJson(route('customer.restaurants.reviews.feed', ['restaurant' => $restaurant, 'sort' => 'lowest']))
        ->assertJsonPath('reviews.0.id', $popular->id);

    expect(ReviewService::bucketCount(0))->toBeNull();
    expect(ReviewService::bucketCount(99))->toBe('99');
    expect(ReviewService::bucketCount(131))->toBe('100+');
    expect(ReviewService::bucketCount(250))->toBe('200+');
    expect(ReviewService::bucketCount(2000))->toBe('2000+');
});

test('a restaurant with better recent reviews is marked improving', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();

    foreach ([1, 1] as $rating) {
        $order = deliveredReviewOrder($restaurant);
        $review = Review::query()->create([
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'restaurant_id' => $restaurant->id,
            'rating' => $rating,
        ]);
        $review->forceFill(['created_at' => now()->subDays(40)])->save();
    }

    foreach ([5, 5, 5] as $rating) {
        $order = deliveredReviewOrder($restaurant);
        Review::query()->create([
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'restaurant_id' => $restaurant->id,
            'rating' => $rating,
        ]);
    }

    $this->getJson(route('customer.restaurants.reviews.feed', $restaurant))
        ->assertOk()
        ->assertJsonPath('summary.count', 5)
        ->assertJsonPath('summary.average', 3.4)
        ->assertJsonPath('summary.improving', true);
});

test('customers only see reviews that include a comment', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $written = deliveredReviewOrder($restaurant, reviewCustomer('Sara Noor'));
    $ratingOnly = deliveredReviewOrder($restaurant, reviewCustomer('Hina Qureshi'));

    Review::query()->create([
        'order_id' => $written->id,
        'customer_id' => $written->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 5,
        'comment' => 'Loved the biryani',
    ]);

    Review::query()->create([
        'order_id' => $ratingOnly->id,
        'customer_id' => $ratingOnly->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 4,
    ]);

    $this->getJson(route('customer.restaurants.reviews.feed', $restaurant))
        ->assertOk()
        ->assertJsonCount(1, 'reviews')
        ->assertJsonPath('reviews.0.comment', 'Loved the biryani')
        ->assertJsonPath('summary.count', 2)
        ->assertJsonPath('summary.average', 4.5);

    $this->actingAs($restaurant->user)
        ->getJson(route('restaurant.reviews.feed'))
        ->assertOk()
        ->assertJsonCount(2, 'reviews');
});

test('the menu spotlight shows ten written reviews and stays empty below that', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();

    foreach (range(1, 9) as $index) {
        $order = deliveredReviewOrder($restaurant, reviewCustomer('Diner '.$index));
        Review::query()->create([
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'restaurant_id' => $restaurant->id,
            'rating' => 3,
            'comment' => 'Note '.$index,
        ]);
    }

    $this->getJson(route('api.restaurant.menu', $restaurant))
        ->assertOk()
        ->assertJsonCount(0, 'data.review_spotlight');

    $top = deliveredReviewOrder($restaurant, reviewCustomer('Top Diner'));
    Review::query()->create([
        'order_id' => $top->id,
        'customer_id' => $top->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 5,
        'comment' => 'The one to show',
    ]);

    $silent = deliveredReviewOrder($restaurant, reviewCustomer('Quiet Guest'));
    Review::query()->create([
        'order_id' => $silent->id,
        'customer_id' => $silent->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 5,
    ]);

    $this->getJson(route('api.restaurant.menu', $restaurant))
        ->assertOk()
        ->assertJsonCount(10, 'data.review_spotlight')
        ->assertJsonPath('data.review_spotlight.0.comment', 'The one to show')
        ->assertJsonPath('data.review_spotlight.0.customer_name', 'Top')
        ->assertJsonMissing(['comment' => null]);
});

test('closed restaurants do not expose a reviews page', function () {
    $restaurant = Restaurant::factory()->subscribed()->closed()->create();

    $this->get(route('customer.restaurants.reviews', $restaurant))->assertNotFound();
});

test('listing cards include the real rating and review count', function () {
    $restaurant = Restaurant::factory()->subscribed()->create(['name' => 'Rated Kitchen']);
    $order = deliveredReviewOrder($restaurant);

    Review::query()->create([
        'order_id' => $order->id,
        'customer_id' => $order->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 4,
    ]);

    $card = collect($this->getJson('/api/restaurants')->json('data'))
        ->firstWhere('name', 'Rated Kitchen');

    expect($card['rating'])->toEqual(4);
    expect($card['review_count'])->toBe(1);
});

test('the order page tells the customer when they can still review', function () {
    $restaurant = Restaurant::factory()->create();
    $customer = reviewCustomer();
    $open = deliveredReviewOrder($restaurant, $customer);
    $closed = deliveredReviewOrder($restaurant, $customer, now()->subDays(8));

    $this->actingAs($customer)
        ->get(route('customer.orders.show', $open))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('can_review', true));

    $this->actingAs($customer)
        ->get(route('customer.orders.show', $closed))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('can_review', false));
});

test('a restaurant sees only its own reviews with the order number', function () {
    $restaurant = Restaurant::factory()->create();
    $other = Restaurant::factory()->create();
    $order = deliveredReviewOrder($restaurant, reviewCustomer());
    $foreign = deliveredReviewOrder($other, reviewCustomer('Other Diner'));

    Review::query()->create([
        'order_id' => $order->id,
        'customer_id' => $order->customer_id,
        'restaurant_id' => $restaurant->id,
        'rating' => 5,
        'comment' => 'Excellent',
    ]);

    Review::query()->create([
        'order_id' => $foreign->id,
        'customer_id' => $foreign->customer_id,
        'restaurant_id' => $other->id,
        'rating' => 1,
        'comment' => 'Hidden',
    ]);

    $this->actingAs($restaurant->user)
        ->get(route('restaurant.reviews.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Restaurant/Reviews')
            ->has('reviews', 1)
            ->where('reviews.0.order_number', $order->order_number)
            ->where('reviews.0.customer_name', 'Farzeen')
            ->where('sort', 'newest'));

    $this->actingAs($other->user)
        ->getJson(route('restaurant.reviews.feed'))
        ->assertOk()
        ->assertJsonPath('reviews.0.comment', 'Hidden')
        ->assertJsonMissing(['comment' => 'Excellent']);
});

test('an unapproved restaurant is sent back from the reviews page', function () {
    $restaurant = Restaurant::factory()->pending()->create();

    $this->actingAs($restaurant->user)
        ->get(route('restaurant.reviews.index'))
        ->assertRedirect(route('restaurant.dashboard'));
});
