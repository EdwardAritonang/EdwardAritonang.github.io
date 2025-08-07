<?php

namespace App\Http\Controllers;

use App\Models\AssetStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    public function index(): JsonResponse
    {
        $statuses = AssetStatus::all();

        return response()->json([
            'success' => true,
            'data' => $statuses
        ]);
    }
}