-- Database: asset_management
CREATE DATABASE IF NOT EXISTS asset_management;
USE asset_management;

-- Tabel Kategori Aset
CREATE TABLE asset_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Status Aset
CREATE TABLE asset_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Aset Utama
CREATE TABLE assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    asset_type_id INT NOT NULL,
    serial_number VARCHAR(100),
    hostname VARCHAR(100),
    po_number VARCHAR(100),
    location_region VARCHAR(200),
    current_user VARCHAR(200),
    office_now VARCHAR(200),
    status_id INT NOT NULL,
    remark TEXT,
    ip_location VARCHAR(45),
    user_before VARCHAR(200),
    date_deliver_to_user DATE,
    ticket_number VARCHAR(100),
    installed_by VARCHAR(200),
    replaced_by VARCHAR(50),
    date_replacement DATE,
    done_by VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_type_id) REFERENCES asset_categories(id),
    FOREIGN KEY (status_id) REFERENCES asset_statuses(id)
);

-- Tabel Riwayat Aset
CREATE TABLE asset_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    action_type ENUM('status_change', 'user_change', 'location_change', 'replacement') NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(200),
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remark TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- Tabel Tiket
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    asset_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_technician VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- Insert data kategori aset
INSERT INTO asset_categories (name, description) VALUES
('Laptop', 'Komputer portable untuk penggunaan mobile'),
('Desktop', 'Komputer desktop untuk penggunaan tetap'),
('Monitor', 'Layar monitor untuk komputer'),
('Printer', 'Perangkat cetak dokumen'),
('Radio Link', 'Perangkat komunikasi radio'),
('Starlink', 'Perangkat internet satelit');

-- Insert data status aset
INSERT INTO asset_statuses (name, description) VALUES
('Active', 'Aset sedang digunakan aktif'),
('Non-active', 'Aset tidak sedang digunakan'),
('Stolen', 'Aset hilang/dicuri'),
('Broken', 'Aset rusak'),
('Spare', 'Aset cadangan'),
('Replaced', 'Aset telah diganti'),
('Repair', 'Aset sedang diperbaiki'),
('Disposed', 'Aset telah dibuang'),
('Sold', 'Aset telah dijual');

-- Insert sample data aset
INSERT INTO assets (asset_code, asset_type_id, serial_number, hostname, po_number, location_region, current_user, office_now, status_id, remark, ip_location, user_before, date_deliver_to_user, ticket_number, installed_by, replaced_by, date_replacement, done_by) VALUES
('LAP001', 1, 'SN123456789', 'LAPTOP-JOHN', 'PO-2024-001', 'Jakarta Pusat', 'John Doe', 'Kantor Pusat Lt. 3', 1, 'Laptop untuk development', '192.168.1.100', 'Jane Smith', '2024-01-15', 'TKT-2024-001', 'Tech Support', NULL, NULL, 'IT Team'),
('DESK001', 2, 'SN987654321', 'DESKTOP-ADMIN', 'PO-2024-002', 'Jakarta Selatan', 'Admin User', 'Kantor Cabang Lt. 1', 1, 'Desktop untuk admin', '192.168.1.101', 'Manager', '2024-01-20', 'TKT-2024-002', 'Tech Support', NULL, NULL, 'IT Team'),
('MON001', 3, 'SN456789123', NULL, 'PO-2024-003', 'Jakarta Barat', 'Marketing Team', 'Kantor Marketing', 1, 'Monitor 24 inch', '192.168.1.102', 'Sales Team', '2024-02-01', 'TKT-2024-003', 'Tech Support', NULL, NULL, 'IT Team'),
('PRINT001', 4, 'SN789123456', NULL, 'PO-2024-004', 'Jakarta Timur', 'HR Department', 'Kantor HR', 1, 'Printer laser color', NULL, 'Finance Team', '2024-02-05', 'TKT-2024-004', 'Tech Support', NULL, NULL, 'IT Team'),
('RADIO001', 5, 'SN321654987', NULL, 'PO-2024-005', 'Bandung', 'Security Team', 'Gedung Security', 1, 'Radio komunikasi', NULL, 'Security Guard', '2024-02-10', 'TKT-2024-005', 'Tech Support', NULL, NULL, 'IT Team'),
('STAR001', 6, 'SN147258369', NULL, 'PO-2024-006', 'Surabaya', 'Remote Office', 'Kantor Remote', 1, 'Starlink internet', NULL, 'Remote Team', '2024-02-15', 'TKT-2024-006', 'Tech Support', NULL, NULL, 'IT Team');

-- Insert sample tickets
INSERT INTO tickets (ticket_number, asset_id, title, description, status, priority, assigned_technician) VALUES
('TKT-2024-001', 1, 'Installation Laptop John', 'Instalasi laptop baru untuk John Doe', 'completed', 'medium', 'Tech Support'),
('TKT-2024-002', 2, 'Desktop Setup Admin', 'Setup desktop untuk admin user', 'completed', 'medium', 'Tech Support'),
('TKT-2024-003', 3, 'Monitor Installation', 'Instalasi monitor untuk marketing team', 'completed', 'low', 'Tech Support'),
('TKT-2024-004', 4, 'Printer Setup HR', 'Setup printer untuk HR department', 'completed', 'medium', 'Tech Support'),
('TKT-2024-005', 5, 'Radio Installation', 'Instalasi radio komunikasi', 'completed', 'high', 'Tech Support'),
('TKT-2024-006', 6, 'Starlink Setup', 'Setup starlink untuk remote office', 'completed', 'high', 'Tech Support');

-- Insert sample history
INSERT INTO asset_history (asset_id, action_type, old_value, new_value, changed_by, remark) VALUES
(1, 'status_change', 'Non-active', 'Active', 'IT Team', 'Asset activated for John Doe'),
(1, 'user_change', 'Jane Smith', 'John Doe', 'IT Team', 'Asset transferred to John Doe'),
(2, 'status_change', 'Non-active', 'Active', 'IT Team', 'Asset activated for Admin User'),
(2, 'user_change', 'Manager', 'Admin User', 'IT Team', 'Asset transferred to Admin User');