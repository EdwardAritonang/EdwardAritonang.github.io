<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportController extends Controller
{
    public function importAssets(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240' // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Remove header row
            $headers = array_shift($rows);
            
            $imported = 0;
            $errors = [];

            foreach ($rows as $index => $row) {
                try {
                    $data = array_combine($headers, $row);
                    
                    // Validate required fields
                    if (empty($data['Asset Code']) || empty($data['Category']) || empty($data['Status'])) {
                        $errors[] = "Row " . ($index + 2) . ": Missing required fields";
                        continue;
                    }

                    // Find category and status IDs
                    $category = AssetCategory::where('name', $data['Category'])->first();
                    $status = AssetStatus::where('name', $data['Status'])->first();

                    if (!$category) {
                        $errors[] = "Row " . ($index + 2) . ": Category '{$data['Category']}' not found";
                        continue;
                    }

                    if (!$status) {
                        $errors[] = "Row " . ($index + 2) . ": Status '{$data['Status']}' not found";
                        continue;
                    }

                    // Check if asset code already exists
                    if (Asset::where('asset_code', $data['Asset Code'])->exists()) {
                        $errors[] = "Row " . ($index + 2) . ": Asset code '{$data['Asset Code']}' already exists";
                        continue;
                    }

                    // Create asset
                    Asset::create([
                        'asset_code' => $data['Asset Code'],
                        'asset_type_id' => $category->id,
                        'serial_number' => $data['Serial Number'] ?? null,
                        'hostname' => $data['Hostname'] ?? null,
                        'po_number' => $data['PO Number'] ?? null,
                        'location_region' => $data['Location'] ?? null,
                        'current_user' => $data['Current User'] ?? null,
                        'office_now' => $data['Office'] ?? null,
                        'status_id' => $status->id,
                        'remark' => $data['Remark'] ?? null,
                        'ip_location' => $data['IP Location'] ?? null,
                        'user_before' => $data['User Before'] ?? null,
                        'date_deliver_to_user' => $data['Date Deliver'] ?? null,
                        'ticket_number' => $data['Ticket'] ?? null,
                        'installed_by' => $data['Installed By'] ?? null,
                        'replaced_by' => $data['Replaced By'] ?? null,
                        'date_replacement' => $data['Date Replacement'] ?? null,
                        'done_by' => $data['Done By'] ?? null
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Import completed. {$imported} assets imported successfully.",
                'data' => [
                    'imported' => $imported,
                    'errors' => $errors
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing file: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTemplate(): JsonResponse
    {
        $headers = [
            'Asset Code',
            'Category',
            'Serial Number',
            'Hostname',
            'PO Number',
            'Location',
            'Current User',
            'Office',
            'Status',
            'Remark',
            'IP Location',
            'User Before',
            'Date Deliver',
            'Ticket',
            'Installed By',
            'Replaced By',
            'Date Replacement',
            'Done By'
        ];

        $categories = AssetCategory::pluck('name')->toArray();
        $statuses = AssetStatus::pluck('name')->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'headers' => $headers,
                'categories' => $categories,
                'statuses' => $statuses,
                'sample_data' => [
                    [
                        'LAP002',
                        'Laptop',
                        'SN123456789',
                        'LAPTOP-JANE',
                        'PO-2024-007',
                        'Jakarta Pusat',
                        'Jane Smith',
                        'Kantor Pusat Lt. 2',
                        'Active',
                        'Laptop untuk marketing',
                        '192.168.1.103',
                        'John Doe',
                        '2024-03-01',
                        'TKT-2024-007',
                        'Tech Support',
                        '',
                        '',
                        'IT Team'
                    ]
                ]
            ]
        ]);
    }
}