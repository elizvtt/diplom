<?php

namespace App\Events;

use App\Models\Invitation;
use App\Models\User;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectInvitationSent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Invitation $invitation,
        public User $inviter
    ) {}

}
