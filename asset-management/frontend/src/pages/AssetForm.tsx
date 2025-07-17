import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetApi } from '../services/api';
import { Asset, AssetCategory, AssetStatus, Technician } from '../types';
import {
  ArrowLeftIcon,
  SaveIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface FormData {
  asset_type_id: string;
  asset_code: string;
  serial_number: string;
  hostname: string;
  nomor_po: string;
  location_region: string;
  user_now: string;
  office_now: string;
  status_id: string;
  remark: string;
  ip_location: string;
  user_before: string;
  date_deliver_to_user: string;
  ticket_number: string;
  installed_by: string;
  replaced_by: string;
  date_replacement: string;
  done_by: string;
}

const AssetForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [statuses, setStatuses] = useState<AssetStatus[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<FormData>({
    asset_type_id: '',
    asset_code: '',
    serial_number: '',
    hostname: '',
    nomor_po: '',
    location_region: '',
    user_now: '',
    office_now: '',
    status_id: '',
    remark: '',
    ip_location: '',
    user_before: '',
    date_deliver_to_user: '',
    ticket_number: '',
    installed_by: '',
    replaced_by: '',
    date_replacement: '',
    done_by: '',
  });

  useEffect(() => {
    loadInitialData();
    if (isEditing) {
      loadAsset();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, statusesRes, techniciansRes] = await Promise.all([
        assetApi.getCategories(),
        assetApi.getStatuses(),
        assetApi.getTechnicians(),
      ]);

      setCategories(categoriesRes.data);
      setStatuses(statusesRes.data);
      setTechnicians(techniciansRes.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadAsset = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await assetApi.getAsset(parseInt(id));
      const asset = response.data;

      setFormData({
        asset_type_id: asset.asset_type_id?.toString() || '',
        asset_code: asset.asset_code || '',
        serial_number: asset.serial_number || '',
        hostname: asset.hostname || '',
        nomor_po: asset.nomor_po || '',
        location_region: asset.location_region || '',
        user_now: asset.user_now || '',
        office_now: asset.office_now || '',
        status_id: asset.status_id?.toString() || '',
        remark: asset.remark || '',
        ip_location: asset.ip_location || '',
        user_before: asset.user_before || '',
        date_deliver_to_user: asset.date_deliver_to_user || '',
        ticket_number: asset.ticket_number || '',
        installed_by: asset.installed_by || '',
        replaced_by: asset.replaced_by || '',
        date_replacement: asset.date_replacement || '',
        done_by: asset.done_by || '',
      });
    } catch (error) {
      console.error('Error loading asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.asset_type_id) newErrors.asset_type_id = 'Asset category is required';
    if (!formData.asset_code) newErrors.asset_code = 'Asset code is required';
    if (!formData.serial_number) newErrors.serial_number = 'Serial number is required';
    if (!formData.location_region) newErrors.location_region = 'Location is required';
    if (!formData.status_id) newErrors.status_id = 'Status is required';

    // Validate IP address format if provided
    if (formData.ip_location) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ip_location)) {
        newErrors.ip_location = 'Please enter a valid IP address';
      }
    }

    // Validate date formats
    if (formData.date_deliver_to_user && !/^\d{4}-\d{2}-\d{2}$/.test(formData.date_deliver_to_user)) {
      newErrors.date_deliver_to_user = 'Please enter a valid date (YYYY-MM-DD)';
    }
    if (formData.date_replacement && !/^\d{4}-\d{2}-\d{2}$/.test(formData.date_replacement)) {
      newErrors.date_replacement = 'Please enter a valid date (YYYY-MM-DD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      // Convert string IDs to numbers for API
      const submitData = {
        ...formData,
        asset_type_id: parseInt(formData.asset_type_id),
        status_id: parseInt(formData.status_id),
      };

      if (isEditing) {
        await assetApi.updateAsset(parseInt(id!), submitData);
      } else {
        await assetApi.createAsset(submitData);
      }

      navigate('/assets');
    } catch (error: any) {
      console.error('Error saving asset:', error);
      
      // Handle validation errors from API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'An error occurred while saving the asset' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const generateAssetCode = () => {
    const category = categories.find(c => c.id === parseInt(formData.asset_type_id));
    if (category) {
      const prefix = category.name.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({ ...prev, asset_code: `${prefix}-${timestamp}` }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading asset data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/assets')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Assets
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Asset' : 'Create New Asset'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update asset information' : 'Add a new asset to the system'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errors.general}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          {/* Basic Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <p className="text-sm text-gray-500">Essential asset details</p>
          </div>
          
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Asset Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="asset_type_id"
                  value={formData.asset_type_id}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.asset_type_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.asset_type_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.asset_type_id}</p>
                )}
              </div>

              {/* Asset Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Asset Code <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="asset_code"
                    value={formData.asset_code}
                    onChange={handleInputChange}
                    className={`flex-1 block w-full border rounded-l-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.asset_code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter asset code..."
                  />
                  <button
                    type="button"
                    onClick={generateAssetCode}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                </div>
                {errors.asset_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.asset_code}</p>
                )}
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.serial_number ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter serial number..."
                />
                {errors.serial_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.serial_number}</p>
                )}
              </div>

              {/* Hostname */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Hostname</label>
                <input
                  type="text"
                  name="hostname"
                  value={formData.hostname}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter hostname..."
                />
              </div>

              {/* Purchase Order Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">PO Number</label>
                <input
                  type="text"
                  name="nomor_po"
                  value={formData.nomor_po}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter PO number..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status_id"
                  value={formData.status_id}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.status_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select status...</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                {errors.status_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.status_id}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Assignment */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Location & Assignment</h3>
            <p className="text-sm text-gray-500">Asset location and user assignment</p>
          </div>
          
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location/Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location/Region <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location_region"
                  value={formData.location_region}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.location_region ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter location/region..."
                />
                {errors.location_region && (
                  <p className="mt-1 text-sm text-red-600">{errors.location_region}</p>
                )}
              </div>

              {/* Current User */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Current User</label>
                <input
                  type="text"
                  name="user_now"
                  value={formData.user_now}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter current user..."
                />
              </div>

              {/* Current Office */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Office</label>
                <input
                  type="text"
                  name="office_now"
                  value={formData.office_now}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter current office..."
                />
              </div>

              {/* IP Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <input
                  type="text"
                  name="ip_location"
                  value={formData.ip_location}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.ip_location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter IP address..."
                />
                {errors.ip_location && (
                  <p className="mt-1 text-sm text-red-600">{errors.ip_location}</p>
                )}
              </div>

              {/* Previous User */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Previous User</label>
                <input
                  type="text"
                  name="user_before"
                  value={formData.user_before}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter previous user..."
                />
              </div>

              {/* Date Delivered to User */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Delivered to User</label>
                <input
                  type="date"
                  name="date_deliver_to_user"
                  value={formData.date_deliver_to_user}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.date_deliver_to_user ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date_deliver_to_user && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_deliver_to_user}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket & Installation Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ticket & Installation Management</h3>
            <p className="text-sm text-gray-500">Installation and maintenance tracking</p>
          </div>
          
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ticket Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Ticket Number</label>
                <input
                  type="text"
                  name="ticket_number"
                  value={formData.ticket_number}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter ticket number..."
                />
              </div>

              {/* Installed By */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Installed By</label>
                <input
                  type="text"
                  name="installed_by"
                  value={formData.installed_by}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter installer name..."
                />
              </div>

              {/* Replaced By */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Replaced By</label>
                <input
                  type="text"
                  name="replaced_by"
                  value={formData.replaced_by}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter replacement asset..."
                />
              </div>

              {/* Date Replacement */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Replacement Date</label>
                <input
                  type="date"
                  name="date_replacement"
                  value={formData.date_replacement}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.date_replacement ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date_replacement && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_replacement}</p>
                )}
              </div>

              {/* Done By */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Work Done By</label>
                <input
                  type="text"
                  name="done_by"
                  value={formData.done_by}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter technician name..."
                />
              </div>
            </div>

            {/* Remark */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter any additional remarks or notes..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Asset' : 'Create Asset'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;