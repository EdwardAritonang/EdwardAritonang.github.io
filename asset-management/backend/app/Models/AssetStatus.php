<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetStatus extends Model
{
    use HasFactory;

    protected $table = 'asset_statuses';
    
    protected $fillable = [
        'status_name',
        'description'
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class, 'status_id');
    }
}