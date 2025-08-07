<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\MaintenanceController;

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

// Ticket routes
Route::prefix('tickets')->group(function () {
    Route::get('/', [TicketController::class, 'index']);
    Route::post('/', [TicketController::class, 'store']);
    Route::get('/{id}', [TicketController::class, 'show']);
    Route::put('/{id}', [TicketController::class, 'update']);
    Route::delete('/{id}', [TicketController::class, 'destroy']);
    Route::post('/{id}/comments', [TicketController::class, 'addComment']);
    Route::post('/{id}/attachments', [TicketController::class, 'uploadAttachment']);
    Route::get('/dashboard/stats', [TicketController::class, 'dashboard']);
});

// User routes
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/dashboard/stats', [UserController::class, 'dashboard']);
});

// Notification routes
Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread', [NotificationController::class, 'unread']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
});

// Import routes
Route::prefix('import')->group(function () {
    Route::post('/assets', [ImportController::class, 'importAssets']);
    Route::get('/template', [ImportController::class, 'getTemplate']);
});

// Report routes
Route::prefix('reports')->group(function () {
    Route::get('/assets', [ReportController::class, 'assetReport']);
    Route::get('/tickets', [ReportController::class, 'ticketReport']);
    Route::get('/maintenance', [ReportController::class, 'maintenanceReport']);
    Route::get('/cost', [ReportController::class, 'costReport']);
    Route::get('/user-activity', [ReportController::class, 'userActivityReport']);
    Route::get('/dashboard', [ReportController::class, 'dashboardReport']);
    Route::get('/export', [ReportController::class, 'exportReport']);
});

// Maintenance routes
Route::prefix('maintenance')->group(function () {
    Route::get('/', [MaintenanceController::class, 'index']);
    Route::post('/', [MaintenanceController::class, 'store']);
    Route::get('/{id}', [MaintenanceController::class, 'show']);
    Route::put('/{id}', [MaintenanceController::class, 'update']);
    Route::delete('/{id}', [MaintenanceController::class, 'destroy']);
    Route::get('/dashboard/stats', [MaintenanceController::class, 'dashboard']);
    Route::post('/auto-schedule', [MaintenanceController::class, 'autoSchedule']);
    Route::post('/check-overdue', [MaintenanceController::class, 'checkOverdue']);
});