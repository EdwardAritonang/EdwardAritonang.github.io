<?php

namespace App\Http\Controllers;

use App\Models\AssetStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetStatusController extends Controller
{
    public function index()
    {
        $statuses = AssetStatus::all();
        return response()->json($statuses);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'status_name' => 'required|unique:asset_statuses,status_name',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = AssetStatus::create($request->all());

        return response()->json([
            'message' => 'Status created successfully',
            'data' => $status
        ], 201);
    }

    public function show($id)
    {
        $status = AssetStatus::with('assets')->find($id);

        if (!$status) {
            return response()->json([
                'message' => 'Status not found'
            ], 404);
        }

        return response()->json($status);
    }

    public function update(Request $request, $id)
    {
        $status = AssetStatus::find($id);

        if (!$status) {
            return response()->json([
                'message' => 'Status not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status_name' => 'sometimes|unique:asset_statuses,status_name,' . $id,
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $status->update($request->all());

        return response()->json([
            'message' => 'Status updated successfully',
            'data' => $status
        ]);
    }

    public function destroy($id)
    {
        $status = AssetStatus::find($id);

        if (!$status) {
            return response()->json([
                'message' => 'Status not found'
            ], 404);
        }

        // Check if status has assets
        if ($status->assets()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete status with existing assets'
            ], 400);
        }

        $status->delete();

        return response()->json([
            'message' => 'Status deleted successfully'
        ]);
    }
}