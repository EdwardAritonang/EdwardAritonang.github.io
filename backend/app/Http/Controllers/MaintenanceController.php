<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceSchedule;
use App\Models\Asset;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class MaintenanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MaintenanceSchedule::with(['asset', 'technician']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('maintenance_type')) {
            $query->where('maintenance_type', $request->maintenance_type);
        }

        if ($request->filled('technician_id')) {
            $query->where('technician_id', $request->technician_id);
        }

        if ($request->filled('date_from')) {
            $query->where('scheduled_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('scheduled_date', '<=', $request->date_to);
        }

        $schedules = $query->orderBy('scheduled_date')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'maintenance_type' => 'required|in:preventive,corrective,emergency,upgrade',
            'scheduled_date' => 'required|date|after:today',
            'technician_id' => 'nullable|exists:users,id',
            'description' => 'required|string',
            'cost' => 'nullable|numeric',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $schedule = MaintenanceSchedule::create([
            'asset_id' => $request->asset_id,
            'maintenance_type' => $request->maintenance_type,
            'scheduled_date' => $request->scheduled_date,
            'technician_id' => $request->technician_id,
            'description' => $request->description,
            'status' => 'scheduled',
            'cost' => $request->cost,
            'notes' => $request->notes
        ]);

        // Notify technician if assigned
        if ($request->technician_id) {
            NotificationService::create(
                $request->technician_id,
                'Maintenance Scheduled',
                "You have been assigned to maintain asset {$schedule->asset->asset_code} on {$request->scheduled_date}",
                'maintenance',
                ['schedule_id' => $schedule->id],
                "/maintenance/{$schedule->id}"
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Maintenance schedule created successfully',
            'data' => $schedule->load(['asset', 'technician'])
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $schedule = MaintenanceSchedule::with(['asset', 'technician'])->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Maintenance schedule not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $schedule
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $schedule = MaintenanceSchedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Maintenance schedule not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'maintenance_type' => 'sometimes|required|in:preventive,corrective,emergency,upgrade',
            'scheduled_date' => 'sometimes|required|date',
            'completed_date' => 'nullable|date',
            'technician_id' => 'nullable|exists:users,id',
            'description' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:scheduled,in_progress,completed,cancelled',
            'cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'next_maintenance_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // If status changed to completed, set completed_date
        if ($request->filled('status') && $request->status === 'completed' && $schedule->status !== 'completed') {
            $request->merge(['completed_date' => now()]);
        }

        $schedule->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Maintenance schedule updated successfully',
            'data' => $schedule->load(['asset', 'technician'])
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $schedule = MaintenanceSchedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Maintenance schedule not found'
            ], 404);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Maintenance schedule deleted successfully'
        ]);
    }

    public function dashboard(): JsonResponse
    {
        $schedules = MaintenanceSchedule::with(['asset', 'technician'])->get();

        $stats = [
            'total_schedules' => $schedules->count(),
            'scheduled' => $schedules->where('status', 'scheduled')->count(),
            'in_progress' => $schedules->where('status', 'in_progress')->count(),
            'completed' => $schedules->where('status', 'completed')->count(),
            'overdue' => $schedules->where('scheduled_date', '<', now())->where('status', '!=', 'completed')->count(),
            'due_soon' => $schedules->where('scheduled_date', '>=', now())->where('scheduled_date', '<=', now()->addDays(7))->where('status', 'scheduled')->count()
        ];

        $typeStats = $schedules->groupBy('maintenance_type')->map->count();
        $statusStats = $schedules->groupBy('status')->map->count();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'type_stats' => $typeStats,
                'status_stats' => $statusStats,
                'upcoming_schedules' => $schedules->where('scheduled_date', '>=', now())->where('status', 'scheduled')->take(10),
                'overdue_schedules' => $schedules->where('scheduled_date', '<', now())->where('status', '!=', 'completed')->take(10)
            ]
        ]);
    }

    public function autoSchedule(): JsonResponse
    {
        // Auto-schedule maintenance for assets that haven't been maintained recently
        $assets = Asset::where('status_id', 1) // Active assets
            ->whereDoesntHave('maintenanceSchedules', function($query) {
                $query->where('scheduled_date', '>=', now()->subMonths(6));
            })
            ->get();

        $scheduled = 0;

        foreach ($assets as $asset) {
            MaintenanceSchedule::create([
                'asset_id' => $asset->id,
                'maintenance_type' => 'preventive',
                'scheduled_date' => now()->addMonths(6),
                'description' => 'Regular preventive maintenance',
                'status' => 'scheduled'
            ]);

            $scheduled++;
        }

        return response()->json([
            'success' => true,
            'message' => "Auto-scheduled maintenance for {$scheduled} assets",
            'data' => ['scheduled_count' => $scheduled]
        ]);
    }

    public function checkOverdue(): JsonResponse
    {
        $overdueSchedules = MaintenanceSchedule::with(['asset', 'technician'])
            ->where('scheduled_date', '<', now())
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($overdueSchedules as $schedule) {
            // Update status to overdue
            $schedule->update(['status' => 'overdue']);

            // Notify technician
            if ($schedule->technician_id) {
                NotificationService::create(
                    $schedule->technician_id,
                    'Maintenance Overdue',
                    "Maintenance for asset {$schedule->asset->asset_code} is overdue",
                    'maintenance',
                    ['schedule_id' => $schedule->id],
                    "/maintenance/{$schedule->id}"
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Found {$overdueSchedules->count()} overdue maintenance schedules",
            'data' => ['overdue_count' => $overdueSchedules->count()]
        ]);
    }
}