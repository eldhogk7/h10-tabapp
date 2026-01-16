import RNFS from 'react-native-fs';
import Share from 'react-native-share';

/**
 * Export podholders as CSV
 * Columns: Serial Number, Model
 */
export const exportPodholdersCsv = async (podholders: any[]) => {
  try {
    if (!podholders || podholders.length === 0) {
      console.log('❌ No podholders to export');
      return;
    }

    // CSV HEADER
    const header = 'Serial Number,Model\n';

    // CSV ROWS
    const rows = podholders
      .map(h => {
        const serial = h.serial_number ?? '';
        const model = h.model ?? '';
        return `${serial},${model}`;
      })
      .join('\n');

    const csv = header + rows;

    // FILE NAME
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `podholders_${timestamp}.csv`;
    const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    // WRITE FILE
    await RNFS.writeFile(filePath, csv, 'utf8');
    console.log('✅ CSV saved at:', filePath);

    // SHARE / DOWNLOAD
    await Share.open({
      url: `file://${filePath}`,
      type: 'text/csv',
      filename: fileName,
      failOnCancel: false,
    });
  } catch (err: any) {
    if (err?.message?.includes('User did not share')) {
      console.log('ℹ User cancelled export');
      return;
    }
    console.error('❌ CSV Export failed:', err);
  }
};
