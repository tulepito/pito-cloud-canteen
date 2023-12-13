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
  bookerMemberEmails: any[];
  onDeleteMember: (email: string) => void;
};
const CompanyCollapsibleRows: React.FC<TCompanyCollapsibleRowsProps> = ({
  row,
  columns,
  columnsControl,
  onDeleteMember,
  bookerMemberEmails,
}) => {
  const showRowsController = useBoolean(false);
  const { email } = row.data;
  const handleDeleteMember = () => {
    onDeleteMember(email);
  };

  const showDeleteBtn =
    bookerMemberEmails.length > 0 && !bookerMemberEmails.includes(email);

  return (
    <>
      <tr className={css.bodyRow} key={row.key}>
        {columns.map((col: TColumn) => {
          return (
            <td
              className={classNames(css.bodyCell, css.bodyCellBorder)}
              data-label={col.label}
              key={col.key}>
              {col.render(row.data, false, showRowsController)}
            </td>
          );
        })}
      </tr>
      <RenderWhen condition={showRowsController.value}>
        {columnsControl.map((columnControl, index) => {
          const rowKey = `${row.key}_ControllerRow_${index}_${columnControl.key}`;

          return (
            <tr className={css.bodyRow} key={rowKey}>
              {columns.map((col: TColumn) => {
                return (
                  <td className={css.bodyCell} key={col.key}>
                    {columnControl.render(row.data, false, {
                      colKey: col.key,
                    })}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </RenderWhen>
      <RenderWhen condition={showDeleteBtn && showRowsController.value}>
        <tr className={css.bodyRowDeleteAction} key={`${row.key}_deleteAction`}>
          <td
            colSpan={columns.length}
            className={classNames(css.bodyCell, css.bodyDeleteCell)}
            key={columns[columns.length - 1].key}>
            <div className={classNames(css.columnContainer, css.iconDelete)}>
              <IconDelete onClick={handleDeleteMember} />
            </div>
          </td>
        </tr>
      </RenderWhen>
    </>
  );
};

export default CompanyCollapsibleRows;
