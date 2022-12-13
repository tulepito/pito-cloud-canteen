import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

import css from './Table.module.scss';

export type TColumn = {
  key: string | number;
  label: string;
  render: (e: any) => ReactNode;
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
          {rowDatas.map((row: TRowData) => (
            <tr className={tableBodyRowClassName} key={row.key}>
              {columns.map((col: TColumn) => (
                <td
                  className={tableBodyCellClassName}
                  data-label={col.label}
                  key={col.key}>
                  {col.render(row.data)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
