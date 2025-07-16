-- Database: asset_management
-- Buat database terlebih dahulu di phpMyAdmin: CREATE DATABASE asset_management;

USE asset_management;

-- Tabel Kategori Aset
CREATE TABLE asset_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Status Aset
CREATE TABLE asset_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Utama Aset
CREATE TABLE assets (
    id_asset INT AUTO_INCREMENT PRIMARY KEY,
    asset_type_id INT NOT NULL,
    asset_code VARCHAR(100) UNIQUE NOT NULL,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    hostname VARCHAR(255),
    purchase_order VARCHAR(255),
    location_region VARCHAR(255),
    current_user VARCHAR(255),
    office_now VARCHAR(255),
    status_id INT NOT NULL,
    remark TEXT,
    ip_location VARCHAR(45),
    user_before VARCHAR(255),
    date_deliver_to_user DATE,
    ticket_number VARCHAR(255),
    installed_by VARCHAR(255),
    replaced_by INT NULL,
    date_replacement DATE,
    done_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_type_id) REFERENCES asset_categories(id),
    FOREIGN KEY (status_id) REFERENCES asset_statuses(id),
    FOREIGN KEY (replaced_by) REFERENCES assets(id_asset)
);

-- Tabel Riwayat Aset
CREATE TABLE asset_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    changed_field VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(255),
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(id_asset)
);

-- Tabel Teknisi
CREATE TABLE technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Tiket
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(255) UNIQUE NOT NULL,
    asset_id INT,
    technician_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id_asset),
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

-- Insert data kategori aset
INSERT INTO asset_categories (category_name, description) VALUES
('Laptop', 'Komputer portabel untuk keperluan kerja'),
('Desktop', 'Komputer desktop untuk workstation'),
('Monitor', 'Monitor display untuk komputer'),
('Printer', 'Perangkat printer untuk cetak dokumen'),
('Radio Link', 'Perangkat komunikasi radio link'),
('Starlink', 'Perangkat internet satelit Starlink');

-- Insert data status aset
INSERT INTO asset_statuses (status_name, description) VALUES
('Active', 'Aset sedang digunakan dan berfungsi normal'),
('Non-active', 'Aset tidak sedang digunakan'),
('Stolen', 'Aset hilang atau dicuri'),
('Broken', 'Aset rusak dan tidak berfungsi'),
('Spare', 'Aset cadangan siap digunakan'),
('Replaced', 'Aset telah diganti dengan yang baru'),
('Repair', 'Aset sedang dalam proses perbaikan'),
('Disposed', 'Aset telah dibuang atau dihapuskan'),
('Sold', 'Aset telah dijual');

-- Insert sample data aset
INSERT INTO assets (asset_type_id, asset_code, serial_number, hostname, purchase_order, location_region, current_user, office_now, status_id, remark, ip_location, date_deliver_to_user, ticket_number, installed_by) VALUES
(1, 'LP001', 'SN12345678', 'laptop-001', 'PO-2024-001', 'Jakarta', 'John Doe', 'Head Office', 1, 'Laptop untuk development', '192.168.1.100', '2024-01-15', 'TK-001', 'Tech Support'),
(2, 'DT001', 'SN87654321', 'desktop-001', 'PO-2024-002', 'Bandung', 'Jane Smith', 'Branch Office', 1, 'Desktop untuk design', '192.168.1.101', '2024-01-20', 'TK-002', 'IT Admin'),
(3, 'MN001', 'SN11223344', NULL, 'PO-2024-003', 'Surabaya', 'Bob Wilson', 'Regional Office', 1, 'Monitor 24 inch', NULL, '2024-01-25', 'TK-003', 'Tech Support');

-- Insert sample technicians
INSERT INTO technicians (name, email, phone, department) VALUES
('Tech Support', 'tech@company.com', '081234567890', 'IT Department'),
('IT Admin', 'admin@company.com', '081234567891', 'IT Department'),
('Field Engineer', 'field@company.com', '081234567892', 'Field Service');