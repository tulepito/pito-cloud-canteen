import classNames from 'classnames';

import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';

import type { TColumn, TRowData } from '../Table';

import css from '../Table.module.scss';

type TCollapsibleRowsProps = {
  row: TRowData;
  columns: TColumn[];
  values?: any;
  tableBodyRowClassName?: string;
  tableBodyCellClassName?: string;
  hasCheckbox?: boolean;
  rowCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
const CollapsibleRows: React.FC<TCollapsibleRowsProps> = (props) => {
  const {
    row,
    columns,
    values,
    tableBodyRowClassName,
    tableBodyCellClassName,
    hasCheckbox,
    rowCheckboxChange,
  } = props;
  const showRowsController = useBoolean(!!row.data.isHide);

  return (
    <>
      <RenderWhen condition={!row.data.isHide}>
        <tr className={classNames(tableBodyRowClassName, css.bodyRow)}>
          {hasCheckbox && (
            <>
              <td
                className={classNames(tableBodyCellClassName, css.bodyCell, {
                  [css.isParent]: row.data.isParent && showRowsController.value,
                })}>
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
            </>
          )}
          {columns.map((col: TColumn) => {
            const rowCheckbox = values?.rowCheckbox || [];
            const isChecked = rowCheckbox.includes(row.key);

            return (
              <td
                className={classNames(tableBodyCellClassName, css.bodyCell, {
                  [css.isParent]: row.data.isParent && showRowsController.value,
                })}
                data-label={col.label}
                key={col.key}>
                {col.render(row.data, isChecked, showRowsController)}
              </td>
            );
          })}
        </tr>
      </RenderWhen>
      <RenderWhen condition={row.data.isParent && showRowsController.value}>
        {row.data?.children.map((child: TRowData) => (
          <tr
            className={classNames(
              tableBodyRowClassName,
              css.bodyRow,
              css.bodyRowChild,
            )}
            key={`${row.key}-${child.key}`}>
            {columns.map((col: TColumn, index: number) => {
              const rowCheckbox = values?.rowCheckbox || [];
              const isChecked = rowCheckbox.includes(child.key);

              return (
                <td
                  className={classNames(
                    tableBodyCellClassName,
                    css.bodyCell,
                    css.bodyCellChild,
                  )}
                  data-label={col.label}
                  key={`${child.key}-${index}`}>
                  {col.render(child.data, isChecked)}
                </td>
              );
            })}
          </tr>
        ))}
      </RenderWhen>
    </>
  );
};

export default CollapsibleRows;
