import type { TColumn } from '@components/Table/Table';

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
