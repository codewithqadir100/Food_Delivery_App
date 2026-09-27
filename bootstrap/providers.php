<?php

use App\Providers\AppServiceProvider;
use App\Providers\EventServiceProvider;
use Laravel\Socialite\SocialiteServiceProvider;

return [
    AppServiceProvider::class,
    EventServiceProvider::class,
    SocialiteServiceProvider::class,
];
