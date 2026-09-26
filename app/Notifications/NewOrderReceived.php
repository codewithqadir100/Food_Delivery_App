<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;

class NewOrderReceived extends Notification
{
    public function __construct(private readonly Order $order)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total' => (float) $this->order->total,
            'message' => "New order {$this->order->order_number} received.",
        ];
    }
}
