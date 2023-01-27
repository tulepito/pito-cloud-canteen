import type { TColumn } from '@components/Table/Table';

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

export const getTableDataForExport = (tableData: any[], columns: TColumn[]) => {
  return tableData?.map((data: any) =>
    columns.reduce(
      (recordToDownload, column) => ({
        ...recordToDownload,
        [column.key]: data[column.key],
      }),
      {},
    ),
  );
};

/**
 * @desc make csv from given data
 * @param rows
 * @param filename
 */
export const makeCsv = async (rows: any[], filename: string) => {
  const separator: string = ';';
  const keys: string[] = Object.keys(rows[0]);
  const csvContent = `${keys.join(separator)}\n${rows
    .map((row) =>
      keys
        .map((k) => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];

          cell =
            cell instanceof Date
              ? cell.toLocaleString()
              : cell.toString().replace(/"/g, '""');

          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(separator),
    )
    .join('\n')}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  if (
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator?.msSaveBlob
  ) {
    // In case of IE 10+
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
