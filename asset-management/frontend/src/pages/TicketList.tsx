import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assetApi } from '../services/api';
import { Ticket, Technician, PaginatedResponse } from '../types';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface TicketFilters {
  search: string;
  status: string;
  priority: string;
  technician: string;
  type: string;
}

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  
  const [filters, setFilters] = useState<TicketFilters>({
    search: '',
    status: '',
    priority: '',
    technician: '',
    type: '',
  });

  useEffect(() => {
    loadTickets();
    loadTechnicians();
  }, [currentPage, filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
      };
      
      const response = await assetApi.getTickets(params);
      setTickets(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const response = await assetApi.getTechnicians();
      setTechnicians(response.data);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      technician: '',
      type: '',
    });
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await assetApi.deleteTicket(id);
        loadTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTickets.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTickets.length} tickets?`)) {
      try {
        await Promise.all(selectedTickets.map(id => assetApi.deleteTicket(id)));
        setSelectedTickets([]);
        loadTickets();
      } catch (error) {
        console.error('Error deleting tickets:', error);
      }
    }
  };

  const toggleTicketSelection = (id: number) => {
    setSelectedTickets(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedTickets(prev =>
      prev.length === tickets.length ? [] : tickets.map(ticket => ticket.id)
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string; icon: any } } = {
      'open': { bg: 'bg-blue-100', text: 'text-blue-800', icon: ClockIcon },
      'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ExclamationCircleIcon },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', icon: ClockIcon },
    };

    const config = statusColors[status] || statusColors['open'];
    const IconComponent = config.icon;

    return {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`,
      icon: IconComponent,
    };
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };

    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
          <p className="text-gray-600">Manage installation and maintenance tickets</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
          <Link
            to="/tickets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Ticket
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            {selectedTickets.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete ({selectedTickets.length})
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="installation">Installation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="replacement">Replacement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Technician</label>
                <select
                  value={filters.technician}
                  onChange={(e) => handleFilterChange('technician', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Technicians</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Ticket Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedTickets.length === tickets.length && tickets.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => {
                  const statusBadge = getStatusBadge(ticket.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={() => toggleTicketSelection(ticket.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{ticket.ticket_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.type}
                          </div>
                          <div className="text-xs text-gray-400">
                            Created: {formatDate(ticket.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.asset ? ticket.asset.asset_code : 'No asset'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.asset ? ticket.asset.hostname : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={statusBadge.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.technician ? ticket.technician.name : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.due_date ? formatDate(ticket.due_date) : 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/tickets/${ticket.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(ticket.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;