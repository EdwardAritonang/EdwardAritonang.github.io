<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Asset;
use App\Models\Technician;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['asset', 'technician']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->byStatus($request->status);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority) {
            $query->byPriority($request->priority);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('ticket_number', 'like', '%' . $request->search . '%')
                  ->orWhere('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $perPage = $request->get('per_page', 10);
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ticket_number' => 'required|unique:tickets,ticket_number',
            'asset_id' => 'nullable|exists:assets,id_asset',
            'technician_id' => 'nullable|exists:technicians,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:open,in_progress,resolved,closed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket = Ticket::create($request->all());

        return response()->json([
            'message' => 'Ticket created successfully',
            'data' => $ticket->load(['asset', 'technician'])
        ], 201);
    }

    public function show($id)
    {
        $ticket = Ticket::with(['asset', 'technician'])->find($id);

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json($ticket);
    }

    public function update(Request $request, $id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'ticket_number' => 'sometimes|unique:tickets,ticket_number,' . $id,
            'asset_id' => 'nullable|exists:assets,id_asset',
            'technician_id' => 'nullable|exists:technicians,id',
            'title' => 'sometimes|string',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'status' => 'sometimes|in:open,in_progress,resolved,closed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket->update($request->all());

        return response()->json([
            'message' => 'Ticket updated successfully',
            'data' => $ticket->load(['asset', 'technician'])
        ]);
    }

    public function destroy($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully'
        ]);
    }

    public function getStats()
    {
        $stats = [
            'total_tickets' => Ticket::count(),
            'open_tickets' => Ticket::byStatus('open')->count(),
            'in_progress_tickets' => Ticket::byStatus('in_progress')->count(),
            'resolved_tickets' => Ticket::byStatus('resolved')->count(),
            'closed_tickets' => Ticket::byStatus('closed')->count(),
            'high_priority_tickets' => Ticket::byPriority('high')->count(),
            'urgent_priority_tickets' => Ticket::byPriority('urgent')->count(),
        ];

        return response()->json($stats);
    }
}