<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'action_type',
        'old_value',
        'new_value',
        'changed_by',
        'remark'
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}