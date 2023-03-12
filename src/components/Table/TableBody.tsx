import React from 'react';

import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';

import css from './Table.module.scss';

const formatCellValue = (value: any) => {
  if (Array.isArray(value)) {
    return value.length === 0 ? '-' : value.join(', ');
  }

  return value;
};

type TableBodyProps = {
  data: any[];
  editItem: (itemId: string) => () => void;
};
const TableBody: React.FC<TableBodyProps> = (props) => {
  const { data, editItem } = props;

  return (
    <tbody className={css.tableBody}>
      {data.map((item: any, index: number) => (
        <tr key={index}>
          <>
            {Object.keys(item).map(
              (itemKey) =>
                itemKey !== 'id' && (
                  <td key={`${itemKey}-${item.id}`}>
                    {formatCellValue(item[itemKey])}
                  </td>
                ),
            )}
            <td>
              <IconEdit className={css.editBtn} onClick={editItem(item.id)} />
              <IconDelete className={css.deleteBtn} />
            </td>
          </>
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
