-- Tabel referensi
CREATE TABLE asset_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE asset_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- Tabel utama aset
CREATE TABLE assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_type_id INT,
  asset_code VARCHAR(50),
  sn VARCHAR(50),
  hostname VARCHAR(50),
  po_number VARCHAR(50),
  location VARCHAR(100),
  user_now VARCHAR(100),
  office_now VARCHAR(100),
  status_id INT,
  remark TEXT,
  ip_location VARCHAR(50),
  user_before VARCHAR(100),
  date_deliver_to_user DATE,
  ticket_id INT,
  installed_by VARCHAR(100),
  replaced_by INT,
  date_replacement DATE,
  done_by VARCHAR(100),
  FOREIGN KEY (asset_type_id) REFERENCES asset_types(id),
  FOREIGN KEY (status_id) REFERENCES asset_statuses(id),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (replaced_by) REFERENCES assets(id)
);

CREATE TABLE asset_histories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT,
  user_before VARCHAR(100),
  user_after VARCHAR(100),
  status_before INT,
  status_after INT,
  date DATETIME,
  remark TEXT,
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(50),
  technician VARCHAR(100),
  asset_id INT,
  date DATE,
  remark TEXT,
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);