<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetCategoryController extends Controller
{
    public function index()
    {
        $categories = AssetCategory::all();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_name' => 'required|unique:asset_categories,category_name',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = AssetCategory::create($request->all());

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    public function show($id)
    {
        $category = AssetCategory::with('assets')->find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Category not found'
            ], 404);
        }

        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $category = AssetCategory::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Category not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_name' => 'sometimes|unique:asset_categories,category_name,' . $id,
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($request->all());

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = AssetCategory::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Category not found'
            ], 404);
        }

        // Check if category has assets
        if ($category->assets()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with existing assets'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}