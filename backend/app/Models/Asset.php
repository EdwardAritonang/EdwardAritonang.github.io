<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_code',
        'asset_type_id',
        'serial_number',
        'hostname',
        'po_number',
        'location_region',
        'current_user',
        'office_now',
        'status_id',
        'remark',
        'ip_location',
        'user_before',
        'date_deliver_to_user',
        'ticket_number',
        'installed_by',
        'replaced_by',
        'date_replacement',
        'done_by'
    ];

    protected $casts = [
        'date_deliver_to_user' => 'date',
        'date_replacement' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'asset_type_id');
    }

    public function status()
    {
        return $this->belongsTo(AssetStatus::class, 'status_id');
    }

    public function history()
    {
        return $this->hasMany(AssetHistory::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}