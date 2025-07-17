<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $table = 'assets';
    protected $primaryKey = 'id_asset';
    
    protected $fillable = [
        'asset_type_id',
        'asset_code',
        'serial_number',
        'hostname',
        'purchase_order',
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

    public function assetCategory()
    {
        return $this->belongsTo(AssetCategory::class, 'asset_type_id');
    }

    public function assetStatus()
    {
        return $this->belongsTo(AssetStatus::class, 'status_id');
    }

    public function replacedByAsset()
    {
        return $this->belongsTo(Asset::class, 'replaced_by', 'id_asset');
    }

    public function replacedAssets()
    {
        return $this->hasMany(Asset::class, 'replaced_by', 'id_asset');
    }

    public function history()
    {
        return $this->hasMany(AssetHistory::class, 'asset_id', 'id_asset');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'asset_id', 'id_asset');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('asset_code', 'like', "%{$search}%")
              ->orWhere('serial_number', 'like', "%{$search}%")
              ->orWhere('hostname', 'like', "%{$search}%")
              ->orWhere('current_user', 'like', "%{$search}%")
              ->orWhere('location_region', 'like', "%{$search}%")
              ->orWhereHas('assetCategory', function ($q) use ($search) {
                  $q->where('category_name', 'like', "%{$search}%");
              })
              ->orWhereHas('assetStatus', function ($q) use ($search) {
                  $q->where('status_name', 'like', "%{$search}%");
              });
        });
    }
}