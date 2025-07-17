import React, { useState, useEffect } from 'react';
import { assetApi } from '../services/api';
import { Asset, AssetCategory, AssetStatus, AssetStats } from '../types';
import { exportAssetsToExcel, exportTicketsToExcel } from '../utils/excelUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ReportFilters {
  dateRange: 'last30days' | 'last90days' | 'last6months' | 'lastyear' | 'custom';
  startDate: string;
  endDate: string;
  category: string;
  status: string;
  location: string;
}

interface ReportData {
  assetsByCategory: { name: string; count: number; color: string }[];
  assetsByStatus: { name: string; count: number; color: string }[];
  assetsByLocation: { name: string; count: number }[];
  monthlyTrends: { month: string; added: number; disposed: number }[];
  utilizationRate: { category: string; total: number; active: number; rate: number }[];
  maintenanceAlerts: Asset[];
  replacementAlerts: Asset[];
  summary: {
    totalAssets: number;
    activeAssets: number;
    brokenAssets: number;
    spareAssets: number;
    valueEstimate: number;
  };
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [statuses, setStatuses] = useState<AssetStatus[]>([]);
  const [activeReport, setActiveReport] = useState<'overview' | 'detailed' | 'trends' | 'alerts'>('overview');
  
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'last90days',
    startDate: '',
    endDate: '',
    category: '',
    status: '',
    location: '',
  });

  useEffect(() => {
    loadReportData();
    loadCategories();
    loadStatuses();
  }, [filters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load all assets with filters
      const assetsResponse = await assetApi.getAssets({ per_page: 10000 });
      const assets = assetsResponse.data;

      // Process data for reports
      const processedData = processAssetData(assets);
      setReportData(processedData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await assetApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const response = await assetApi.getStatuses();
      setStatuses(response);
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  };

  const processAssetData = (assets: Asset[]): ReportData => {
    // Color schemes
    const categoryColors = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#DB2777'];
    const statusColors = {
      active: '#10B981',
      'non-active': '#6B7280',
      stolen: '#EF4444',
      broken: '#F59E0B',
      spare: '#3B82F6',
      replaced: '#8B5CF6',
      repair: '#F59E0B',
      disposed: '#6B7280',
      sold: '#6366F1',
    };

    // Group by category
    const categoryMap = new Map<string, number>();
    assets.forEach(asset => {
      const categoryName = asset.asset_category?.name || 'Unknown';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });

    const assetsByCategory = Array.from(categoryMap.entries()).map(([name, count], index) => ({
      name,
      count,
      color: categoryColors[index % categoryColors.length],
    }));

    // Group by status
    const statusMap = new Map<string, number>();
    assets.forEach(asset => {
      const statusName = asset.asset_status?.name || 'Unknown';
      statusMap.set(statusName, (statusMap.get(statusName) || 0) + 1);
    });

    const assetsByStatus = Array.from(statusMap.entries()).map(([name, count]) => ({
      name,
      count,
      color: statusColors[name as keyof typeof statusColors] || '#6B7280',
    }));

    // Group by location
    const locationMap = new Map<string, number>();
    assets.forEach(asset => {
      const location = asset.location_region || 'Unknown';
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });

    const assetsByLocation = Array.from(locationMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // Mock monthly trends (in real app, this would come from historical data)
    const monthlyTrends = [
      { month: 'Jan', added: 15, disposed: 2 },
      { month: 'Feb', added: 25, disposed: 5 },
      { month: 'Mar', added: 30, disposed: 3 },
      { month: 'Apr', added: 20, disposed: 8 },
      { month: 'May', added: 35, disposed: 4 },
      { month: 'Jun', added: 40, disposed: 6 },
    ];

    // Calculate utilization rates
    const utilizationRate = assetsByCategory.map(category => {
      const categoryAssets = assets.filter(a => a.asset_category?.name === category.name);
      const activeAssets = categoryAssets.filter(a => a.asset_status?.name === 'active').length;
      return {
        category: category.name,
        total: category.count,
        active: activeAssets,
        rate: category.count > 0 ? Math.round((activeAssets / category.count) * 100) : 0,
      };
    });

    // Maintenance alerts (assets needing attention)
    const maintenanceAlerts = assets.filter(asset => 
      asset.asset_status?.name === 'repair' || asset.asset_status?.name === 'broken'
    );

    // Replacement alerts (old assets or multiple repairs)
    const replacementAlerts = assets.filter(asset => {
      // Mock logic - in real app, this would be based on age, repair history, etc.
      return asset.remark?.toLowerCase().includes('old') || 
             asset.remark?.toLowerCase().includes('replace') ||
             asset.asset_status?.name === 'disposed';
    });

    // Summary statistics
    const totalAssets = assets.length;
    const activeAssets = assets.filter(a => a.asset_status?.name === 'active').length;
    const brokenAssets = assets.filter(a => 
      a.asset_status?.name === 'broken' || a.asset_status?.name === 'repair'
    ).length;
    const spareAssets = assets.filter(a => a.asset_status?.name === 'spare').length;
    
    // Mock value estimate (in real app, this would be calculated from asset values)
    const valueEstimate = totalAssets * 1500; // Assuming $1500 average per asset

    return {
      assetsByCategory,
      assetsByStatus,
      assetsByLocation,
      monthlyTrends,
      utilizationRate,
      maintenanceAlerts,
      replacementAlerts,
      summary: {
        totalAssets,
        activeAssets,
        brokenAssets,
        spareAssets,
        valueEstimate,
      },
    };
  };

  const handleExportAssets = async () => {
    try {
      const allAssetsResponse = await assetApi.getAssets({ per_page: 10000 });
      exportAssetsToExcel(allAssetsResponse.data, categories, statuses, {
        filename: `asset_report_${new Date().toISOString().split('T')[0]}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting assets:', error);
    }
  };

  const handleExportTickets = async () => {
    try {
      const allTicketsResponse = await assetApi.getTickets({ per_page: 10000 });
      exportTicketsToExcel(allTicketsResponse.data, {
        filename: `ticket_report_${new Date().toISOString().split('T')[0]}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting tickets:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Generating reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive asset insights and analytics</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportAssets}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Assets
          </button>
          <button
            onClick={handleExportTickets}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Tickets
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'detailed', label: 'Detailed Analysis', icon: TableCellsIcon },
              { key: 'trends', label: 'Trends', icon: PresentationChartLineIcon },
              { key: 'alerts', label: 'Alerts', icon: DocumentChartBarIcon },
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveReport(tab.key as any)}
                  className={`${
                    activeReport === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {activeReport === 'overview' && reportData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-blue-100">Total Assets</p>
                      <p className="text-2xl font-bold">{reportData.summary.totalAssets}</p>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-green-100">Active Assets</p>
                      <p className="text-2xl font-bold">{reportData.summary.activeAssets}</p>
                    </div>
                    <ChartPieIcon className="h-8 w-8 text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-red-100">Need Attention</p>
                      <p className="text-2xl font-bold">{reportData.summary.brokenAssets}</p>
                    </div>
                    <DocumentChartBarIcon className="h-8 w-8 text-red-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-purple-100">Estimated Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.summary.valueEstimate)}</p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets by Category */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assets by Category</h3>
                  <div className="h-64">
                    <Pie
                      data={{
                        labels: reportData.assetsByCategory.map(item => item.name),
                        datasets: [{
                          data: reportData.assetsByCategory.map(item => item.count),
                          backgroundColor: reportData.assetsByCategory.map(item => item.color),
                          borderWidth: 2,
                          borderColor: '#fff',
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Assets by Status */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assets by Status</h3>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: reportData.assetsByStatus.map(item => item.name),
                        datasets: [{
                          label: 'Count',
                          data: reportData.assetsByStatus.map(item => item.count),
                          backgroundColor: reportData.assetsByStatus.map(item => item.color),
                          borderRadius: 4,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Utilization Rates */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Utilization Rates by Category</h3>
                <div className="space-y-4">
                  {reportData.utilizationRate.map(item => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-900">{item.category}</span>
                          <span className="text-gray-500">{item.active}/{item.total} ({item.rate}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${item.rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeReport === 'trends' && reportData && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Acquisition Trends</h3>
                <div className="h-64">
                  <Line
                    data={{
                      labels: reportData.monthlyTrends.map(item => item.month),
                      datasets: [
                        {
                          label: 'Assets Added',
                          data: reportData.monthlyTrends.map(item => item.added),
                          borderColor: '#10B981',
                          backgroundColor: '#10B981',
                          tension: 0.4,
                        },
                        {
                          label: 'Assets Disposed',
                          data: reportData.monthlyTrends.map(item => item.disposed),
                          borderColor: '#EF4444',
                          backgroundColor: '#EF4444',
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeReport === 'alerts' && reportData && (
            <div className="space-y-6">
              {/* Maintenance Alerts */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-800 mb-4">
                  Maintenance Required ({reportData.maintenanceAlerts.length})
                </h3>
                {reportData.maintenanceAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {reportData.maintenanceAlerts.slice(0, 5).map(asset => (
                      <div key={asset.id_asset} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="font-medium">{asset.asset_code}</span>
                          <span className="ml-2 text-sm text-gray-500">{asset.hostname}</span>
                        </div>
                        <span className="text-sm text-red-600">{asset.asset_status?.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-700">No assets currently requiring maintenance.</p>
                )}
              </div>

              {/* Replacement Alerts */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-orange-800 mb-4">
                  Replacement Recommended ({reportData.replacementAlerts.length})
                </h3>
                {reportData.replacementAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {reportData.replacementAlerts.slice(0, 5).map(asset => (
                      <div key={asset.id_asset} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="font-medium">{asset.asset_code}</span>
                          <span className="ml-2 text-sm text-gray-500">{asset.hostname}</span>
                        </div>
                        <span className="text-sm text-orange-600">End of Life</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-orange-700">No assets currently marked for replacement.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;