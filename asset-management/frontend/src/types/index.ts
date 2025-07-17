export interface Asset {
  id_asset: number;
  asset_type_id: number;
  asset_code: string;
  serial_number: string;
  hostname?: string;
  purchase_order?: string;
  location_region: string;
  current_user?: string;
  office_now?: string;
  status_id: number;
  remark?: string;
  ip_location?: string;
  user_before?: string;
  date_deliver_to_user?: string;
  ticket_number?: string;
  installed_by?: string;
  replaced_by?: number;
  date_replacement?: string;
  done_by?: string;
  created_at: string;
  updated_at: string;
  assetCategory?: AssetCategory;
  assetStatus?: AssetStatus;
  history?: AssetHistory[];
  tickets?: Ticket[];
}

export interface AssetCategory {
  id: number;
  category_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetStatus {
  id: number;
  status_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetHistory {
  id: number;
  asset_id: number;
  changed_field: string;
  old_value?: string;
  new_value?: string;
  changed_by: string;
  change_date: string;
  notes?: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  asset_id?: number;
  technician_id?: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  asset?: Asset;
  technician?: Technician;
}

export interface Technician {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetStats {
  total_assets: number;
  active_assets: number;
  spare_assets: number;
  broken_assets: number;
  repair_assets: number;
  assets_by_category: Array<{
    category_name: string;
    count: number;
  }>;
  assets_by_status: Array<{
    status_name: string;
    count: number;
  }>;
}

export interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  high_priority_tickets: number;
  urgent_priority_tickets: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface FilterOptions {
  search?: string;
  category?: number;
  status?: number;
  location?: string;
  per_page?: number;
  page?: number;
}

export interface AssetFormData {
  asset_type_id: number;
  asset_code: string;
  serial_number: string;
  hostname?: string;
  purchase_order?: string;
  location_region: string;
  current_user?: string;
  office_now?: string;
  status_id: number;
  remark?: string;
  ip_location?: string;
  user_before?: string;
  date_deliver_to_user?: string;
  ticket_number?: string;
  installed_by?: string;
  replaced_by?: number;
  date_replacement?: string;
  done_by?: string;
}