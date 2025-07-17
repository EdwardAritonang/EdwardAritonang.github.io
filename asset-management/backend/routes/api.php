<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\AssetStatusController;
use App\Http\Controllers\TicketController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Asset Management Routes
Route::prefix('assets')->group(function () {
    Route::get('/', [AssetController::class, 'index']);
    Route::post('/', [AssetController::class, 'store']);
    Route::get('/stats', [AssetController::class, 'getStats']);
    Route::get('/export', [AssetController::class, 'exportExcel']);
    Route::post('/import', [AssetController::class, 'importExcel']);
    Route::get('/{id}', [AssetController::class, 'show']);
    Route::put('/{id}', [AssetController::class, 'update']);
    Route::delete('/{id}', [AssetController::class, 'destroy']);
    Route::get('/{id}/history', [AssetController::class, 'getHistory']);
});

// Asset Categories Routes
Route::prefix('asset-categories')->group(function () {
    Route::get('/', [AssetCategoryController::class, 'index']);
    Route::post('/', [AssetCategoryController::class, 'store']);
    Route::get('/{id}', [AssetCategoryController::class, 'show']);
    Route::put('/{id}', [AssetCategoryController::class, 'update']);
    Route::delete('/{id}', [AssetCategoryController::class, 'destroy']);
});

// Asset Statuses Routes
Route::prefix('asset-statuses')->group(function () {
    Route::get('/', [AssetStatusController::class, 'index']);
    Route::post('/', [AssetStatusController::class, 'store']);
    Route::get('/{id}', [AssetStatusController::class, 'show']);
    Route::put('/{id}', [AssetStatusController::class, 'update']);
    Route::delete('/{id}', [AssetStatusController::class, 'destroy']);
});

// Tickets Routes
Route::prefix('tickets')->group(function () {
    Route::get('/', [TicketController::class, 'index']);
    Route::post('/', [TicketController::class, 'store']);
    Route::get('/stats', [TicketController::class, 'getStats']);
    Route::get('/{id}', [TicketController::class, 'show']);
    Route::put('/{id}', [TicketController::class, 'update']);
    Route::delete('/{id}', [TicketController::class, 'destroy']);
});

// CORS preflight handling
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
})->where('any', '.*');