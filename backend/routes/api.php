<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\StatusController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Asset routes
Route::prefix('assets')->group(function () {
    Route::get('/', [AssetController::class, 'index']);
    Route::post('/', [AssetController::class, 'store']);
    Route::get('/{id}', [AssetController::class, 'show']);
    Route::put('/{id}', [AssetController::class, 'update']);
    Route::delete('/{id}', [AssetController::class, 'destroy']);
    Route::get('/dashboard/stats', [AssetController::class, 'dashboard']);
    Route::get('/export/csv', [AssetController::class, 'export']);
});

// Category routes
Route::get('/categories', [CategoryController::class, 'index']);

// Status routes
Route::get('/statuses', [StatusController::class, 'index']);