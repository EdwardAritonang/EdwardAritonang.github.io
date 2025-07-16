import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Settings component will be implemented here</p>
          <p className="text-sm text-gray-400 mt-2">
            This will include asset categories, statuses, and system configuration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;