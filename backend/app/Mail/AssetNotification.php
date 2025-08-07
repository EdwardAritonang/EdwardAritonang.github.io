<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AssetNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $asset;
    public $type;
    public $message;

    public function __construct($asset, $type, $message)
    {
        $this->asset = $asset;
        $this->type = $type;
        $this->message = $message;
    }

    public function build()
    {
        return $this->subject("Asset Notification: {$this->type}")
                    ->view('emails.asset-notification')
                    ->with([
                        'asset' => $this->asset,
                        'type' => $this->type,
                        'message' => $this->message
                    ]);
    }
}