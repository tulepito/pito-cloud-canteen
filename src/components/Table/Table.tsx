import Form from '@components/Form/Form';
import Pagination from '@components/Pagination/Pagination';
import type { TPagination } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import React from 'react';
import { Form as FinalForm } from 'react-final-form';

import css from './Table.module.scss';

export type TColumn = {
  key: string | number;
  label: string;
  render: (data: any, index?: number) => ReactNode;
  renderSearch?: () => ReactNode;
};

export type TRowData = {
  key: string | number;
  data: any;
};

type TTable = {
  columns: TColumn[];
  data: TRowData[];
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
  isLoading?: boolean;
  onSubmit?: (e: any) => void;
  initialValues?: any;
  showFilterFrom?: boolean;
};

const Table = (props: any) => {
  const {
    columns = [],
    data = [],
    tableHeadClassName,
    tableHeadRowClassName,
    tableHeadCellClassName,
    tableBodyClassName,
    tableBodyRowClassName,
    tableBodyCellClassName,
    paginationLinksClassName,
    pagination,
    isLoading,
    showFilterFrom,
    tableClassName,
    paginationPath,
  } = props;

  const tableClasses = classNames(css.table, tableClassName);

  const router = useRouter();

  const onPageChange = (page: number) => {
    router.push({
      pathname: paginationPath,
      query: {
        page,
      },
    });
  };

  return (
    <>
      <table className={tableClasses}>
        <thead className={tableHeadClassName}>
          <tr className={classNames(tableHeadRowClassName, css.headRow)}>
            {columns.map((col: TColumn) => (
              <td
                className={classNames(tableHeadCellClassName, css.headCell)}
                key={col.key}>
                {col.label}
              </td>
            ))}
          </tr>
        </thead>
        {isLoading ? (
          <tbody>
            <tr>
              <td>Loading...</td>
            </tr>
          </tbody>
        ) : (
          <tbody className={tableBodyClassName}>
            {showFilterFrom && (
              <>
                <tr className={css.formHeadRow}>
                  {columns.map(
                    (col: TColumn) =>
                      col.renderSearch && (
                        <td key={col.key} className={css.formHeadCell}>
                          {col.label}
                        </td>
                      ),
                  )}
                </tr>
                <tr className={css.formRow}>
                  {columns.map(
                    (col: TColumn) =>
                      col.renderSearch && (
                        <td key={col.key} className={css.formCell}>
                          {col.renderSearch()}
                        </td>
                      ),
                  )}
                </tr>
              </>
            )}

            {data.map((row: TRowData) => (
              <tr
                className={classNames(tableBodyRowClassName, css.bodyRow)}
                key={row.key}>
                {columns.map((col: TColumn) => (
                  <td
                    className={classNames(
                      tableBodyCellClassName,
                      css.bodyCell,
                      { [css.isParent]: row.data.isParent },
                    )}
                    data-label={col.label}
                    key={col.key}>
                    {col.render(row.data)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          className={paginationLinksClassName}
          total={pagination.totalItems}
          pageSize={pagination.perPage}
          current={pagination.page}
          onChange={onPageChange}
        />
      )}
    </>
  );
};

export const TableForm = (props: TTable) => {
  const { rootClassName, onSubmit, initialValues, ...rest } = props;
  const rootClasses = classNames(css.root, rootClassName);
  return (
    <FinalForm
      onSubmit={onSubmit || (() => {})}
      initialValues={initialValues}
      render={(fieldRenderProps) => {
        const { handleSubmit } = fieldRenderProps;
        return (
          <Form onSubmit={handleSubmit} className={rootClasses}>
            <Table {...rest} />
          </Form>
        );
      }}
    />
  );
};

export default Table;
