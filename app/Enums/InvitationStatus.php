<?php

namespace App\Enums;

enum InvitationStatus: string
{
    case Pending = 'pending';   // Ожидает ответа (ссылка активна)
    case Accepted = 'accepted'; // Принято (пользователь присоединился)
    case Expired = 'expired';   // Просрочено (время вышло)
    case Revoked = 'revoked';   // Отозвано (создатель передумал и удалил инвайт)
}