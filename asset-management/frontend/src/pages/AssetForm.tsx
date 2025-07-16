import React from 'react';

const AssetForm: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Form</h1>
          <p className="text-gray-600">Create or edit asset information</p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Asset Form component will be implemented here</p>
          <p className="text-sm text-gray-400 mt-2">
            This will include form validation and asset creation/editing
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetForm;