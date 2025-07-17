<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetStatus;
use App\Models\AssetHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with(['assetCategory', 'assetStatus']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('asset_type_id', $request->category);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status_id', $request->status);
        }

        // Filter by location
        if ($request->has('location') && $request->location) {
            $query->where('location_region', 'like', '%' . $request->location . '%');
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $assets = $query->paginate($perPage);

        return response()->json($assets);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_type_id' => 'required|exists:asset_categories,id',
            'asset_code' => 'required|unique:assets,asset_code',
            'serial_number' => 'required|unique:assets,serial_number',
            'status_id' => 'required|exists:asset_statuses,id',
            'location_region' => 'required|string',
            'current_user' => 'nullable|string',
            'office_now' => 'nullable|string',
            'hostname' => 'nullable|string',
            'purchase_order' => 'nullable|string',
            'remark' => 'nullable|string',
            'ip_location' => 'nullable|ip',
            'user_before' => 'nullable|string',
            'date_deliver_to_user' => 'nullable|date',
            'ticket_number' => 'nullable|string',
            'installed_by' => 'nullable|string',
            'replaced_by' => 'nullable|exists:assets,id_asset',
            'date_replacement' => 'nullable|date',
            'done_by' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $asset = Asset::create($request->all());

            // Create history record
            AssetHistory::create([
                'asset_id' => $asset->id_asset,
                'changed_field' => 'created',
                'old_value' => null,
                'new_value' => 'Asset created',
                'changed_by' => $request->get('changed_by', 'System'),
                'change_date' => now(),
                'notes' => 'Asset created in system'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Asset created successfully',
                'data' => $asset->load(['assetCategory', 'assetStatus'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error creating asset',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $asset = Asset::with(['assetCategory', 'assetStatus', 'history', 'tickets.technician'])
                     ->find($id);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found'
            ], 404);
        }

        return response()->json($asset);
    }

    public function update(Request $request, $id)
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'asset_type_id' => 'sometimes|exists:asset_categories,id',
            'asset_code' => 'sometimes|unique:assets,asset_code,' . $id . ',id_asset',
            'serial_number' => 'sometimes|unique:assets,serial_number,' . $id . ',id_asset',
            'status_id' => 'sometimes|exists:asset_statuses,id',
            'location_region' => 'sometimes|string',
            'current_user' => 'nullable|string',
            'office_now' => 'nullable|string',
            'hostname' => 'nullable|string',
            'purchase_order' => 'nullable|string',
            'remark' => 'nullable|string',
            'ip_location' => 'nullable|ip',
            'user_before' => 'nullable|string',
            'date_deliver_to_user' => 'nullable|date',
            'ticket_number' => 'nullable|string',
            'installed_by' => 'nullable|string',
            'replaced_by' => 'nullable|exists:assets,id_asset',
            'date_replacement' => 'nullable|date',
            'done_by' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $originalData = $asset->toArray();
            $asset->update($request->all());

            // Create history records for changed fields
            foreach ($request->all() as $field => $newValue) {
                if (isset($originalData[$field]) && $originalData[$field] != $newValue) {
                    AssetHistory::create([
                        'asset_id' => $asset->id_asset,
                        'changed_field' => $field,
                        'old_value' => $originalData[$field],
                        'new_value' => $newValue,
                        'changed_by' => $request->get('changed_by', 'System'),
                        'change_date' => now(),
                        'notes' => "Field {$field} updated"
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Asset updated successfully',
                'data' => $asset->load(['assetCategory', 'assetStatus'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error updating asset',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Create history record before deletion
            AssetHistory::create([
                'asset_id' => $asset->id_asset,
                'changed_field' => 'deleted',
                'old_value' => 'Asset exists',
                'new_value' => 'Asset deleted',
                'changed_by' => request()->get('changed_by', 'System'),
                'change_date' => now(),
                'notes' => 'Asset deleted from system'
            ]);

            $asset->delete();

            DB::commit();

            return response()->json([
                'message' => 'Asset deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error deleting asset',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStats()
    {
        $stats = [
            'total_assets' => Asset::count(),
            'active_assets' => Asset::whereHas('assetStatus', function($q) {
                $q->where('status_name', 'Active');
            })->count(),
            'spare_assets' => Asset::whereHas('assetStatus', function($q) {
                $q->where('status_name', 'Spare');
            })->count(),
            'broken_assets' => Asset::whereHas('assetStatus', function($q) {
                $q->where('status_name', 'Broken');
            })->count(),
            'repair_assets' => Asset::whereHas('assetStatus', function($q) {
                $q->where('status_name', 'Repair');
            })->count(),
            'assets_by_category' => Asset::select('asset_categories.category_name', DB::raw('count(*) as count'))
                ->join('asset_categories', 'assets.asset_type_id', '=', 'asset_categories.id')
                ->groupBy('asset_categories.category_name')
                ->get(),
            'assets_by_status' => Asset::select('asset_statuses.status_name', DB::raw('count(*) as count'))
                ->join('asset_statuses', 'assets.status_id', '=', 'asset_statuses.id')
                ->groupBy('asset_statuses.status_name')
                ->get(),
        ];

        return response()->json($stats);
    }

    public function getHistory($id)
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found'
            ], 404);
        }

        $history = AssetHistory::where('asset_id', $id)
                              ->orderBy('change_date', 'desc')
                              ->get();

        return response()->json($history);
    }

    public function exportExcel()
    {
        // This will be implemented with a proper Excel export library
        $assets = Asset::with(['assetCategory', 'assetStatus'])->get();
        
        return response()->json([
            'message' => 'Export functionality will be implemented',
            'data' => $assets
        ]);
    }

    public function importExcel(Request $request)
    {
        // This will be implemented with a proper Excel import library
        return response()->json([
            'message' => 'Import functionality will be implemented'
        ]);
    }
}