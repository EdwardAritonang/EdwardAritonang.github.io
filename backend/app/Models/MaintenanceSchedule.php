<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'maintenance_type',
        'scheduled_date',
        'completed_date',
        'technician_id',
        'description',
        'status',
        'cost',
        'notes',
        'next_maintenance_date'
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'completed_date' => 'datetime',
        'next_maintenance_date' => 'datetime'
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function getStatusColorAttribute()
    {
        $colors = [
            'scheduled' => 'bg-blue-100 text-blue-800',
            'in_progress' => 'bg-yellow-100 text-yellow-800',
            'completed' => 'bg-green-100 text-green-800',
            'cancelled' => 'bg-red-100 text-red-800',
            'overdue' => 'bg-red-100 text-red-800'
        ];
        return $colors[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    public function getMaintenanceTypeColorAttribute()
    {
        $colors = [
            'preventive' => 'bg-green-100 text-green-800',
            'corrective' => 'bg-red-100 text-red-800',
            'emergency' => 'bg-orange-100 text-orange-800',
            'upgrade' => 'bg-purple-100 text-purple-800'
        ];
        return $colors[$this->maintenance_type] ?? 'bg-gray-100 text-gray-800';
    }

    public function isOverdue()
    {
        return $this->scheduled_date < now() && $this->status !== 'completed';
    }

    public function isDueSoon()
    {
        return $this->scheduled_date->diffInDays(now()) <= 7 && $this->status === 'scheduled';
    }
}