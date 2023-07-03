import { useIntl } from 'react-intl';

import { parseThousandNumber } from '@helpers/format';
import type { TObject } from '@src/utils/types';

const usePrepareDownloadData = (foodDataList: TObject[] = []) => {
  const intl = useIntl();

  const headRow = [
    intl.formatMessage({
      id: 'SubOrderDetail.tableHead.no',
    }),
    intl.formatMessage({
      id: 'SubOrderDetail.tableHead.foodType',
    }),
    intl.formatMessage({
      id: 'SubOrderDetail.tableHead.quantity',
    }),
    intl.formatMessage({
      id: 'SubOrderDetail.tableHead.unitPrice',
    }),
    intl.formatMessage({
      id: 'SubOrderDetail.tableHead.totalPrice',
    }),
  ];
  const data = [];
  data.push(headRow);

  foodDataList.forEach((item, foodIndex) => {
    const { foodPrice, foodName, frequency, notes } = item;
    const titleRow = [
      (foodIndex + 1).toString(),
      foodName,
      frequency.toString(),
      `${parseThousandNumber(foodPrice || 0)}đ`,
      `${parseThousandNumber(foodPrice || 0 * frequency)}đ`,
    ];

    data.push(titleRow);

    notes.forEach(({ note = '-', name }: TObject, noteIndex: number) => {
      data.push([`${foodIndex + 1}.${noteIndex}`, name, note]);
    });
    data.push([]);
  });

  return data;
};

export default usePrepareDownloadData;
