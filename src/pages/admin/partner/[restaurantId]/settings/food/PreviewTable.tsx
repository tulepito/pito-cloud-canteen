import type { ReactNode } from 'react';
import React from 'react';

export interface Column {
  label: string;
  accessor: string;
  render?: (value: any, data?: any, index?: number) => ReactNode;
  width?: number;
}

interface Row {
  [key: string]: any;
}

interface TemplatesTableProps {
  columns: Column[];
  data: Row[];
}

export const PreviewTable: React.FC<TemplatesTableProps> = ({
  columns,
  data,
}) => {
  return (
    <div className="overflow-x-auto p-0 my-2 max-h-[60vh]">
      <table className="min-w-full shadow-lg rounded-lg overflow-auto">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-100 border-b">
            {columns.map((column, index) => (
              <th
                key={index}
                style={{ minWidth: column.width }}
                className="px-6 py-3 text-left text-sm font-medium text-gray-600 text-nowrap">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-3 text-gray-800 font-medium">
                  {column.render
                    ? column.render(row[column.accessor], row, rowIndex)
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
