import * as XLSX from 'xlsx';
import { Asset, AssetCategory, AssetStatus } from '../types';

export interface ImportResult {
  success: boolean;
  data?: Asset[];
  errors?: string[];
  warnings?: string[];
}

export interface ExportOptions {
  filename?: string;
  includeHistory?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Asset data to Excel mapping
const ASSET_COLUMNS = {
  'Asset Code': 'asset_code',
  'Asset Type': 'asset_type',
  'Serial Number': 'serial_number',
  'Hostname': 'hostname',
  'PO Number': 'nomor_po',
  'Location/Region': 'location_region',
  'Current User': 'user_now',
  'Current Office': 'office_now',
  'Status': 'status',
  'Remark': 'remark',
  'IP Address': 'ip_location',
  'Previous User': 'user_before',
  'Date Delivered': 'date_deliver_to_user',
  'Ticket Number': 'ticket_number',
  'Installed By': 'installed_by',
  'Replaced By': 'replaced_by',
  'Replacement Date': 'date_replacement',
  'Done By': 'done_by',
};

// Export assets to Excel
export const exportAssetsToExcel = (
  assets: Asset[],
  categories: AssetCategory[],
  statuses: AssetStatus[],
  options: ExportOptions = {}
): void => {
  try {
    // Prepare data for export
    const exportData = assets.map(asset => {
      const categoryName = categories.find(c => c.id === asset.asset_type_id)?.name || '';
      const statusName = statuses.find(s => s.id === asset.status_id)?.name || '';

      return {
        'Asset Code': asset.asset_code,
        'Asset Type': categoryName,
        'Serial Number': asset.serial_number,
        'Hostname': asset.hostname || '',
        'PO Number': asset.nomor_po || '',
        'Location/Region': asset.location_region,
        'Current User': asset.user_now || '',
        'Current Office': asset.office_now || '',
        'Status': statusName,
        'Remark': asset.remark || '',
        'IP Address': asset.ip_location || '',
        'Previous User': asset.user_before || '',
        'Date Delivered': asset.date_deliver_to_user || '',
        'Ticket Number': asset.ticket_number || '',
        'Installed By': asset.installed_by || '',
        'Replaced By': asset.replaced_by || '',
        'Replacement Date': asset.date_replacement || '',
        'Done By': asset.done_by || '',
      };
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Main assets sheet
    const assetsSheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Asset Code
      { wch: 12 }, // Asset Type
      { wch: 20 }, // Serial Number
      { wch: 15 }, // Hostname
      { wch: 15 }, // PO Number
      { wch: 20 }, // Location/Region
      { wch: 15 }, // Current User
      { wch: 15 }, // Current Office
      { wch: 12 }, // Status
      { wch: 30 }, // Remark
      { wch: 15 }, // IP Address
      { wch: 15 }, // Previous User
      { wch: 12 }, // Date Delivered
      { wch: 15 }, // Ticket Number
      { wch: 15 }, // Installed By
      { wch: 15 }, // Replaced By
      { wch: 12 }, // Replacement Date
      { wch: 15 }, // Done By
    ];
    
    assetsSheet['!cols'] = columnWidths;
    
    // Add header styling
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4F46E5' } },
      alignment: { horizontal: 'center' }
    };

    // Apply header styles
    const range = XLSX.utils.decode_range(assetsSheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!assetsSheet[cellAddress]) continue;
      assetsSheet[cellAddress].s = headerStyle;
    }

    XLSX.utils.book_append_sheet(workbook, assetsSheet, 'Assets');

    // Add reference sheets
    const categoriesSheet = XLSX.utils.json_to_sheet(
      categories.map(cat => ({ ID: cat.id, Name: cat.name, Description: cat.description || '' }))
    );
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Asset Categories');

    const statusesSheet = XLSX.utils.json_to_sheet(
      statuses.map(status => ({ ID: status.id, Name: status.name, Description: status.description || '' }))
    );
    XLSX.utils.book_append_sheet(workbook, statusesSheet, 'Asset Statuses');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = options.filename || `assets_export_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
};

// Import assets from Excel
export const importAssetsFromExcel = async (
  file: File,
  categories: AssetCategory[],
  statuses: AssetStatus[]
): Promise<ImportResult> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get the first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          
          if (jsonData.length < 2) {
            resolve({
              success: false,
              errors: ['Excel file must contain at least a header row and one data row']
            });
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];

          const errors: string[] = [];
          const warnings: string[] = [];
          const importedAssets: any[] = [];

          // Validate headers
          const requiredColumns = ['Asset Code', 'Asset Type', 'Serial Number', 'Location/Region', 'Status'];
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            resolve({
              success: false,
              errors: [`Missing required columns: ${missingColumns.join(', ')}`]
            });
            return;
          }

          // Process each row
          rows.forEach((row, index) => {
            const rowNumber = index + 2; // Excel row number (1-indexed + header)
            
            if (row.every(cell => !cell)) {
              // Skip empty rows
              return;
            }

            try {
              const asset: any = {};
              
              headers.forEach((header, colIndex) => {
                const value = row[colIndex];
                const fieldName = ASSET_COLUMNS[header as keyof typeof ASSET_COLUMNS];
                
                if (fieldName) {
                  if (header === 'Asset Type') {
                    const category = categories.find(c => c.name.toLowerCase() === value?.toLowerCase());
                    if (category) {
                      asset.asset_type_id = category.id;
                    } else if (value) {
                      errors.push(`Row ${rowNumber}: Invalid asset type "${value}"`);
                      return;
                    }
                  } else if (header === 'Status') {
                    const status = statuses.find(s => s.name.toLowerCase() === value?.toLowerCase());
                    if (status) {
                      asset.status_id = status.id;
                    } else if (value) {
                      errors.push(`Row ${rowNumber}: Invalid status "${value}"`);
                      return;
                    }
                  } else {
                    asset[fieldName] = value || null;
                  }
                }
              });

              // Validate required fields
              if (!asset.asset_code) {
                errors.push(`Row ${rowNumber}: Asset Code is required`);
                return;
              }
              if (!asset.serial_number) {
                errors.push(`Row ${rowNumber}: Serial Number is required`);
                return;
              }
              if (!asset.location_region) {
                errors.push(`Row ${rowNumber}: Location/Region is required`);
                return;
              }
              if (!asset.asset_type_id) {
                errors.push(`Row ${rowNumber}: Valid Asset Type is required`);
                return;
              }
              if (!asset.status_id) {
                errors.push(`Row ${rowNumber}: Valid Status is required`);
                return;
              }

              // Validate IP address format if provided
              if (asset.ip_location) {
                const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                if (!ipRegex.test(asset.ip_location)) {
                  warnings.push(`Row ${rowNumber}: Invalid IP address format "${asset.ip_location}"`);
                }
              }

              // Validate date formats
              if (asset.date_deliver_to_user && !/^\d{4}-\d{2}-\d{2}$/.test(asset.date_deliver_to_user)) {
                warnings.push(`Row ${rowNumber}: Invalid date format for "Date Delivered". Use YYYY-MM-DD format.`);
                asset.date_deliver_to_user = null;
              }
              if (asset.date_replacement && !/^\d{4}-\d{2}-\d{2}$/.test(asset.date_replacement)) {
                warnings.push(`Row ${rowNumber}: Invalid date format for "Replacement Date". Use YYYY-MM-DD format.`);
                asset.date_replacement = null;
              }

              importedAssets.push(asset);
              
            } catch (error) {
              errors.push(`Row ${rowNumber}: Error processing row - ${error}`);
            }
          });

          if (errors.length > 0) {
            resolve({
              success: false,
              errors,
              warnings
            });
            return;
          }

          resolve({
            success: true,
            data: importedAssets,
            warnings: warnings.length > 0 ? warnings : undefined
          });

        } catch (error) {
          resolve({
            success: false,
            errors: [`Error reading Excel file: ${error}`]
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          errors: ['Failed to read the uploaded file']
        });
      };

      reader.readAsBinaryString(file);
      
    } catch (error) {
      resolve({
        success: false,
        errors: [`Unexpected error: ${error}`]
      });
    }
  });
};

// Generate Excel template for asset import
export const generateImportTemplate = (
  categories: AssetCategory[],
  statuses: AssetStatus[]
): void => {
  try {
    const workbook = XLSX.utils.book_new();

    // Template sheet with headers and sample data
    const templateData = [
      // Headers
      Object.keys(ASSET_COLUMNS),
      // Sample row
      [
        'LAP-001',
        categories[0]?.name || 'Laptop',
        'SN123456789',
        'HOSTNAME-001',
        'PO-2024-001',
        'Jakarta',
        'John Doe',
        'IT Department',
        statuses[0]?.name || 'Active',
        'Sample remark',
        '192.168.1.100',
        '',
        '2024-01-15',
        'TKT-001',
        'Tech John',
        '',
        '',
        'Tech John'
      ]
    ];

    const templateSheet = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    const columnWidths = Object.keys(ASSET_COLUMNS).map(() => ({ wch: 15 }));
    templateSheet['!cols'] = columnWidths;

    // Add header styling
    const headerRange = XLSX.utils.decode_range('A1:' + XLSX.utils.encode_col(Object.keys(ASSET_COLUMNS).length - 1) + '1');
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4F46E5' } },
      alignment: { horizontal: 'center' }
    };

    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!templateSheet[cellAddress]) continue;
      templateSheet[cellAddress].s = headerStyle;
    }

    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Asset Import Template');

    // Add reference sheets
    const categoriesSheet = XLSX.utils.json_to_sheet(
      categories.map(cat => ({ Name: cat.name, Description: cat.description || '' }))
    );
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Valid Asset Types');

    const statusesSheet = XLSX.utils.json_to_sheet(
      statuses.map(status => ({ Name: status.name, Description: status.description || '' }))
    );
    XLSX.utils.book_append_sheet(workbook, statusesSheet, 'Valid Statuses');

    // Instructions sheet
    const instructions = [
      ['Asset Import Instructions'],
      [''],
      ['1. Fill in the "Asset Import Template" sheet with your asset data'],
      ['2. Required fields: Asset Code, Asset Type, Serial Number, Location/Region, Status'],
      ['3. Asset Type must match exactly with values in "Valid Asset Types" sheet'],
      ['4. Status must match exactly with values in "Valid Statuses" sheet'],
      ['5. Date fields must be in YYYY-MM-DD format'],
      ['6. IP Address must be in valid IPv4 format (e.g., 192.168.1.100)'],
      ['7. Remove this instructions sheet before importing'],
      [''],
      ['Tips:'],
      ['- Keep the header row intact'],
      ['- Remove empty rows'],
      ['- Ensure data quality before import'],
      ['- Use the reference sheets for valid values']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    instructionsSheet['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Save template
    const filename = `asset_import_template_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

  } catch (error) {
    console.error('Error generating template:', error);
    throw new Error('Failed to generate import template');
  }
};

// Export ticket data to Excel
export const exportTicketsToExcel = (tickets: any[], options: ExportOptions = {}): void => {
  try {
    const exportData = tickets.map(ticket => ({
      'Ticket Number': ticket.ticket_number,
      'Type': ticket.type,
      'Status': ticket.status,
      'Priority': ticket.priority,
      'Asset Code': ticket.asset?.asset_code || '',
      'Asset Hostname': ticket.asset?.hostname || '',
      'Technician': ticket.technician?.name || '',
      'Description': ticket.description || '',
      'Due Date': ticket.due_date || '',
      'Created Date': ticket.created_at ? new Date(ticket.created_at).toISOString().split('T')[0] : '',
      'Completed Date': ticket.completed_at ? new Date(ticket.completed_at).toISOString().split('T')[0] : '',
    }));

    const workbook = XLSX.utils.book_new();
    const ticketsSheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    ticketsSheet['!cols'] = [
      { wch: 15 }, // Ticket Number
      { wch: 12 }, // Type
      { wch: 12 }, // Status
      { wch: 10 }, // Priority
      { wch: 15 }, // Asset Code
      { wch: 15 }, // Asset Hostname
      { wch: 15 }, // Technician
      { wch: 40 }, // Description
      { wch: 12 }, // Due Date
      { wch: 12 }, // Created Date
      { wch: 12 }, // Completed Date
    ];

    XLSX.utils.book_append_sheet(workbook, ticketsSheet, 'Tickets');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = options.filename || `tickets_export_${timestamp}.xlsx`;
    
    XLSX.writeFile(workbook, filename);

  } catch (error) {
    console.error('Error exporting tickets to Excel:', error);
    throw new Error('Failed to export tickets to Excel');
  }
};