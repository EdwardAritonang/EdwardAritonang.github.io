import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import AssetList from './components/Assets/AssetList';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<AssetList />} />
              <Route path="/tickets" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900">Tickets</h1><p className="text-gray-600">Ticket management coming soon...</p></div>} />
              <Route path="/reports" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900">Reports</h1><p className="text-gray-600">Reports coming soon...</p></div>} />
              <Route path="/users" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900">Users</h1><p className="text-gray-600">User management coming soon...</p></div>} />
              <Route path="/notifications" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900">Notifications</h1><p className="text-gray-600">Notifications coming soon...</p></div>} />
              <Route path="/settings" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900">Settings</h1><p className="text-gray-600">Settings coming soon...</p></div>} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;