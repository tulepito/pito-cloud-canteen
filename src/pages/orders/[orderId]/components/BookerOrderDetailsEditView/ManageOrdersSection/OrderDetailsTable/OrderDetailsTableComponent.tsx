import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import css from './OrderDetailsTable.module.scss';
import type { EOrderDetailsTableTab } from './OrderDetailsTable.utils';

type TOrderDetailsTableComponentProps = {
  tab: EOrderDetailsTableTab;
  tableHeads: string[];
  data: TObject[];
  hasTotalLine?: boolean;
  onClickEditOrderItem: (tab: EOrderDetailsTableTab, id: string) => () => void;
  onClickDeleteOrderItem: (id: string) => () => void;
};

export const OrderDetailsTableComponent: React.FC<
  TOrderDetailsTableComponentProps
> = ({
  tab,
  tableHeads,
  data,
  onClickEditOrderItem,
  onClickDeleteOrderItem,
  hasTotalLine = false,
}) => {
  const intl = useIntl();

  return (
    <table className={css.tableRoot}>
      <thead>
        <tr>
          {tableHeads.map((head: string, index: number) => (
            <th key={index} colSpan={index === 3 ? 2 : 1}>
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item: TObject) => {
          const {
            memberData,
            foodData: { foodName = '', foodPrice = 0 },
            status,
          } = item;
          const {
            id: memberId,
            name: memberName,
            email: memberEmail,
          } = memberData || {};
          const formattedFoodPrice = `${foodPrice}đ`;

          const rowClasses = classNames({
            [css.notAllowed]: status === EParticipantOrderStatus.notAllowed,
          });

          return (
            <tr key={memberId} className={rowClasses}>
              <td title={memberName}>
                <div>{memberName}</div>
                {/* <div>Người dùng</div> */}
                {/* <div>Ngoài nhóm</div> */}
              </td>
              <td title={memberEmail}>{memberEmail}</td>
              <td title={foodName}>{foodName}</td>
              <td title={formattedFoodPrice}>{formattedFoodPrice}</td>
              <td>
                <div>
                  <IconEdit
                    className={css.icon}
                    onClick={onClickEditOrderItem(tab, memberId)}
                  />
                  <IconDelete
                    className={css.icon}
                    onClick={onClickDeleteOrderItem(memberId)}
                  />
                </div>
              </td>
            </tr>
          );
        })}

        {hasTotalLine && (
          <tr className={css.totalRow}>
            <td>
              {intl.formatMessage({
                id: 'OrderDetailsTable.totalChoices',
              })}
            </td>
            <td>{data?.length}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
