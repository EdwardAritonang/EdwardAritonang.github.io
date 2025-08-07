<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public static function create($userId, $title, $message, $type = 'info', $data = [], $actionUrl = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
            'action_url' => $actionUrl,
            'is_read' => false
        ]);
    }

    public static function createForRole($role, $title, $message, $type = 'info', $data = [], $actionUrl = null)
    {
        $users = User::where('role', $role)->where('is_active', true)->get();
        
        foreach ($users as $user) {
            self::create($user->id, $title, $message, $type, $data, $actionUrl);
        }
    }

    public static function createForAll($title, $message, $type = 'info', $data = [], $actionUrl = null)
    {
        $users = User::where('is_active', true)->get();
        
        foreach ($users as $user) {
            self::create($user->id, $title, $message, $type, $data, $actionUrl);
        }
    }

    public static function assetCreated($asset)
    {
        $title = 'New Asset Created';
        $message = "Asset {$asset->asset_code} has been created and assigned to {$asset->current_user}";
        
        self::createForRole('admin', $title, $message, 'asset', [
            'asset_id' => $asset->id,
            'asset_code' => $asset->asset_code
        ], "/assets/{$asset->id}");
    }

    public static function assetUpdated($asset)
    {
        $title = 'Asset Updated';
        $message = "Asset {$asset->asset_code} has been updated";
        
        self::createForRole('admin', $title, $message, 'asset', [
            'asset_id' => $asset->id,
            'asset_code' => $asset->asset_code
        ], "/assets/{$asset->id}");
    }

    public static function ticketCreated($ticket)
    {
        $title = 'New Ticket Created';
        $message = "Ticket {$ticket->ticket_number} has been created: {$ticket->title}";
        
        // Notify admin and assigned technician
        self::createForRole('admin', $title, $message, 'ticket', [
            'ticket_id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number
        ], "/tickets/{$ticket->id}");

        if ($ticket->assigned_technician) {
            self::create($ticket->assigned_technician, $title, $message, 'ticket', [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number
            ], "/tickets/{$ticket->id}");
        }
    }

    public static function ticketUpdated($ticket)
    {
        $title = 'Ticket Updated';
        $message = "Ticket {$ticket->ticket_number} has been updated";
        
        self::createForRole('admin', $title, $message, 'ticket', [
            'ticket_id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number
        ], "/tickets/{$ticket->id}");
    }

    public static function maintenanceDue($asset)
    {
        $title = 'Maintenance Due';
        $message = "Asset {$asset->asset_code} is due for maintenance";
        
        self::createForRole('technician', $title, $message, 'maintenance', [
            'asset_id' => $asset->id,
            'asset_code' => $asset->asset_code
        ], "/assets/{$asset->id}");
    }

    public static function assetReplacementDue($asset)
    {
        $title = 'Asset Replacement Due';
        $message = "Asset {$asset->asset_code} is due for replacement";
        
        self::createForRole('admin', $title, $message, 'asset', [
            'asset_id' => $asset->id,
            'asset_code' => $asset->asset_code
        ], "/assets/{$asset->id}");
    }

    public static function ticketOverdue($ticket)
    {
        $title = 'Ticket Overdue';
        $message = "Ticket {$ticket->ticket_number} is overdue";
        
        self::createForRole('admin', $title, $message, 'ticket', [
            'ticket_id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number
        ], "/tickets/{$ticket->id}");

        if ($ticket->assigned_technician) {
            self::create($ticket->assigned_technician, $title, $message, 'ticket', [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number
            ], "/tickets/{$ticket->id}");
        }
    }

    public static function sendEmailNotification($user, $title, $message, $type = 'info')
    {
        // This would integrate with your email service
        // For now, we'll just create a notification
        self::create($user->id, $title, $message, $type);
    }
}