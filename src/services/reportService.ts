import { Platform } from 'react-native';
import { Lead } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ReportService {
  /**
   * Generates a detailed CSV file (readable by Excel) of selected leads and initiates download
   */
  static async exportToExcel(leads: Lead[]): Promise<{ success: boolean; filename: string; path?: string }> {
    await delay(1200); // Simulate processing delay
    
    const headers = ['Lead ID', 'Name', 'Phone', 'Email', 'Destination', 'Package', 'Source', 'Budget (₹)', 'Status', 'Executive', 'Created Date', 'Travel Date'];
    
    const rows = leads.map(lead => [
      lead.id,
      `"${lead.name.replace(/"/g, '""')}"`,
      lead.phone,
      lead.email,
      lead.destination,
      `"${lead.travelPackage.replace(/"/g, '""')}"`,
      lead.leadSource,
      lead.budget.toString(),
      lead.leadStatus,
      lead.assignedExecutive,
      lead.createdDate,
      lead.travelDate
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const filename = `leads_report_${new Date().toISOString().slice(0,10)}.csv`;

    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return { success: true, filename };
      } catch (error) {
        console.error('Error downloading CSV on web:', error);
        return { success: false, filename };
      }
    } else {
      // Mobile code path simulation using Expo Sharing
      console.log(`[Mobile Simulation] Generated Excel content of length: ${csvContent.length} bytes`);
      console.log(`[Mobile Simulation] Share dialog triggered for file: ${filename}`);
      return { 
        success: true, 
        filename, 
        path: `file:///documents/urban_cruise/reports/${filename}` 
      };
    }
  }

  /**
   * Generates a beautiful HTML-based print preview of the leads (functions as a PDF export)
   */
  static async exportToPDF(leads: Lead[]): Promise<{ success: boolean; filename: string; html?: string }> {
    await delay(1500); // Simulate compilation and rendering delay

    const filename = `leads_summary_${new Date().toISOString().slice(0,10)}.pdf`;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; padding: 20px; }
            h1 { color: #4F46E5; font-size: 24px; margin-bottom: 5px; }
            h2 { color: #4b5563; font-size: 14px; margin-bottom: 20px; font-weight: 400; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th { background-color: #4F46E5; color: white; text-align: left; padding: 10px 8px; font-weight: 600; }
            td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
            tr:nth-child(even) td { background-color: #f9fafb; }
            .status { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; text-transform: uppercase; }
            .status-New { background-color: #dbeafe; color: #1e40af; }
            .status-Contacted { background-color: #fef3c7; color: #92400e; }
            .status-Follow-Up { background-color: #e0f2fe; color: #075985; }
            .status-Converted { background-color: #d1fae5; color: #065f46; }
            .status-Rejected { background-color: #fee2e2; color: #991b1b; }
            .summary-cards { display: flex; gap: 15px; margin-bottom: 25px; }
            .card { flex: 1; padding: 12px; background-color: #f3f4f6; border-radius: 8px; border: 1px solid #e5e7eb; }
            .card-title { font-size: 10px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
            .card-value { font-size: 18px; font-weight: bold; color: #111827; }
          </style>
        </head>
        <body>
          <h1>Urban Cruise Travel</h1>
          <h2>Lead Management System Report &mdash; Generated on ${new Date().toLocaleDateString('en-IN')}</h2>
          
          <div class="summary-cards">
            <div class="card">
              <div class="card-title">Total Exported Leads</div>
              <div class="card-value">${leads.length}</div>
            </div>
            <div class="card">
              <div class="card-title">Converted Leads</div>
              <div class="card-value">${leads.filter(l => l.leadStatus === 'Converted').length}</div>
            </div>
            <div class="card">
              <div class="card-title">Conversion Rate</div>
              <div class="card-value">
                ${leads.length > 0 ? ((leads.filter(l => l.leadStatus === 'Converted').length / leads.length) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Destination</th>
                <th>Budget</th>
                <th>Source</th>
                <th>Executive</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${leads.map(lead => `
                <tr>
                  <td><strong>${lead.id}</strong></td>
                  <td>${lead.name}</td>
                  <td>${lead.destination}</td>
                  <td>₹${lead.budget.toLocaleString('en-IN')}</td>
                  <td>${lead.leadSource}</td>
                  <td>${lead.assignedExecutive}</td>
                  <td><span class="status status-${lead.leadStatus}">${lead.leadStatus}</span></td>
                  <td>${lead.createdDate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    if (Platform.OS === 'web') {
      try {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          // Let page styles load, then trigger print
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
          return { success: true, filename };
        }
        return { success: false, filename };
      } catch (error) {
        console.error('Error generating PDF print preview:', error);
        return { success: false, filename };
      }
    } else {
      // Mobile code path using expo-print
      console.log(`[Mobile Simulation] Compiling HTML template for ${leads.length} leads to PDF`);
      console.log(`[Mobile Simulation] Triggered Native Print Manager for file: ${filename}`);
      return { 
        success: true, 
        filename,
        html: htmlContent
      };
    }
  }
}
