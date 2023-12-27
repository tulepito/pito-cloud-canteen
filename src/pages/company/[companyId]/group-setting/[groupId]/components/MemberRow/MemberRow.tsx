import classNames from 'classnames';

import IconDelete from '@components/Icons/IconDelete/IconDelete';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TColumn, TRowData } from '@components/Table/Table';
import useBoolean from '@hooks/useBoolean';

import css from '../MemberTable/MemberTable.module.scss';

type TMemberRowsProps = {
  row: TRowData;
  columns: TColumn[];
  columnsControl: TColumn[];
  onDeleteMember: (id: string, email: string) => void;
};
const MemberRow: React.FC<TMemberRowsProps> = ({
  row,
  columns,
  columnsControl,
  onDeleteMember,
}) => {
  const showRowsController = useBoolean(false);
  const { id, email } = row.data;
  const handleDeleteMember = () => {
    onDeleteMember(id, email);
  };

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
      <RenderWhen condition={showRowsController.value}>
        <tr className={css.bodyRow} key={`${row.key}_deleteAction`}>
          <td
            colSpan={columns.length}
            className={css.bodyCell}
            key={columns[columns.length - 1].key}>
            <IconDelete
              className={css.iconDelete}
              onClick={handleDeleteMember}
            />
          </td>
        </tr>
      </RenderWhen>
    </>
  );
};

export default MemberRow;
