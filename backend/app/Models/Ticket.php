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
        'assigned_technician',
        'created_by',
        'due_date',
        'completed_at',
        'category',
        'estimated_hours',
        'actual_hours',
        'cost',
        'notes'
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedTechnician()
    {
        return $this->belongsTo(User::class, 'assigned_technician');
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class);
    }

    public function attachments()
    {
        return $this->hasMany(TicketAttachment::class);
    }

    public function getStatusColorAttribute()
    {
        $colors = [
            'open' => 'bg-blue-100 text-blue-800',
            'in_progress' => 'bg-yellow-100 text-yellow-800',
            'completed' => 'bg-green-100 text-green-800',
            'cancelled' => 'bg-red-100 text-red-800',
            'on_hold' => 'bg-gray-100 text-gray-800'
        ];
        return $colors[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    public function getPriorityColorAttribute()
    {
        $colors = [
            'low' => 'bg-green-100 text-green-800',
            'medium' => 'bg-yellow-100 text-yellow-800',
            'high' => 'bg-orange-100 text-orange-800',
            'urgent' => 'bg-red-100 text-red-800'
        ];
        return $colors[$this->priority] ?? 'bg-gray-100 text-gray-800';
    }
}