<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetHistory extends Model
{
    use HasFactory;

    protected $table = 'asset_history';
    
    protected $fillable = [
        'asset_id',
        'changed_field',
        'old_value',
        'new_value',
        'changed_by',
        'change_date',
        'notes'
    ];

    protected $casts = [
        'change_date' => 'datetime',
    ];

    public $timestamps = false;

    public function asset()
    {
        return $this->belongsTo(Asset::class, 'asset_id', 'id_asset');
    }
}