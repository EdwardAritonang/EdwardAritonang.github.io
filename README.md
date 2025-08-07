# Asset Management System

Sistem manajemen aset IT berbasis web dengan teknologi React (frontend) dan Laravel (backend) dengan database MySQL.

## Fitur Utama

### 1. Dashboard Ringkasan Aset
- Jumlah aset berdasarkan status (Active, Non-active, Broken, Repair, dll)
- Grafik aset berdasarkan kategori & status
- Statistik real-time

### 2. Filter & Pencarian Dinamis
- Pencarian berdasarkan SN, hostname, user, lokasi
- Filter berdasarkan kategori dan status
- Pencarian real-time

### 3. Riwayat Pengguna Aset
- Log perubahan user, status, dan penggantian
- Tracking history lengkap

### 4. Export & Import Excel
- Export data aset ke CSV
- Kemudahan pelaporan dan migrasi data

### 5. Manajemen Tiket & Instalasi
- Kaitkan asset dengan nomor tiket & teknisi
- Tracking instalasi dan maintenance

### 6. Notifikasi Pengingat
- Aset mendekati masa penggantian atau perbaikan
- Alert system

## Teknologi yang Digunakan

### Backend
- **Laravel 10** - PHP Framework
- **MySQL** - Database
- **XAMPP** - Local development environment

### Frontend
- **React 18** - JavaScript Library
- **Tailwind CSS** - CSS Framework
- **Recharts** - Chart Library
- **React Router** - Routing
- **Axios** - HTTP Client
- **React Hot Toast** - Notifications

## Struktur Database

### Tabel Utama
1. **assets** - Data aset utama
2. **asset_categories** - Kategori aset (Laptop, Desktop, Monitor, dll)
3. **asset_statuses** - Status aset (Active, Non-active, Broken, dll)
4. **asset_history** - Riwayat perubahan aset
5. **tickets** - Data tiket terkait aset

### Field Aset
- ID_asset (Asset Code)
- Asset Type (Category)
- SN (Serial Number)
- Hostname
- PO Number
- Location/Region
- Current User
- Office (Now)
- Status
- Remark
- IP Location
- User Before
- Date Deliver to User
- Ticket Number
- Installed By
- Replaced By
- Date Replacement
- Done By

## Instalasi dan Setup

### Prerequisites
- XAMPP (Apache, MySQL, PHP)
- Node.js (v16+)
- Composer
- Git

### Langkah 1: Setup Database

1. **Start XAMPP**
   ```bash
   # Start Apache dan MySQL di XAMPP Control Panel
   ```

2. **Buat Database**
   ```bash
   # Buka phpMyAdmin di http://localhost/phpmyadmin
   # Buat database baru dengan nama: asset_management
   ```

3. **Import Database Schema**
   ```bash
   # Import file database_schema.sql ke database asset_management
   # File ini sudah berisi struktur tabel dan sample data
   ```

### Langkah 2: Setup Backend Laravel

1. **Masuk ke direktori backend**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   composer install
   ```

3. **Setup Environment**
   ```bash
   # Copy file .env.example ke .env (sudah dibuat)
   # Edit file .env dengan konfigurasi database:
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=asset_management
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

5. **Run Migrations (Optional - jika menggunakan migration)**
   ```bash
   php artisan migrate
   ```

6. **Start Laravel Server**
   ```bash
   php artisan serve
   # Server akan berjalan di http://localhost:8000
   ```

### Langkah 3: Setup Frontend React

1. **Masuk ke direktori frontend**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start React Development Server**
   ```bash
   npm start
   # Aplikasi akan berjalan di http://localhost:3000
   ```

## Cara Menghubungkan Database ke Frontend

### 1. Konfigurasi API Service
File `frontend/src/services/api.js` sudah dikonfigurasi untuk menghubungkan ke backend Laravel:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### 2. CORS Configuration
Backend Laravel sudah dikonfigurasi untuk menerima request dari frontend:

```php
// config/cors.php
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### 3. API Endpoints
Backend menyediakan endpoint berikut:

- `GET /api/assets` - Daftar aset dengan filter
- `POST /api/assets` - Tambah aset baru
- `GET /api/assets/{id}` - Detail aset
- `PUT /api/assets/{id}` - Update aset
- `DELETE /api/assets/{id}` - Hapus aset
- `GET /api/assets/dashboard/stats` - Statistik dashboard
- `GET /api/assets/export/csv` - Export CSV
- `GET /api/categories` - Daftar kategori
- `GET /api/statuses` - Daftar status

### 4. Data Flow
1. Frontend React memanggil API Laravel
2. Laravel mengakses database MySQL
3. Data dikembalikan dalam format JSON
4. Frontend menampilkan data di UI

## Cara Menjalankan Aplikasi

### Development Mode

1. **Start Backend**
   ```bash
   cd backend
   php artisan serve
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm start
   ```

3. **Akses Aplikasi**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api

### Production Mode

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy ke Server**
   - Upload folder `build` ke web server
   - Upload folder `backend` ke server PHP
   - Konfigurasi database production

## Fitur Aplikasi

### Dashboard
- Statistik aset real-time
- Grafik kategori dan status
- Recent activity

### Asset Management
- CRUD operasi aset
- Filter dan pencarian
- Export data
- History tracking

### Responsive Design
- Mobile-friendly
- Modern UI dengan Tailwind CSS
- Smooth animations

## Troubleshooting

### Masalah CORS
Jika ada error CORS, pastikan:
1. Laravel CORS middleware aktif
2. Frontend dan backend berjalan di port yang benar
3. Headers dikonfigurasi dengan benar

### Masalah Database
Jika ada error database:
1. Pastikan MySQL berjalan di XAMPP
2. Cek konfigurasi database di `.env`
3. Pastikan database `asset_management` sudah dibuat

### Masalah API
Jika API tidak merespons:
1. Cek Laravel server berjalan
2. Cek endpoint URL di frontend
3. Cek network tab di browser developer tools

## Struktur Folder

```
asset-management/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── Models/
│   ├── config/
│   ├── routes/
│   └── .env
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   ├── public/
│   └── package.json
├── database_schema.sql     # Database schema
└── README.md
```

## Kontribusi

Untuk menambahkan fitur baru:
1. Buat branch baru
2. Implementasi fitur
3. Test thoroughly
4. Submit pull request

## License

MIT License - feel free to use this project for your needs.