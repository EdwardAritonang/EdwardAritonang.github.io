import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Asset Management Dashboard</h1>
        <p className="text-blue-700">Pantau dan kelola seluruh aset IT & elektronik perusahaan secara real-time.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card Ringkasan */}
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold text-green-700">120</div>
          <div className="text-sm text-gray-500">Aset Aktif</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold text-yellow-700">8</div>
          <div className="text-sm text-gray-500">Aset Repair</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold text-red-700">3</div>
          <div className="text-sm text-gray-500">Aset Broken/Stolen</div>
        </div>
      </div>
      {/* Placeholder Grafik */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="text-lg font-semibold mb-2 text-blue-700">Grafik Aset per Kategori/Status</div>
        <div className="h-40 flex items-center justify-center text-gray-400">[Grafik akan tampil di sini]</div>
      </div>
      {/* Placeholder Tabel Aset */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="text-lg font-semibold mb-2 text-blue-700">Daftar Aset</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1">Kode</th>
                <th className="px-2 py-1">SN</th>
                <th className="px-2 py-1">Hostname</th>
                <th className="px-2 py-1">User</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1">AS-001</td>
                <td className="px-2 py-1">SN123456</td>
                <td className="px-2 py-1">LAPTOP-01</td>
                <td className="px-2 py-1">Budi</td>
                <td className="px-2 py-1"><span className="bg-green-100 text-green-700 px-2 py-1 rounded">Active</span></td>
                <td className="px-2 py-1"><button className="text-blue-600">Detail</button></td>
              </tr>
              {/* Tambahkan baris dinamis di sini */}
            </tbody>
          </table>
        </div>
      </div>
      {/* Placeholder Notifikasi */}
      <div className="bg-yellow-100 text-yellow-700 rounded p-4">
        <strong>Notifikasi:</strong> Ada 2 aset yang mendekati masa penggantian!
      </div>
    </div>
  );
}

export default App;
