/* eslint-disable @typescript-eslint/no-shadow */
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconSort from '@components/Icons/IconSort/IconSort';
import Pagination from '@components/Pagination/Pagination';
import type { TDefaultProps, TPagination } from '@utils/types';
import classNames from 'classnames';
import type { FormApi } from 'final-form';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import React from 'react';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import css from './Table.module.scss';

export type TColumn = {
  key: string | number;
  label: string | ReactNode;
  render: (data: any, isChecked: boolean) => ReactNode;
  sortable?: boolean;
};

export type TRowData = {
  key: string | number;
  data: any;
};

type TTableProps = TDefaultProps & {
  columns: TColumn[];
  data: TRowData[];
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
  hasCheckbox?: boolean;
  form?: FormApi;
  values?: any;
  exposeValues?: (e: any) => void;
  handleSort?: (columnName: string | number) => void;
  sortValue?: { columnName: string | number; type: 'asc' | 'desc' };
  customCheckboxChange?: (e: any) => void;
  afterCheckboxChangeHandler?: (e: any, rowCheckboxValues: any) => void;
  extraRows?: ReactNode;
  tableWrapperClassName?: string;
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
    tableClassName,
    paginationPath,
    hasCheckbox,
    form,
    values,
    handleSort,
    sortValue,
    afterCheckboxChangeHandler,
    extraRows,
    tableWrapperClassName,
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

  const customOnChangeCheckAllCheckbox = (e: any) => {
    const { checked, value, name } = e.target;
    form?.change(name, !checked ? [] : [value]);
    const { rowCheckbox = [] } = values;
    const newValues = [...rowCheckbox];
    data.forEach((val) => {
      newValues.push(val.key);
    });
    form?.change('rowCheckbox', !checked ? [] : getUniqueString(newValues));
    if (afterCheckboxChangeHandler) {
      afterCheckboxChangeHandler(e, rowCheckbox);
    }
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
    if (afterCheckboxChangeHandler) {
      afterCheckboxChangeHandler(e, rowCheckbox);
    }
  };

  const sortData = (key: string | number) => () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    handleSort && handleSort(key);
  };

  return (
    <>
      <div className={classNames(css.tableWrapper, tableWrapperClassName)}>
        <table className={tableClasses}>
          <thead className={tableHeadClassName}>
            <tr className={classNames(tableHeadRowClassName, css.headRow)}>
              {hasCheckbox && (
                <td
                  className={classNames(tableHeadCellClassName, css.headCell)}>
                  <FieldCheckbox
                    labelClassName={css.checkboxLabel}
                    svgClassName={css.checkboxSvg}
                    customOnChange={customOnChangeCheckAllCheckbox}
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
                <td colSpan={columns.length} className={css.emptyCell}>
                  Loading...
                </td>
              </tr>
            </tbody>
          ) : data.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className={css.emptyCell}>
                  <FormattedMessage id="Table.noResults" />
                </td>
              </tr>
              {extraRows && <tr className={css.bodyRow}>{extraRows}</tr>}
            </tbody>
          ) : (
            <tbody className={tableBodyClassName}>
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
                        svgClassName={css.checkboxSvg}
                        name="rowCheckbox"
                        id={`rowCheckbox.${row.key}`}
                        value={row.key as any}
                        label=" "
                        customOnChange={rowCheckboxChange}
                      />
                    </td>
                  )}
                  {columns.map((col: TColumn) => {
                    const rowCheckbox = values?.rowCheckbox || [];
                    const isChecked = rowCheckbox.includes(row.key);
                    return (
                      <td
                        className={classNames(
                          tableBodyCellClassName,
                          css.bodyCell,
                          { [css.isParent]: row.data.isParent },
                        )}
                        data-label={col.label}
                        key={col.key}>
                        {col.render(row.data, isChecked)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {extraRows && <tr className={css.bodyRow}>{extraRows}</tr>}
            </tbody>
          )}
        </table>
      </div>
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
