import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { assetApi } from '../services/api';
import { Asset, AssetHistory } from '../types';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAssetData();
    }
  }, [id]);

  const loadAssetData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const [assetResponse, historyResponse] = await Promise.all([
        assetApi.getAsset(parseInt(id)),
        assetApi.getAssetHistory(parseInt(id))
      ]);

      setAsset(assetResponse.data);
      setHistory(historyResponse.data);
    } catch (error: any) {
      console.error('Error loading asset data:', error);
      setError('Failed to load asset data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset || !window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      await assetApi.deleteAsset(asset.id);
      navigate('/assets');
    } catch (error) {
      console.error('Error deleting asset:', error);
      setError('Failed to delete asset');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      'non-active': 'bg-gray-100 text-gray-800',
      stolen: 'bg-red-100 text-red-800',
      broken: 'bg-orange-100 text-orange-800',
      spare: 'bg-blue-100 text-blue-800',
      replaced: 'bg-purple-100 text-purple-800',
      repair: 'bg-yellow-100 text-yellow-800',
      disposed: 'bg-gray-100 text-gray-600',
      sold: 'bg-indigo-100 text-indigo-800',
    };

    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading asset details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-red-600 mt-4">{error || 'Asset not found'}</p>
            <Link
              to="/assets"
              className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Assets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Link
            to="/assets"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Assets
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{asset.asset_code}</h1>
            <p className="text-gray-600">{asset.hostname || 'No hostname'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/assets/${asset.id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Asset Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Asset Overview</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <InformationCircleIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusBadge(asset.asset_status?.name || '')}`}>
                    {asset.asset_status?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CpuChipIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm font-bold text-gray-900">{asset.asset_category?.name}</p>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <MapPinIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-sm font-bold text-gray-900">{asset.location_region}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div className="px-6 py-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Asset Code</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{asset.asset_code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{asset.serial_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Hostname</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.hostname || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">PO Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.nomor_po || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{asset.ip_location || 'Not set'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Assignment Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Assignment Information</h3>
          </div>
          <div className="px-6 py-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Current User</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                  {asset.user_now || 'Unassigned'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Office</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  {asset.office_now || 'Not set'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Previous User</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.user_before || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date Delivered</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(asset.date_deliver_to_user)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Installation & Maintenance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Installation & Maintenance</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Ticket Number</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{asset.ticket_number || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Installed By</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.installed_by || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Work Done By</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.done_by || 'Not set'}</dd>
              </div>
            </dl>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Replaced By</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.replaced_by || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Replacement Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(asset.date_replacement)}</dd>
              </div>
            </dl>
          </div>
          
          {asset.remark && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <dt className="text-sm font-medium text-gray-500">Remarks</dt>
              <dd className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">{asset.remark}</dd>
            </div>
          )}
        </div>
      </div>

      {/* Asset History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Asset History</h3>
          <p className="text-sm text-gray-500">Track all changes and activities</p>
        </div>
        <div className="px-6 py-4">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-gray-500">No history records found</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {history.map((record, index) => (
                  <li key={record.id}>
                    <div className="relative pb-8">
                      {index !== history.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            <ClockIcon className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {record.action_type} by{' '}
                              <span className="font-medium text-gray-900">{record.performed_by}</span>
                            </p>
                            {record.description && (
                              <p className="mt-1 text-sm text-gray-700">{record.description}</p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={record.created_at}>
                              {formatDate(record.created_at)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;