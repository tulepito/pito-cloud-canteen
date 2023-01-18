/* eslint-disable @typescript-eslint/no-shadow */
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconSort from '@components/Icons/IconSort/IconSort';
import Pagination from '@components/Pagination/Pagination';
import type { TPagination } from '@utils/types';
import classNames from 'classnames';
import type { FormApi } from 'final-form';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import React from 'react';
import { Form as FinalForm, FormSpy } from 'react-final-form';

import css from './Table.module.scss';

export type TColumn = {
  key: string | number;
  label: string | ReactNode;
  render: (data: any, index?: number) => ReactNode;
  renderSearch?: () => ReactNode;
  sortable?: boolean;
};

export type TRowData = {
  key: string | number;
  data: any;
};

type TTableProps = {
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
  hasCheckbox?: boolean;
  form?: FormApi;
  values?: any;
  exposeValues?: (e: any) => void;
  handleSort?: (columnName: string | number) => void;
  sortValue?: { columnName: string | number; type: 'asc' | 'desc' };
};

const getUniqueString = (list: string[]) => {
  return list.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
};

const Table = (props: TTableProps) => {
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
    hasCheckbox,
    form,
    values,
    handleSort,
    sortValue,
  } = props;

  const tableClasses = classNames(css.table, tableClassName);

  const router = useRouter();

  const onPageChange = (page: number) => {
    router.push({
      pathname: paginationPath,
      query: {
        ...router.query,
        page,
      },
    });
  };

  const customOnChange = (e: any) => {
    const { checked, value, name } = e.target;
    form?.change(name, !checked ? [] : [value]);
    const { rowCheckbox = [] } = values;
    const newValues = [...rowCheckbox];
    data.forEach((val) => {
      newValues.push(val.key);
    });
    form?.change('rowCheckbox', !checked ? [] : getUniqueString(newValues));
  };

  const rowCheckboxChange = (e: any) => {
    const { checked, value, name } = e.target;
    const { rowCheckbox = [] } = values;
    const newValues = [...rowCheckbox];
    if (!checked) {
      const index = newValues.findIndex((val) => val === value);
      newValues.splice(index, 1);
      form?.change('checkAll', []);
    } else {
      newValues.push(value);
    }
    if (newValues.length === data.length) {
      form?.change('checkAll', ['checkAll']);
    }
    form?.change(name, newValues);
  };
  const sortData = (key: string | number) => () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    handleSort && handleSort(key);
  };

  return (
    <>
      <table className={tableClasses}>
        <thead className={tableHeadClassName}>
          <tr className={classNames(tableHeadRowClassName, css.headRow)}>
            {hasCheckbox && (
              <td className={classNames(tableHeadCellClassName, css.headCell)}>
                <FieldCheckbox
                  labelClassName={css.checkboxLabel}
                  svgClassName={css.checkboxSvg}
                  customOnChange={customOnChange}
                  name="checkAll"
                  id="checkAll"
                  value="checkAll"
                  label=" "
                />
              </td>
            )}
            {columns.map((col: TColumn) => (
              <td
                className={classNames(tableHeadCellClassName, css.headCell)}
                key={col.key}>
                <div className={css.headCellLabel}>
                  {col.label}
                  {col.sortable && (
                    <IconSort
                      onClick={sortData(col.key)}
                      className={css.sortIcon}
                      type={
                        col.key === sortValue?.columnName
                          ? sortValue?.type
                          : undefined
                      }
                    />
                  )}
                </div>
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
                {hasCheckbox && (
                  <td
                    className={classNames(
                      tableBodyCellClassName,
                      css.bodyCell,
                      {
                        [css.isParent]: row.data.isParent,
                      },
                    )}>
                    <FieldCheckbox
                      labelClassName={css.checkboxLabel}
                      name="rowCheckbox"
                      id={`rowCheckbox.${row.key}`}
                      value={row.key as any}
                      label=" "
                      customOnChange={rowCheckboxChange}
                    />
                  </td>
                )}
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

export const TableForm: React.FC<TTableProps> = (props) => {
  const { rootClassName, onSubmit, initialValues, exposeValues, ...rest } =
    props;
  const rootClasses = classNames(css.root, rootClassName);
  return (
    <FinalForm
      onSubmit={onSubmit || (() => {})}
      initialValues={initialValues}
      render={(fieldRenderProps) => {
        const { handleSubmit, form, values } = fieldRenderProps;
        return (
          <Form onSubmit={handleSubmit} className={rootClasses}>
            <FormSpy
              subscription={{ values: true, valid: true }}
              onChange={(state) => {
                const { values, valid } = state;
                if (exposeValues) {
                  exposeValues({ values, valid });
                }
              }}
            />
            <Table {...rest} form={form} values={values} />
          </Form>
        );
      }}
    />
  );
};

export default Table;
