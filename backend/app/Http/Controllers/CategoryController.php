<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = AssetCategory::all();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}