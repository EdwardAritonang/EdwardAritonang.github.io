import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

import { assetApi, ticketApi } from '../services/api';
import { AssetStats, TicketStats } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard: React.FC = () => {
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [assetData, ticketData] = await Promise.all([
          assetApi.getStats(),
          ticketApi.getStats(),
        ]);
        setAssetStats(assetData);
        setTicketStats(ticketData);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Assets',
      value: assetStats?.total_assets || 0,
      icon: ComputerDesktopIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/assets',
    },
    {
      title: 'Active Assets',
      value: assetStats?.active_assets || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/assets?status=active',
    },
    {
      title: 'Broken Assets',
      value: assetStats?.broken_assets || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      link: '/assets?status=broken',
    },
    {
      title: 'Under Repair',
      value: assetStats?.repair_assets || 0,
      icon: WrenchScrewdriverIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      link: '/assets?status=repair',
    },
  ];

  const ticketStatsCards = [
    {
      title: 'Total Tickets',
      value: ticketStats?.total_tickets || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Open Tickets',
      value: ticketStats?.open_tickets || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'In Progress',
      value: ticketStats?.in_progress_tickets || 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Resolved',
      value: ticketStats?.resolved_tickets || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const assetStatusChartData = {
    labels: assetStats?.assets_by_status.map(item => item.status_name) || [],
    datasets: [
      {
        data: assetStats?.assets_by_status.map(item => item.count) || [],
        backgroundColor: [
          '#22c55e', // Active - Green
          '#6b7280', // Non-active - Gray
          '#ef4444', // Broken - Red
          '#f59e0b', // Repair - Yellow
          '#3b82f6', // Spare - Blue
          '#8b5cf6', // Stolen - Purple
          '#64748b', // Disposed - Slate
          '#6366f1', // Sold - Indigo
          '#f97316', // Replaced - Orange
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const assetCategoryChartData = {
    labels: assetStats?.assets_by_category.map(item => item.category_name) || [],
    datasets: [
      {
        label: 'Assets by Category',
        data: assetStats?.assets_by_category.map(item => item.count) || [],
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Assets by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your asset management system</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/assets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Asset
          </Link>
          <Link
            to="/tickets/new"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Ticket
          </Link>
        </div>
      </div>

      {/* Asset Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                    <dd className="text-lg font-medium text-gray-900">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ticket Stats Cards */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Ticket Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ticketStatsCards.map((card, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${card.bgColor} rounded-lg mb-2`}>
                  <span className={`text-xl font-bold ${card.color}`}>{card.value}</span>
                </div>
                <p className="text-sm text-gray-600">{card.title}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Link
              to="/tickets"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
            >
              View all tickets
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Assets by Status</h3>
            <div className="chart-container">
              <Doughnut data={assetStatusChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Asset Category Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Assets by Category</h3>
            <div className="chart-container">
              <Bar data={assetCategoryChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/assets"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <ComputerDesktopIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Assets</p>
                <p className="text-sm text-gray-500">View and manage all assets</p>
              </div>
            </Link>
            <Link
              to="/tickets"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Support Tickets</p>
                <p className="text-sm text-gray-500">Handle support requests</p>
              </div>
            </Link>
            <Link
              to="/settings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Cog6ToothIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Configure system settings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;