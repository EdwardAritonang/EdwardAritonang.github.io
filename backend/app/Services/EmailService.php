<?php

namespace App\Services;

use App\Models\User;
use App\Models\Asset;
use App\Models\Ticket;
use App\Mail\AssetNotification;
use App\Mail\TicketNotification;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    public static function sendAssetNotification($asset, $type, $message, $recipients = [])
    {
        if (empty($recipients)) {
            // Send to all admins by default
            $recipients = User::where('role', 'admin')->where('is_active', true)->get();
        }

        foreach ($recipients as $recipient) {
            Mail::to($recipient->email)->send(new AssetNotification($asset, $type, $message));
        }
    }

    public static function sendTicketNotification($ticket, $type, $message, $recipients = [])
    {
        if (empty($recipients)) {
            // Send to assigned technician and admins
            $recipients = User::where('role', 'admin')->where('is_active', true)->get();
            
            if ($ticket->assigned_technician) {
                $technician = User::find($ticket->assigned_technician);
                if ($technician) {
                    $recipients->push($technician);
                }
            }
        }

        foreach ($recipients as $recipient) {
            Mail::to($recipient->email)->send(new TicketNotification($ticket, $type, $message));
        }
    }

    public static function sendMaintenanceReminder($schedule)
    {
        $recipients = collect();

        // Add assigned technician
        if ($schedule->technician_id) {
            $technician = User::find($schedule->technician_id);
            if ($technician) {
                $recipients->push($technician);
            }
        }

        // Add admins
        $admins = User::where('role', 'admin')->where('is_active', true)->get();
        $recipients = $recipients->merge($admins);

        $message = "Maintenance scheduled for asset {$schedule->asset->asset_code} on {$schedule->scheduled_date}";

        foreach ($recipients as $recipient) {
            Mail::to($recipient->email)->send(new AssetNotification($schedule->asset, 'Maintenance Reminder', $message));
        }
    }

    public static function sendOverdueNotification($schedule)
    {
        $recipients = collect();

        // Add assigned technician
        if ($schedule->technician_id) {
            $technician = User::find($schedule->technician_id);
            if ($technician) {
                $recipients->push($technician);
            }
        }

        // Add admins
        $admins = User::where('role', 'admin')->where('is_active', true)->get();
        $recipients = $recipients->merge($admins);

        $message = "Maintenance for asset {$schedule->asset->asset_code} is overdue";

        foreach ($recipients as $recipient) {
            Mail::to($recipient->email)->send(new AssetNotification($schedule->asset, 'Maintenance Overdue', $message));
        }
    }

    public static function sendWeeklyReport($user)
    {
        // Generate weekly report data
        $report = [
            'assets_assigned' => $user->assets->count(),
            'tickets_created' => $user->createdTickets->where('created_at', '>=', now()->subWeek())->count(),
            'tickets_assigned' => $user->assignedTickets->where('created_at', '>=', now()->subWeek())->count(),
            'completed_tickets' => $user->assignedTickets->where('status', 'completed')->where('updated_at', '>=', now()->subWeek())->count()
        ];

        $message = "Weekly Report:\n" .
                   "Assets Assigned: {$report['assets_assigned']}\n" .
                   "Tickets Created: {$report['tickets_created']}\n" .
                   "Tickets Assigned: {$report['tickets_assigned']}\n" .
                   "Completed Tickets: {$report['completed_tickets']}";

        Mail::to($user->email)->send(new AssetNotification(null, 'Weekly Report', $message));
    }

    public static function sendMonthlyReport($user)
    {
        // Generate monthly report data
        $report = [
            'total_assets' => Asset::count(),
            'active_assets' => Asset::whereHas('status', function($q) { $q->where('name', 'Active'); })->count(),
            'total_tickets' => Ticket::count(),
            'completed_tickets' => Ticket::where('status', 'completed')->count(),
            'overdue_tickets' => Ticket::where('due_date', '<', now())->whereNotIn('status', ['completed', 'cancelled'])->count()
        ];

        $message = "Monthly Report:\n" .
                   "Total Assets: {$report['total_assets']}\n" .
                   "Active Assets: {$report['active_assets']}\n" .
                   "Total Tickets: {$report['total_tickets']}\n" .
                   "Completed Tickets: {$report['completed_tickets']}\n" .
                   "Overdue Tickets: {$report['overdue_tickets']}";

        Mail::to($user->email)->send(new AssetNotification(null, 'Monthly Report', $message));
    }
}