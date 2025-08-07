<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department',
        'position',
        'phone',
        'avatar',
        'is_active',
        'last_login_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class, 'current_user_id');
    }

    public function createdTickets()
    {
        return $this->hasMany(Ticket::class, 'created_by');
    }

    public function assignedTickets()
    {
        return $this->hasMany(Ticket::class, 'assigned_technician');
    }

    public function ticketComments()
    {
        return $this->hasMany(TicketComment::class);
    }

    public function ticketAttachments()
    {
        return $this->hasMany(TicketAttachment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function hasRole($role)
    {
        return $this->role === $role;
    }

    public function hasPermission($permission)
    {
        $permissions = [
            'admin' => ['all'],
            'manager' => ['view_assets', 'edit_assets', 'view_tickets', 'edit_tickets', 'view_reports'],
            'technician' => ['view_assets', 'edit_assets', 'view_tickets', 'edit_tickets', 'create_tickets'],
            'user' => ['view_assets', 'view_tickets', 'create_tickets']
        ];

        return in_array($permission, $permissions[$this->role] ?? []) || 
               in_array('all', $permissions[$this->role] ?? []);
    }

    public function getRoleColorAttribute()
    {
        $colors = [
            'admin' => 'bg-red-100 text-red-800',
            'manager' => 'bg-blue-100 text-blue-800',
            'technician' => 'bg-green-100 text-green-800',
            'user' => 'bg-gray-100 text-gray-800'
        ];
        return $colors[$this->role] ?? 'bg-gray-100 text-gray-800';
    }
}