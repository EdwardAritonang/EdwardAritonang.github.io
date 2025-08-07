<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetStatus;
use App\Models\AssetHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AssetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Asset::with(['category', 'status']);

        // Filter berdasarkan parameter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('asset_code', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%")
                  ->orWhere('hostname', 'like', "%{$search}%")
                  ->orWhere('current_user', 'like', "%{$search}%")
                  ->orWhere('location_region', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('asset_type_id', $request->category_id);
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        $assets = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $assets
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'asset_code' => 'required|unique:assets,asset_code',
            'asset_type_id' => 'required|exists:asset_categories,id',
            'serial_number' => 'nullable|string',
            'hostname' => 'nullable|string',
            'po_number' => 'nullable|string',
            'location_region' => 'nullable|string',
            'current_user' => 'nullable|string',
            'office_now' => 'nullable|string',
            'status_id' => 'required|exists:asset_statuses,id',
            'remark' => 'nullable|string',
            'ip_location' => 'nullable|ip',
            'user_before' => 'nullable|string',
            'date_deliver_to_user' => 'nullable|date',
            'ticket_number' => 'nullable|string',
            'installed_by' => 'nullable|string',
            'replaced_by' => 'nullable|string',
            'date_replacement' => 'nullable|date',
            'done_by' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $asset = Asset::create($request->all());

        // Log history jika ada perubahan user
        if ($request->filled('current_user')) {
            AssetHistory::create([
                'asset_id' => $asset->id,
                'action_type' => 'user_change',
                'old_value' => $request->user_before ?? 'New Asset',
                'new_value' => $request->current_user,
                'changed_by' => $request->installed_by ?? 'System',
                'remark' => 'Asset created and assigned to user'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Asset created successfully',
            'data' => $asset->load(['category', 'status'])
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $asset = Asset::with(['category', 'status', 'history', 'tickets'])->find($id);

        if (!$asset) {
            return response()->json([
                'success' => false,
                'message' => 'Asset not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $asset
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return response()->json([
                'success' => false,
                'message' => 'Asset not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'asset_code' => 'required|unique:assets,asset_code,' . $id,
            'asset_type_id' => 'required|exists:asset_categories,id',
            'serial_number' => 'nullable|string',
            'hostname' => 'nullable|string',
            'po_number' => 'nullable|string',
            'location_region' => 'nullable|string',
            'current_user' => 'nullable|string',
            'office_now' => 'nullable|string',
            'status_id' => 'required|exists:asset_statuses,id',
            'remark' => 'nullable|string',
            'ip_location' => 'nullable|ip',
            'user_before' => 'nullable|string',
            'date_deliver_to_user' => 'nullable|date',
            'ticket_number' => 'nullable|string',
            'installed_by' => 'nullable|string',
            'replaced_by' => 'nullable|string',
            'date_replacement' => 'nullable|date',
            'done_by' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Log changes before updating
        if ($request->filled('status_id') && $asset->status_id != $request->status_id) {
            AssetHistory::create([
                'asset_id' => $asset->id,
                'action_type' => 'status_change',
                'old_value' => $asset->status->name,
                'new_value' => AssetStatus::find($request->status_id)->name,
                'changed_by' => $request->done_by ?? 'System',
                'remark' => 'Status updated'
            ]);
        }

        if ($request->filled('current_user') && $asset->current_user != $request->current_user) {
            AssetHistory::create([
                'asset_id' => $asset->id,
                'action_type' => 'user_change',
                'old_value' => $asset->current_user ?? 'No User',
                'new_value' => $request->current_user,
                'changed_by' => $request->done_by ?? 'System',
                'remark' => 'User assignment updated'
            ]);
        }

        $asset->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Asset updated successfully',
            'data' => $asset->load(['category', 'status'])
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return response()->json([
                'success' => false,
                'message' => 'Asset not found'
            ], 404);
        }

        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset deleted successfully'
        ]);
    }

    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_assets' => Asset::count(),
            'active_assets' => Asset::whereHas('status', function($q) {
                $q->where('name', 'Active');
            })->count(),
            'non_active_assets' => Asset::whereHas('status', function($q) {
                $q->where('name', 'Non-active');
            })->count(),
            'broken_assets' => Asset::whereHas('status', function($q) {
                $q->where('name', 'Broken');
            })->count(),
            'repair_assets' => Asset::whereHas('status', function($q) {
                $q->where('name', 'Repair');
            })->count(),
        ];

        $categoryStats = Asset::with('category')
            ->select('asset_type_id', DB::raw('count(*) as total'))
            ->groupBy('asset_type_id')
            ->get()
            ->map(function($item) {
                return [
                    'category' => $item->category->name,
                    'total' => $item->total
                ];
            });

        $statusStats = Asset::with('status')
            ->select('status_id', DB::raw('count(*) as total'))
            ->groupBy('status_id')
            ->get()
            ->map(function($item) {
                return [
                    'status' => $item->status->name,
                    'total' => $item->total
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'category_stats' => $categoryStats,
                'status_stats' => $statusStats
            ]
        ]);
    }

    public function export()
    {
        $assets = Asset::with(['category', 'status'])->get();
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="assets.csv"',
        ];

        $callback = function() use ($assets) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'Asset Code', 'Category', 'Serial Number', 'Hostname', 'PO Number',
                'Location', 'Current User', 'Office', 'Status', 'Remark', 'IP Location',
                'User Before', 'Date Deliver', 'Ticket', 'Installed By', 'Replaced By',
                'Date Replacement', 'Done By'
            ]);

            foreach ($assets as $asset) {
                fputcsv($file, [
                    $asset->asset_code,
                    $asset->category->name,
                    $asset->serial_number,
                    $asset->hostname,
                    $asset->po_number,
                    $asset->location_region,
                    $asset->current_user,
                    $asset->office_now,
                    $asset->status->name,
                    $asset->remark,
                    $asset->ip_location,
                    $asset->user_before,
                    $asset->date_deliver_to_user,
                    $asset->ticket_number,
                    $asset->installed_by,
                    $asset->replaced_by,
                    $asset->date_replacement,
                    $asset->done_by
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}