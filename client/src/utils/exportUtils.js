import { Alert, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Utility to export ticket records as formatted CSV file
 */
export const exportTicketsToCSV = async (tickets = [], filename = 'TMS_Tickets_Report.csv') => {
  if (!tickets || tickets.length === 0) {
    Alert.alert('Export', 'No tickets available to export.');
    return;
  }

  const headers = [
    'Ticket ID',
    'Title',
    'Category',
    'Priority',
    'Status',
    'Created By',
    'Assigned To',
    'Department',
    'Created Date',
    'SLA Due Date',
  ];

  const rows = tickets.map((t) => [
    `"${t.ticketId || t._id || ''}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.category || ''}"`,
    `"${(t.priority || '').toUpperCase()}"`,
    `"${(t.status || '').toUpperCase()}"`,
    `"${(t.createdBy?.name || 'Unknown').replace(/"/g, '""')}"`,
    `"${(t.assignedTo?.name || 'Unassigned').replace(/"/g, '""')}"`,
    `"${(t.department?.name || 'General').replace(/"/g, '""')}"`,
    `"${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}"`,
    `"${t.slaDueDate ? new Date(t.slaDueDate).toLocaleDateString() : 'N/A'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // Mobile: write to cache and open the share sheet
  if (Platform.OS !== 'web') {
    try {
      const file = new File(Paths.cache, filename);
      await file.write(csvContent);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Tickets',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Export', `Report saved to ${file.uri}`);
      }
    } catch (err) {
      Alert.alert('Export Failed', err.message);
    }
    return;
  }

  // Trigger web download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
