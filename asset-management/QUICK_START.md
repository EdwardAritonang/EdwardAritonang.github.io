# Quick Start Guide 🚀

## Prerequisites
- XAMPP/WAMP (untuk MySQL dan Apache)
- Node.js (v16+)
- PHP (v8.1+)
- Composer

## Setup Steps

### 1. Database Setup
```bash
# 1. Start XAMPP/WAMP
# 2. Buka http://localhost/phpmyadmin
# 3. Buat database: asset_management
# 4. Import file: database.sql
```

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
# Edit .env file untuk database connection
php artisan key:generate
php artisan serve
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Akses Aplikasi
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **phpMyAdmin**: http://localhost/phpmyadmin

## Default Data
Database sudah terisi dengan:
- 6 kategori aset (Laptop, Desktop, Monitor, Printer, Radio Link, Starlink)
- 9 status aset (Active, Non-active, Stolen, Broken, Spare, Replaced, Repair, Disposed, Sold)
- 3 sample aset
- 3 teknisi sample

## Development Tips
1. **Hot Reload**: Frontend otomatis reload saat ada perubahan
2. **API Testing**: Gunakan Postman atau browser untuk test API
3. **Database**: Gunakan phpMyAdmin untuk melihat data
4. **Logs**: Check Laravel logs di `backend/storage/logs/`

## Common Commands
```bash
# Backend
php artisan serve          # Start server
php artisan migrate        # Run migrations
php artisan tinker         # Laravel console

# Frontend
npm start                  # Start dev server
npm run build             # Build for production
npm test                  # Run tests
```

## Troubleshooting
- **Port conflict**: Ubah port dengan `php artisan serve --port=8001`
- **CORS issues**: Check SANCTUM_STATEFUL_DOMAINS di .env
- **Database error**: Pastikan MySQL service running

Happy coding! 🎉