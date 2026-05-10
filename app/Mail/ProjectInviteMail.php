<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Створюємо екземпляр листа.
     */
    public function __construct(
        public Invitation $invitation
    ) {}

    /**
     * Тема листа.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Запрошення до навчального проєкту',
        );
    }

    /**
     * Вказуємо шлях до шаблону
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.project-invite',
        );
    }
}