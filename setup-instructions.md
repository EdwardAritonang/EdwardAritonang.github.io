# Instruksi Setup Lengkap Asset Management System

## Persiapan Awal

### 1. Install Software yang Diperlukan
- **XAMPP**: Download dari https://www.apachefriends.org/
- **Node.js**: Download dari https://nodejs.org/ (versi 16 atau lebih baru)
- **Composer**: Download dari https://getcomposer.org/
- **Git**: Download dari https://git-scm.com/

### 2. Start XAMPP
1. Buka XAMPP Control Panel
2. Start Apache dan MySQL
3. Pastikan tidak ada error di log

## Setup Database

### 1. Buat Database
1. Buka browser, akses: `http://localhost/phpmyadmin`
2. Klik "New" di sidebar kiri
3. Masukkan nama database: `asset_management`
4. Klik "Create"

### 2. Import Schema Database
1. Di phpMyAdmin, pilih database `asset_management`
2. Klik tab "Import"
3. Klik "Choose File" dan pilih file `database_schema.sql`
4. Klik "Go" untuk import
5. Pastikan semua tabel terbuat dengan data sample

## Setup Backend Laravel

### 1. Buat Project Laravel
```bash
# Buka terminal/command prompt
cd /path/to/your/workspace
composer create-project laravel/laravel backend
cd backend
```

### 2. Copy File Backend
Salin semua file yang sudah dibuat ke folder `backend`:
- `app/Models/` - Semua model
- `app/Http/Controllers/` - Semua controller
- `routes/api.php` - Routes API
- `config/cors.php` - Konfigurasi CORS
- `.env` - Environment configuration

### 3. Install Dependencies
```bash
composer install
```

### 4. Setup Environment
1. Edit file `.env` di folder `backend`
2. Pastikan konfigurasi database benar:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asset_management
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Generate Application Key
```bash
php artisan key:generate
```

### 6. Test Backend
```bash
php artisan serve
```
Buka browser: `http://localhost:8000/api/assets`
Seharusnya menampilkan JSON response dengan data aset.

## Setup Frontend React

### 1. Buat Project React
```bash
# Buka terminal baru
cd /path/to/your/workspace
npx create-react-app frontend
cd frontend
```

### 2. Install Dependencies
```bash
npm install axios react-router-dom recharts react-hook-form react-hot-toast lucide-react
npm install -D tailwindcss autoprefixer postcss
```

### 3. Setup Tailwind CSS
```bash
npx tailwindcss init -p
```

### 4. Copy File Frontend
Salin semua file yang sudah dibuat ke folder `frontend`:
- `src/components/` - Semua komponen React
- `src/services/` - API services
- `src/App.js` - Main app component
- `src/index.js` - Entry point
- `src/index.css` - Styles
- `public/index.html` - HTML template
- `package.json` - Dependencies
- `tailwind.config.js` - Tailwind config

### 5. Test Frontend
```bash
npm start
```
Buka browser: `http://localhost:3000`
Seharusnya menampilkan halaman dashboard.

## Menghubungkan Frontend ke Backend

### 1. CORS Configuration
Pastikan file `backend/config/cors.php` sudah benar:
```php
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### 2. API Configuration
File `frontend/src/services/api.js` sudah dikonfigurasi:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### 3. Test Koneksi
1. Pastikan backend berjalan di port 8000
2. Pastikan frontend berjalan di port 3000
3. Buka browser developer tools (F12)
4. Cek tab Network untuk memastikan API calls berhasil

## Testing Aplikasi

### 1. Test Dashboard
1. Buka `http://localhost:3000`
2. Pastikan dashboard menampilkan statistik
3. Pastikan grafik muncul dengan data

### 2. Test Asset Management
1. Klik menu "Assets"
2. Test fitur pencarian dan filter
3. Test tambah aset baru
4. Test edit aset
5. Test hapus aset
6. Test export CSV

### 3. Test API Endpoints
Buka browser dan test endpoint berikut:
- `http://localhost:8000/api/assets` - Daftar aset
- `http://localhost:8000/api/categories` - Daftar kategori
- `http://localhost:8000/api/statuses` - Daftar status
- `http://localhost:8000/api/assets/dashboard/stats` - Statistik dashboard

## Troubleshooting

### Error CORS
Jika ada error CORS:
1. Pastikan Laravel CORS middleware aktif
2. Restart Laravel server
3. Clear browser cache

### Error Database Connection
Jika ada error database:
1. Pastikan MySQL berjalan di XAMPP
2. Cek konfigurasi database di `.env`
3. Test koneksi database

### Error API Not Found
Jika API tidak ditemukan:
1. Pastikan Laravel server berjalan
2. Cek routes di `routes/api.php`
3. Test endpoint dengan Postman

### Error Frontend Not Loading
Jika frontend tidak load:
1. Pastikan semua dependencies terinstall
2. Cek console browser untuk error
3. Restart React development server

## Deployment

### Development
```bash
# Backend
cd backend
php artisan serve

# Frontend (terminal baru)
cd frontend
npm start
```

### Production
```bash
# Build frontend
cd frontend
npm run build

# Deploy backend ke server
# Upload folder backend ke server PHP
# Konfigurasi database production
```

## Fitur yang Sudah Implementasi

✅ Dashboard dengan statistik dan grafik
✅ CRUD operasi aset
✅ Filter dan pencarian
✅ Export CSV
✅ History tracking
✅ Responsive design
✅ Modern UI dengan Tailwind CSS
✅ API integration
✅ Error handling
✅ Loading states
✅ Toast notifications

## Fitur yang Akan Ditambahkan

🔄 Ticket management
🔄 User management
🔄 Notification system
🔄 Import Excel
🔄 Advanced reporting
🔄 Asset maintenance scheduling
🔄 Email notifications
🔄 Role-based access control

## Support

Jika ada masalah atau pertanyaan:
1. Cek error log di browser console
2. Cek Laravel log di `backend/storage/logs/`
3. Pastikan semua service berjalan dengan benar
4. Restart semua service jika diperlukan