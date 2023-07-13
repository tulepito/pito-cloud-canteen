import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { utils as XLSXUtils, writeFile } from 'xlsx';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconDownload from '@components/Icons/IconDownload/IconDownload';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { groupPickingOrderByFood } from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

import usePrepareDownloadData from '../hooks/usePrepareDownloadData';
// eslint-disable-next-line import/no-cycle
import { EPartnerSubOrderDetailPage } from '../PartnerSubOrderDetail.page';

import css from './SubOrderDetail.module.scss';

type TSubOrderDetailProps = {
  onChangeViewMode: (v: EPartnerSubOrderDetailPage) => () => void;
};

const SubOrderDetail: React.FC<TSubOrderDetailProps> = ({
  onChangeViewMode,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, date] = (subOrderId as string)?.split('_');

  const { plan, participants = [], anonymous = [] } = order;
  const planGetter = Listing(plan as TListing);
  const { orderDetail = {} } = planGetter.getMetadata();

  const [data] = groupPickingOrderByFood({
    orderDetail,
    date: date ? Number(date) : undefined,
    participants,
    anonymous,
  }) || [{}];
  const { foodDataList = [] } = data || {};
  const initialCollapseStates = Array.from({
    length: foodDataList?.length,
  }).fill(0);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapseStates);

  const handleClickGroupTitle = (idx: number) => () => {
    const changeValue = !isCollapsed[idx];

    const newState = isCollapsed.map((i, currIdx) => {
      if (currIdx !== idx) {
        return i;
      }

      return changeValue;
    });

    setIsCollapsed(newState);
  };

  const downloadData = usePrepareDownloadData(foodDataList);

  const handleDownload = () => {
    const ws = XLSXUtils.aoa_to_sheet(downloadData as any[][]);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Sheet1');
    writeFile(wb, `Chi tiết đặt món.xlsx`);
  };

  useEffect(() => {
    setIsCollapsed(
      Array.from({
        length: foodDataList?.length,
      }).fill(0),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(foodDataList)]);

  return (
    <RenderWhen condition={!fetchOrderInProgress}>
      <div className={css.root}>
        <Button
          variant="inline"
          className={css.goBackBtn}
          onClick={onChangeViewMode(EPartnerSubOrderDetailPage.summary)}>
          <IconArrow direction="left" className={css.arrowIcon} />
          {intl.formatMessage({ id: 'SubOrderDetail.goBackToSummary' })}
        </Button>

        <div className={css.actionContainer}>
          <div className={css.title}>
            {intl.formatMessage({ id: 'SubOrderDetail.title' })}
          </div>
          <Button
            variant="secondary"
            className={css.downloadBtn}
            onClick={handleDownload}>
            <IconDownload className={css.iconDownload} />
            {intl.formatMessage({ id: 'SubOrderDetail.downloadFile' })}
          </Button>
        </div>

        <div className={css.tableContainer}>
          <div className={css.tableHead}>
            <div>
              {intl.formatMessage({
                id: 'SubOrderDetail.tableHead.no',
              })}
            </div>
            <div>
              {intl.formatMessage({
                id: 'SubOrderDetail.tableHead.foodType',
              })}
            </div>
            <div>
              {intl.formatMessage({
                id: 'SubOrderDetail.tableHead.quantity',
              })}
            </div>
            <div>
              {intl.formatMessage({
                id: 'SubOrderDetail.tableHead.unitPrice',
              })}
            </div>
            <div>
              {intl.formatMessage({
                id: 'SubOrderDetail.tableHead.totalPrice',
              })}
            </div>
            <div></div>
          </div>

          <div className={css.tableBody}>
            {foodDataList?.map((foodData: TObject, foodIndex: number) => {
              const { foodPrice, foodName, frequency, notes } = foodData;

              const groupTitleClasses = classNames(css.groupTitle, {
                [css.collapsed]: isCollapsed[foodIndex],
              });
              const rowsClasses = classNames(css.rows, {
                [css.collapsed]: isCollapsed[foodIndex],
              });
              const iconClasses = classNames({
                [css.reversed]: isCollapsed[foodIndex],
              });

              return (
                <div className={css.tableRowGroup} key={foodIndex}>
                  <div className={groupTitleClasses}>
                    <div>{foodIndex + 1}</div>
                    <div>{foodName}</div>
                    <div>{frequency}</div>
                    <div>
                      {parseThousandNumber((foodPrice || 0) * frequency)}đ
                    </div>
                    <div>{parseThousandNumber(foodPrice || 0)}đ</div>
                    <div
                      className={css.actionCell}
                      onClick={handleClickGroupTitle(foodIndex)}>
                      <IconArrow className={iconClasses} />
                    </div>
                  </div>
                  <div className={rowsClasses}>
                    {notes.map(({ note, name }: TObject, noteIndex: number) => {
                      return (
                        <div className={css.row} key={noteIndex}>
                          <div>
                            {foodIndex + 1}.{noteIndex + 1}
                          </div>
                          <div>{name}</div>
                          <div title={note}>{note || '-'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </RenderWhen>
  );
};

export default SubOrderDetail;
