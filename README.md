# Asset Management Web App

Aplikasi manajemen aset IT dan perangkat elektronik berbasis web (CRUD) untuk mencatat, memantau, dan mengelola seluruh aset perusahaan secara real-time dan terpusat.

## Struktur Folder

```
asset-management/
├── backend/     (Laravel)
├── frontend/    (React + TypeScript + Tailwind)
├── README.md    (Dokumentasi)
```

## Fitur Utama
- Dashboard ringkasan aset (grafik, jumlah per status/kategori)
- CRUD aset, filter & pencarian dinamis
- Riwayat histori penggunaan aset
- Manajemen tiket & instalasi
- Export/Import Excel
- Notifikasi pengingat

## Setup Cepat

### 1. Database (XAMPP/phpMyAdmin)
- Import file SQL di `backend/database/asset_management.sql`

### 2. Backend (Laravel)
- Masuk ke folder `backend/`
- Copy `.env.example` ke `.env` dan sesuaikan koneksi database
- Jalankan:
  ```bash
  composer install
  php artisan key:generate
  php artisan migrate
  php artisan serve
  ```

### 3. Frontend (React + Tailwind)
- Masuk ke folder `frontend/`
- Jalankan:
  ```bash
  npm install
  npm start
  ```

### 4. Akses
- Backend API: http://localhost:8000/api
- Frontend: http://localhost:3000

## Teknologi
- Backend: Laravel, MySQL, Laravel Excel
- Frontend: React, TypeScript, Tailwind CSS, axios, recharts

## Catatan
- Status warna hanya di frontend (tidak di database)
- Semua kode siap dijalankan lokal via XAMPP + VS Code + npm + composer
