<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Ticket;
use App\Models\User;
use App\Models\AssetCategory;
use App\Models\AssetStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function assetReport(Request $request): JsonResponse
    {
        $query = Asset::with(['category', 'status']);

        // Apply filters
        if ($request->filled('category_id')) {
            $query->where('asset_type_id', $request->category_id);
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $assets = $query->get();

        $report = [
            'total_assets' => $assets->count(),
            'by_category' => $assets->groupBy('category.name')->map->count(),
            'by_status' => $assets->groupBy('status.name')->map->count(),
            'by_location' => $assets->groupBy('location_region')->map->count(),
            'by_user' => $assets->groupBy('current_user')->map->count(),
            'recent_additions' => $assets->sortByDesc('created_at')->take(10),
            'high_value_assets' => $assets->where('status.name', 'Active')->take(10)
        ];

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function ticketReport(Request $request): JsonResponse
    {
        $query = Ticket::with(['asset', 'createdBy', 'assignedTechnician']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $tickets = $query->get();

        $report = [
            'total_tickets' => $tickets->count(),
            'by_status' => $tickets->groupBy('status')->map->count(),
            'by_priority' => $tickets->groupBy('priority')->map->count(),
            'by_technician' => $tickets->groupBy('assignedTechnician.name')->map->count(),
            'by_category' => $tickets->groupBy('category')->map->count(),
            'average_resolution_time' => $tickets->where('completed_at', '!=', null)
                ->avg(function($ticket) {
                    return $ticket->created_at->diffInHours($ticket->completed_at);
                }),
            'overdue_tickets' => $tickets->where('due_date', '<', now())
                ->whereNotIn('status', ['completed', 'cancelled'])->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function maintenanceReport(Request $request): JsonResponse
    {
        $assets = Asset::with(['category', 'status'])->get();

        $maintenanceReport = [
            'total_assets' => $assets->count(),
            'assets_due_maintenance' => $assets->where('status.name', 'Active')->count(),
            'assets_needing_replacement' => $assets->whereIn('status.name', ['Broken', 'Repair'])->count(),
            'by_category' => $assets->groupBy('category.name')->map(function($categoryAssets) {
                return [
                    'total' => $categoryAssets->count(),
                    'active' => $categoryAssets->where('status.name', 'Active')->count(),
                    'broken' => $categoryAssets->whereIn('status.name', ['Broken', 'Repair'])->count()
                ];
            }),
            'maintenance_schedule' => $assets->where('status.name', 'Active')
                ->map(function($asset) {
                    return [
                        'asset_code' => $asset->asset_code,
                        'category' => $asset->category->name,
                        'current_user' => $asset->current_user,
                        'location' => $asset->location_region,
                        'last_maintenance' => $asset->date_deliver_to_user,
                        'next_maintenance' => $asset->date_deliver_to_user ? 
                            date('Y-m-d', strtotime($asset->date_deliver_to_user . ' +6 months')) : null
                    ];
                })
        ];

        return response()->json([
            'success' => true,
            'data' => $maintenanceReport
        ]);
    }

    public function costReport(Request $request): JsonResponse
    {
        $tickets = Ticket::with(['asset'])->get();

        $costReport = [
            'total_cost' => $tickets->sum('cost'),
            'average_cost_per_ticket' => $tickets->avg('cost'),
            'cost_by_category' => $tickets->groupBy('category')->map->sum('cost'),
            'cost_by_asset_category' => $tickets->groupBy('asset.category.name')->map->sum('cost'),
            'monthly_costs' => $tickets->groupBy(function($ticket) {
                return $ticket->created_at->format('Y-m');
            })->map->sum('cost'),
            'high_cost_tickets' => $tickets->where('cost', '>', 0)
                ->sortByDesc('cost')->take(10)
        ];

        return response()->json([
            'success' => true,
            'data' => $costReport
        ]);
    }

    public function userActivityReport(Request $request): JsonResponse
    {
        $users = User::with(['assets', 'createdTickets', 'assignedTickets'])->get();

        $activityReport = [
            'total_users' => $users->count(),
            'active_users' => $users->where('is_active', true)->count(),
            'users_by_role' => $users->groupBy('role')->map->count(),
            'users_by_department' => $users->groupBy('department')->map->count(),
            'user_activity' => $users->map(function($user) {
                return [
                    'name' => $user->name,
                    'role' => $user->role,
                    'department' => $user->department,
                    'assets_assigned' => $user->assets->count(),
                    'tickets_created' => $user->createdTickets->count(),
                    'tickets_assigned' => $user->assignedTickets->count(),
                    'last_login' => $user->last_login_at
                ];
            }),
            'top_technicians' => $users->where('role', 'technician')
                ->sortByDesc(function($user) {
                    return $user->assignedTickets->where('status', 'completed')->count();
                })->take(5)
        ];

        return response()->json([
            'success' => true,
            'data' => $activityReport
        ]);
    }

    public function dashboardReport(): JsonResponse
    {
        $assets = Asset::with(['category', 'status'])->get();
        $tickets = Ticket::with(['asset'])->get();
        $users = User::all();

        $dashboardReport = [
            'summary' => [
                'total_assets' => $assets->count(),
                'active_assets' => $assets->where('status.name', 'Active')->count(),
                'total_tickets' => $tickets->count(),
                'open_tickets' => $tickets->where('status', 'open')->count(),
                'total_users' => $users->count(),
                'active_users' => $users->where('is_active', true)->count()
            ],
            'charts' => [
                'assets_by_category' => $assets->groupBy('category.name')->map->count(),
                'assets_by_status' => $assets->groupBy('status.name')->map->count(),
                'tickets_by_status' => $tickets->groupBy('status')->map->count(),
                'tickets_by_priority' => $tickets->groupBy('priority')->map->count()
            ],
            'alerts' => [
                'overdue_tickets' => $tickets->where('due_date', '<', now())
                    ->whereNotIn('status', ['completed', 'cancelled'])->count(),
                'assets_needing_maintenance' => $assets->whereIn('status.name', ['Broken', 'Repair'])->count(),
                'urgent_tickets' => $tickets->where('priority', 'urgent')->count()
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $dashboardReport
        ]);
    }

    public function exportReport(Request $request): JsonResponse
    {
        $type = $request->get('type', 'assets');
        $format = $request->get('format', 'csv');

        switch ($type) {
            case 'assets':
                $data = Asset::with(['category', 'status'])->get();
                break;
            case 'tickets':
                $data = Ticket::with(['asset', 'createdBy', 'assignedTechnician'])->get();
                break;
            case 'users':
                $data = User::all();
                break;
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid report type'
                ], 400);
        }

        // Generate filename
        $filename = "{$type}_report_" . date('Y-m-d_H-i-s') . ".{$format}";

        return response()->json([
            'success' => true,
            'data' => [
                'filename' => $filename,
                'download_url' => "/api/reports/download/{$type}?format={$format}"
            ]
        ]);
    }
}