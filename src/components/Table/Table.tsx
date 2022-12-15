import PaginationLinks from '@components/PaginationLinks/PaginationLinks';
import type { TPagination } from '@utils/types';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

import css from './Table.module.scss';

export type TColumn = {
  key: string | number;
  label: string;
  render: (data: any, index: number) => ReactNode;
};

export type TRowData = {
  key: string | number;
  data: any;
};

type TTable = {
  columns: TColumn[];
  rowDatas: TRowData[];
  rootClassName?: string;
  tableClassName?: string;
  tableHeadClassName?: string;
  tableHeadRowClassName?: string;
  tableHeadCellClassName?: string;
  tableBodyClassName?: string;
  tableBodyRowClassName?: string;
  tableBodyCellClassName?: string;
  paginationLinksClassName?: string;
  paginationLinksRootClassName?: string;
  paginationPath?: string;
  pagePathParams?: any;
  pageSearchParams?: any;
  pagination?: TPagination | null;
};

const Table = (props: TTable) => {
  const {
    columns = [],
    rowDatas = [],
    rootClassName,
    tableClassName,
    tableHeadClassName,
    tableHeadRowClassName,
    tableHeadCellClassName,
    tableBodyClassName,
    tableBodyRowClassName,
    tableBodyCellClassName,
    paginationLinksClassName,
    paginationLinksRootClassName,
    paginationPath,
    pagePathParams,
    pageSearchParams,
    pagination,
  } = props;
  const rootClasses = classNames(css.root, rootClassName);
  const tableClasses = classNames(css.table, tableClassName);
  return (
    <div className={rootClasses}>
      <table className={tableClasses}>
        <thead className={tableHeadClassName}>
          <tr className={tableHeadRowClassName}>
            {columns.map((col: TColumn) => (
              <td className={tableHeadCellClassName} key={col.key}>
                {col.label}
              </td>
            ))}
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {rowDatas.map((row: TRowData, index: number) => (
            <tr className={tableBodyRowClassName} key={row.key}>
              {columns.map((col: TColumn) => (
                <td
                  className={tableBodyCellClassName}
                  data-label={col.label}
                  key={col.key}>
                  {col.render(row.data, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && pagination.totalPages > 1 && (
        <PaginationLinks
          className={paginationLinksClassName}
          rootClassName={paginationLinksRootClassName}
          path={paginationPath}
          pagePathParams={pagePathParams}
          pageSearchParams={pageSearchParams}
          pagination={pagination}
        />
      )}
    </div>
  );
};

export default Table;
