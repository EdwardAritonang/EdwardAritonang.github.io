<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $type;
    public $message;

    public function __construct($ticket, $type, $message)
    {
        $this->ticket = $ticket;
        $this->type = $type;
        $this->message = $message;
    }

    public function build()
    {
        return $this->subject("Ticket Notification: {$this->type}")
                    ->view('emails.ticket-notification')
                    ->with([
                        'ticket' => $this->ticket,
                        'type' => $this->type,
                        'message' => $this->message
                    ]);
    }
}