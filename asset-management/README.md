# Asset Management System

Sistem manajemen aset berbasis web yang dibangun dengan **React + TypeScript + Tailwind CSS** (frontend) dan **Laravel** (backend) serta **MySQL** sebagai database.

## 🚀 Fitur Utama

### 1. Dashboard Ringkasan Aset
- Jumlah aset aktif, spare, rusak, diganti, dll
- Grafik aset berdasarkan kategori & status
- Statistik tiket dan overview sistem

### 2. Manajemen Aset (CRUD)
- Tambah, edit, hapus, dan lihat detail aset
- Filter & pencarian dinamis berdasarkan SN, hostname, user, lokasi, kategori, atau status
- Riwayat perubahan aset lengkap

### 3. Manajemen Tiket & Instalasi
- Kaitkan aset dengan nomor tiket & teknisi
- Tracking status tiket (open, in progress, resolved, closed)
- Priority management (low, medium, high, urgent)

### 4. Export & Import Excel
- Export data aset ke Excel untuk pelaporan
- Import data aset dari Excel untuk migrasi data

### 5. Notifikasi & Monitoring
- Sistem notifikasi untuk perubahan status
- Monitoring aset yang mendekati masa penggantian

## 📋 Struktur Database

### Tabel Utama:
- **assets**: Data utama aset dengan semua field yang diperlukan
- **asset_categories**: Kategori aset (Laptop, Desktop, Monitor, Printer, Radio Link, Starlink)
- **asset_statuses**: Status aset (Active, Non-active, Stolen, Broken, Spare, Replaced, Repair, Disposed, Sold)
- **asset_history**: Riwayat perubahan aset
- **tickets**: Tiket support dan instalasi
- **technicians**: Data teknisi

## 🛠️ Teknologi yang Digunakan

### Frontend:
- **React 18** dengan **TypeScript**
- **Tailwind CSS** untuk styling
- **React Router** untuk navigasi
- **Axios** untuk HTTP requests
- **Chart.js** untuk visualisasi data
- **React Toastify** untuk notifikasi

### Backend:
- **Laravel 10** (PHP Framework)
- **Laravel Sanctum** untuk autentikasi API
- **MySQL** sebagai database

## 📦 Instalasi dan Setup

### Prerequisites:
- **Node.js** (v16 atau lebih baru)
- **PHP** (v8.1 atau lebih baru)
- **Composer** (PHP package manager)
- **MySQL** (XAMPP/WAMP/MAMP)

### 1. Setup Database

1. **Buka phpMyAdmin** (http://localhost/phpmyadmin)
2. **Buat database baru**: `asset_management`
3. **Import file SQL**:
   ```sql
   -- Jalankan file database.sql yang ada di root folder
   ```

### 2. Setup Backend (Laravel)

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Konfigurasi database di .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asset_management
DB_USERNAME=root
DB_PASSWORD=

# Jalankan server Laravel
php artisan serve
```

Backend akan berjalan di: http://localhost:8000

### 3. Setup Frontend (React)

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm start
```

Frontend akan berjalan di: http://localhost:3000

## 🔧 Konfigurasi

### Backend Configuration (.env):
```env
APP_NAME="Asset Management System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asset_management
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

### Frontend Configuration:
Buat file `.env` di folder frontend:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 🚀 Cara Menjalankan Aplikasi

### Development Mode:

1. **Jalankan Backend**:
   ```bash
   cd backend
   php artisan serve
   ```

2. **Jalankan Frontend** (terminal baru):
   ```bash
   cd frontend
   npm start
   ```

3. **Akses aplikasi**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api

### Production Mode:

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy ke server** dengan konfigurasi yang sesuai

## 📖 API Endpoints

### Assets:
- `GET /api/assets` - List semua aset
- `POST /api/assets` - Tambah aset baru
- `GET /api/assets/{id}` - Detail aset
- `PUT /api/assets/{id}` - Update aset
- `DELETE /api/assets/{id}` - Hapus aset
- `GET /api/assets/stats` - Statistik aset
- `GET /api/assets/{id}/history` - Riwayat aset

### Categories & Statuses:
- `GET /api/asset-categories` - List kategori
- `GET /api/asset-statuses` - List status

### Tickets:
- `GET /api/tickets` - List tiket
- `POST /api/tickets` - Buat tiket baru
- `GET /api/tickets/{id}` - Detail tiket
- `PUT /api/tickets/{id}` - Update tiket
- `DELETE /api/tickets/{id}` - Hapus tiket

## 🎨 Fitur UI/UX

### Design System:
- **Modern & Clean**: Interface yang bersih dan mudah digunakan
- **Responsive**: Bekerja di desktop, tablet, dan mobile
- **Color Scheme**: Menggunakan warna yang konsisten dan profesional
- **Icons**: Menggunakan Heroicons untuk konsistensi visual

### Komponen Utama:
- **Dashboard**: Overview dengan chart dan statistik
- **Data Tables**: Tabel responsif dengan sorting dan filtering
- **Forms**: Form yang user-friendly dengan validasi
- **Modals**: Dialog untuk konfirmasi dan detail
- **Notifications**: Toast notifications untuk feedback

## 🔒 Security Features

- **API Authentication**: Menggunakan Laravel Sanctum
- **Input Validation**: Validasi di backend dan frontend
- **CORS Protection**: Konfigurasi CORS yang aman
- **SQL Injection Prevention**: Menggunakan Eloquent ORM

## 📱 Responsive Design

Aplikasi ini fully responsive dan dapat diakses dengan baik di:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Error**:
   - Pastikan konfigurasi CORS di Laravel sudah benar
   - Check SANCTUM_STATEFUL_DOMAINS di .env

2. **Database Connection Error**:
   - Pastikan MySQL service berjalan
   - Check kredensial database di .env

3. **404 API Error**:
   - Pastikan Laravel server berjalan di port 8000
   - Check REACT_APP_API_URL di frontend

## 🚀 Development Roadmap

### Phase 1 (Current):
- ✅ Basic CRUD operations
- ✅ Dashboard with statistics
- ✅ Asset management
- ✅ Ticket system

### Phase 2 (Next):
- 🔄 Advanced filtering and search
- 🔄 Excel import/export functionality
- 🔄 User authentication and authorization
- 🔄 Advanced reporting

### Phase 3 (Future):
- 📋 Mobile app
- 📋 Barcode/QR code scanning
- 📋 Advanced analytics
- 📋 Integration with external systems

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Jika ada pertanyaan atau butuh bantuan, silakan buat issue di repository ini.

---

**Happy Coding! 🎉**