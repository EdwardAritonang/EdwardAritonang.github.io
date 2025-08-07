<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'asset_id',
        'title',
        'description',
        'status',
        'priority',
        'assigned_technician'
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}