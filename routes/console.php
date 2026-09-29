<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('restaurants:expire-subscriptions')->daily();
