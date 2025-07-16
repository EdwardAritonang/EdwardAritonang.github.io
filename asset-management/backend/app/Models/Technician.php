<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Technician extends Model
{
    use HasFactory;

    protected $table = 'technicians';
    
    protected $fillable = [
        'name',
        'email',
        'phone',
        'department'
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'technician_id');
    }
}