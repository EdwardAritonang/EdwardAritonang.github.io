<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Asset;
use App\Models\User;
use App\Models\TicketComment;
use App\Models\TicketAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::with(['asset', 'createdBy', 'assignedTechnician']);

        // Filter berdasarkan parameter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assigned_technician')) {
            $query->where('assigned_technician', $request->assigned_technician);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $tickets
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'assigned_technician' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'category' => 'nullable|string',
            'estimated_hours' => 'nullable|numeric',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket = Ticket::create([
            'ticket_number' => 'TKT-' . date('Y') . '-' . str_pad(Ticket::count() + 1, 4, '0', STR_PAD_LEFT),
            'asset_id' => $request->asset_id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'open',
            'priority' => $request->priority,
            'assigned_technician' => $request->assigned_technician,
            'created_by' => auth()->id() ?? 1, // Default user ID
            'due_date' => $request->due_date,
            'category' => $request->category,
            'estimated_hours' => $request->estimated_hours,
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ticket created successfully',
            'data' => $ticket->load(['asset', 'createdBy', 'assignedTechnician'])
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $ticket = Ticket::with(['asset', 'createdBy', 'assignedTechnician', 'comments.user', 'attachments'])
            ->find($id);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:200',
            'description' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:open,in_progress,completed,cancelled,on_hold',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'assigned_technician' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'category' => 'nullable|string',
            'estimated_hours' => 'nullable|numeric',
            'actual_hours' => 'nullable|numeric',
            'cost' => 'nullable|numeric',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Set completed_at if status changed to completed
        if ($request->filled('status') && $request->status === 'completed' && $ticket->status !== 'completed') {
            $request->merge(['completed_at' => now()]);
        }

        $ticket->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully',
            'data' => $ticket->load(['asset', 'createdBy', 'assignedTechnician'])
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        $ticket->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ticket deleted successfully'
        ]);
    }

    public function addComment(Request $request, $id): JsonResponse
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string',
            'is_internal' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id() ?? 1,
            'comment' => $request->comment,
            'is_internal' => $request->is_internal ?? false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'data' => $comment->load('user')
        ]);
    }

    public function uploadAttachment(Request $request, $id): JsonResponse
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240' // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('ticket-attachments', $filename, 'public');

        $attachment = TicketAttachment::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id() ?? 1,
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Attachment uploaded successfully',
            'data' => $attachment
        ]);
    }

    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_tickets' => Ticket::count(),
            'open_tickets' => Ticket::where('status', 'open')->count(),
            'in_progress_tickets' => Ticket::where('status', 'in_progress')->count(),
            'completed_tickets' => Ticket::where('status', 'completed')->count(),
            'urgent_tickets' => Ticket::where('priority', 'urgent')->count(),
            'overdue_tickets' => Ticket::where('due_date', '<', now())->whereNotIn('status', ['completed', 'cancelled'])->count()
        ];

        $priorityStats = Ticket::selectRaw('priority, count(*) as total')
            ->groupBy('priority')
            ->get();

        $statusStats = Ticket::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'priority_stats' => $priorityStats,
                'status_stats' => $statusStats
            ]
        ]);
    }
}