-- Database: asset_management
CREATE DATABASE IF NOT EXISTS asset_management;
USE asset_management;

-- Tabel Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'technician', 'user') DEFAULT 'user',
    department VARCHAR(255),
    position VARCHAR(255),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
    current_user_id INT,
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
    FOREIGN KEY (status_id) REFERENCES asset_statuses(id),
    FOREIGN KEY (current_user_id) REFERENCES users(id)
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
    status ENUM('open', 'in_progress', 'completed', 'cancelled', 'on_hold') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_technician INT,
    created_by INT,
    due_date DATETIME,
    completed_at DATETIME,
    category VARCHAR(100),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (assigned_technician) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabel Komentar Tiket
CREATE TABLE ticket_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel Attachment Tiket
CREATE TABLE ticket_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel Notifikasi
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'asset', 'ticket', 'maintenance') DEFAULT 'info',
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel Maintenance Schedule
CREATE TABLE maintenance_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    maintenance_type ENUM('preventive', 'corrective', 'emergency', 'upgrade') NOT NULL,
    scheduled_date DATETIME NOT NULL,
    completed_date DATETIME NULL,
    technician_id INT,
    description TEXT NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue') DEFAULT 'scheduled',
    cost DECIMAL(10,2),
    notes TEXT,
    next_maintenance_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (technician_id) REFERENCES users(id)
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

-- Insert sample users
INSERT INTO users (name, email, password, role, department, position, is_active) VALUES
('Admin User', 'admin@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'IT', 'System Administrator', TRUE),
('Manager User', 'manager@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 'IT', 'IT Manager', TRUE),
('Technician User', 'technician@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'technician', 'IT', 'IT Technician', TRUE),
('Regular User', 'user@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Marketing', 'Marketing Staff', TRUE);

-- Insert sample data aset
INSERT INTO assets (asset_code, asset_type_id, serial_number, hostname, po_number, location_region, current_user, current_user_id, office_now, status_id, remark, ip_location, user_before, date_deliver_to_user, ticket_number, installed_by, replaced_by, date_replacement, done_by) VALUES
('LAP001', 1, 'SN123456789', 'LAPTOP-JOHN', 'PO-2024-001', 'Jakarta Pusat', 'John Doe', 4, 'Kantor Pusat Lt. 3', 1, 'Laptop untuk development', '192.168.1.100', 'Jane Smith', '2024-01-15', 'TKT-2024-001', 'Tech Support', NULL, NULL, 'IT Team'),
('DESK001', 2, 'SN987654321', 'DESKTOP-ADMIN', 'PO-2024-002', 'Jakarta Selatan', 'Admin User', 1, 'Kantor Cabang Lt. 1', 1, 'Desktop untuk admin', '192.168.1.101', 'Manager', '2024-01-20', 'TKT-2024-002', 'Tech Support', NULL, NULL, 'IT Team'),
('MON001', 3, 'SN456789123', NULL, 'PO-2024-003', 'Jakarta Barat', 'Marketing Team', 4, 'Kantor Marketing', 1, 'Monitor 24 inch', '192.168.1.102', 'Sales Team', '2024-02-01', 'TKT-2024-003', 'Tech Support', NULL, NULL, 'IT Team'),
('PRINT001', 4, 'SN789123456', NULL, 'PO-2024-004', 'Jakarta Timur', 'HR Department', 4, 'Kantor HR', 1, 'Printer laser color', NULL, 'Finance Team', '2024-02-05', 'TKT-2024-004', 'Tech Support', NULL, NULL, 'IT Team'),
('RADIO001', 5, 'SN321654987', NULL, 'PO-2024-005', 'Bandung', 'Security Team', 4, 'Gedung Security', 1, 'Radio komunikasi', NULL, 'Security Guard', '2024-02-10', 'TKT-2024-005', 'Tech Support', NULL, NULL, 'IT Team'),
('STAR001', 6, 'SN147258369', NULL, 'PO-2024-006', 'Surabaya', 'Remote Office', 4, 'Kantor Remote', 1, 'Starlink internet', NULL, 'Remote Team', '2024-02-15', 'TKT-2024-006', 'Tech Support', NULL, NULL, 'IT Team');

-- Insert sample tickets
INSERT INTO tickets (ticket_number, asset_id, title, description, status, priority, assigned_technician, created_by, due_date, category, estimated_hours, cost) VALUES
('TKT-2024-001', 1, 'Installation Laptop John', 'Instalasi laptop baru untuk John Doe', 'completed', 'medium', 3, 1, '2024-01-20 10:00:00', 'Installation', 2.0, 0.00),
('TKT-2024-002', 2, 'Desktop Setup Admin', 'Setup desktop untuk admin user', 'completed', 'medium', 3, 1, '2024-01-25 10:00:00', 'Setup', 1.5, 0.00),
('TKT-2024-003', 3, 'Monitor Installation', 'Instalasi monitor untuk marketing team', 'completed', 'low', 3, 1, '2024-02-05 10:00:00', 'Installation', 1.0, 0.00),
('TKT-2024-004', 4, 'Printer Setup HR', 'Setup printer untuk HR department', 'completed', 'medium', 3, 1, '2024-02-10 10:00:00', 'Setup', 1.0, 0.00),
('TKT-2024-005', 5, 'Radio Installation', 'Instalasi radio komunikasi', 'completed', 'high', 3, 1, '2024-02-15 10:00:00', 'Installation', 3.0, 0.00),
('TKT-2024-006', 6, 'Starlink Setup', 'Setup starlink untuk remote office', 'completed', 'high', 3, 1, '2024-02-20 10:00:00', 'Setup', 4.0, 0.00);

-- Insert sample maintenance schedules
INSERT INTO maintenance_schedules (asset_id, maintenance_type, scheduled_date, technician_id, description, status) VALUES
(1, 'preventive', '2024-06-15 09:00:00', 3, 'Regular maintenance and cleaning', 'scheduled'),
(2, 'preventive', '2024-06-20 09:00:00', 3, 'System update and maintenance', 'scheduled'),
(3, 'preventive', '2024-06-25 09:00:00', 3, 'Monitor calibration and cleaning', 'scheduled');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, data, action_url) VALUES
(1, 'New Asset Created', 'Asset LAP001 has been created and assigned to John Doe', 'asset', '{"asset_id": 1, "asset_code": "LAP001"}', '/assets/1'),
(1, 'Ticket Completed', 'Ticket TKT-2024-001 has been completed', 'ticket', '{"ticket_id": 1, "ticket_number": "TKT-2024-001"}', '/tickets/1'),
(3, 'Maintenance Scheduled', 'You have been assigned to maintain asset LAP001 on 2024-06-15', 'maintenance', '{"schedule_id": 1}', '/maintenance/1');

-- Insert sample history
INSERT INTO asset_history (asset_id, action_type, old_value, new_value, changed_by, remark) VALUES
(1, 'status_change', 'Non-active', 'Active', 'IT Team', 'Asset activated for John Doe'),
(1, 'user_change', 'Jane Smith', 'John Doe', 'IT Team', 'Asset transferred to John Doe'),
(2, 'status_change', 'Non-active', 'Active', 'IT Team', 'Asset activated for Admin User'),
(2, 'user_change', 'Manager', 'Admin User', 'IT Team', 'Asset transferred to Admin User');