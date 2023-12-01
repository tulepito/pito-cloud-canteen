import classNames from 'classnames';

import IconDelete from '@components/Icons/IconDelete/IconDelete';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TColumn, TRowData } from '@components/Table/Table';
import useBoolean from '@hooks/useBoolean';

import css from '../CompanyMembersListMobile.module.scss';

type TCompanyCollapsibleRowsProps = {
  row: TRowData;
  columns: TColumn[];
  columnsControl: TColumn[];
};
const CompanyCollapsibleRows: React.FC<TCompanyCollapsibleRowsProps> = ({
  row,
  columns,
  columnsControl,
}) => {
  const showRowsController = useBoolean(false);

  return (
    <>
      <tr className={css.bodyRow} key={row.key}>
        {columns.map((col: TColumn) => {
          return (
            <td className={css.bodyCell} data-label={col.label} key={col.key}>
              {col.render(row.data, false, showRowsController)}
            </td>
          );
        })}
      </tr>
      <RenderWhen condition={showRowsController.value}>
        <>
          {columnsControl.map((columnControl) => {
            return (
              <tr
                className={css.bodyRowSpecial}
                key={`${row.key}_${columnControl.key}`}>
                <td className={css.bodyCell} key="name">
                  <span className={css.cellLabelValue}>
                    {columnControl.label}
                  </span>
                </td>
                <td className={css.bodyCell} key="email">
                  <span className={css.cellValue}>
                    {row.data[columnControl.key]}
                  </span>
                </td>
              </tr>
            );
          })}
          <tr
            className={css.bodyRowDeleteAction}
            key={`${row.key}_deleteAction`}>
            <td
              colSpan={columns.length}
              className={classNames(css.bodyCell, css.bodyDeleteCell)}
              key="email">
              <div className={classNames(css.columnContainer, css.iconDelete)}>
                <IconDelete />
              </div>
            </td>
          </tr>
        </>
      </RenderWhen>
    </>
  );
};

export default CompanyCollapsibleRows;
