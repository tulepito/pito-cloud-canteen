import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import css from './OrderDetailsTable.module.scss';

const TABLE_TAB_IDS = [
  'OrderDetailsTable.tab.chose',
  'OrderDetailsTable.tab.notChoose',
  'OrderDetailsTable.tab.notJoin',
];

const TABLE_HEAD_IDS = [
  'OrderDetailsTable.head.name',
  'OrderDetailsTable.head.email',
  'OrderDetailsTable.head.selectedFood',
  'OrderDetailsTable.head.price',
  'OrderDetailsTable.head.other',
];

type TActionCellContentProps = {
  onEdit: () => void;
  onDelete: () => void;
};

const ActionCellContent: React.FC<TActionCellContentProps> = ({
  onEdit,
  onDelete,
}) => {
  return (
    <div>
      <IconEdit className={css.icon} onClick={onEdit} />
      <IconDelete className={css.icon} onClick={onDelete} />
    </div>
  );
};

type TOrderDetailsTableProps = {};

const OrderDetailsTable: React.FC<TOrderDetailsTableProps> = () => {
  const intl = useIntl();
  const [currentTab, setCurrentTab] = useState(TABLE_TAB_IDS[0]);

  const handleClickEditOrderItem = () => () => {
    console.log('edit');
  };
  const handleClickDeleteOrderItem = () => () => {
    console.log('delete');
  };

  const totalChoices = intl.formatMessage({
    id: 'OrderDetailsTable.totalChoices',
  });

  const tableHeads = useMemo(
    () => TABLE_HEAD_IDS.map((id) => intl.formatMessage({ id })),
    [],
  );

  const tabItems = TABLE_TAB_IDS.map((tabId) => {
    const numberClasses = classNames(css.number, {
      [css.numberActive]: tabId === currentTab,
    });

    const isSelectedTab = tabId === TABLE_TAB_IDS[0];

    const label = (
      <div className={css.tabItemContainer}>
        <span>{intl.formatMessage({ id: tabId })}</span>
        <div className={numberClasses}>1</div>
      </div>
    );

    const children = isSelectedTab ? (
      <p className={css.noChoices}>
        {intl.formatMessage({ id: 'OrderDetailsTable.noChoices' })}
      </p>
    ) : (
      <table className={css.tableRoot}>
        <thead>
          {tableHeads.map((head: string, index: number) => (
            <th key={index}>{head}</th>
          ))}
        </thead>
        <tbody>
          <tr>
            <td>Uyen</td>
            <td>eeeeeeesdasdarqwesceeeeeeeeeeedddeeee@gmail.com</td>
            <td>Cơm gà</td>
            <td>50,000đ</td>
            <td>
              <ActionCellContent
                onEdit={handleClickEditOrderItem()}
                onDelete={handleClickDeleteOrderItem()}
              />
            </td>
          </tr>

          <tr>
            <td>{totalChoices}</td>
            <td>{1}</td>
          </tr>
        </tbody>
      </table>
    );

    return {
      id: tabId,
      label,
      children,
    };
  });

  const handleTabChange = ({ id }: TTabsItem) => {
    setCurrentTab(id as string);
  };

  return (
    <div className={css.root}>
      <div>
        <Tabs items={tabItems} onChange={handleTabChange} />
      </div>
    </div>
  );
};

export default OrderDetailsTable;
