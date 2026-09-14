<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $ticketData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $ticketData)
    {
        $this->ticketData = $ticketData;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->ticketData['subject'] ?? 'Réservation confirmée — Billet électronique',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-confirmation',
            with: ['data' => $this->ticketData],
        );
    }
}