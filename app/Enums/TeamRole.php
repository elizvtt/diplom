<?php

namespace App\Enums;

enum TeamRole: string
{
    case Owner = 'owner';
    case Editor = 'editor';
    case Spectator = 'spectator';
}