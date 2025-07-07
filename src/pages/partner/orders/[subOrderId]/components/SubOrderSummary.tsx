import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import Collapsible from '@components/Collapsible/Collapsible';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconDocument from '@components/Icons/IconDocument/IconDocument';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

// eslint-disable-next-line import/no-cycle
import { EPartnerSubOrderDetailPageViewMode } from '../PartnerSubOrderDetail.page';

import css from './SubOrderSummary.module.scss';

type TSubOrderSummaryProps = {
  onChangeViewMode: (v: EPartnerSubOrderDetailPageViewMode) => () => void;
};

const SubOrderSummary: React.FC<TSubOrderSummaryProps> = ({
  onChangeViewMode,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, date] = (subOrderId as string)?.split('_');
  const { plan } = order;
  const orderGetter = Listing(order as TListing);
  const planGetter = Listing(plan as TListing);
  const { orderType = EOrderType.group } = orderGetter.getMetadata();
  const { orderDetail } = planGetter.getMetadata();
  const isGroupOrder = orderType === EOrderType.group;
  const allowToQRCode = !!planGetter.getMetadata().allowToQRCode;

  console.log({ allowToQRCode });

  const [data] = groupFoodOrderByDate({
    isGroupOrder,
    orderDetail,
    date: date ? Number(date) : undefined,
  }) || [{}];

  return (
    <RenderWhen condition={!fetchOrderInProgress}>
      <Collapsible
        className={css.root}
        label={intl.formatMessage({ id: 'SubOrderSummary.title' })}>
        <div className={css.tableContainer}>
          <div className={css.tableHead}>
            <div>
              {intl.formatMessage({
                id: 'SubOrderSummary.tableHead.no',
              })}
            </div>
            <div>
              {intl.formatMessage({
                id: 'SubOrderSummary.tableHead.type',
              })}
            </div>
            <div>
              {intl.formatMessage({
                id: 'SubOrderSummary.tableHead.quantity',
              })}
            </div>
            <div>
              {intl.formatMessage({
                id: 'SubOrderSummary.tableHead.unitPrice',
              })}
            </div>
            <div>
              {intl.formatMessage({
                id: 'SubOrderSummary.tableHead.totalPice',
              })}
            </div>
          </div>

          <div className={css.tableBody}>
            <div className={css.tableRow}>
              {data?.foodDataList?.map((foodData: TObject, index: number) => {
                const {
                  foodId = index,
                  foodPrice = 0,
                  foodName = '',
                  frequency = 1,
                  notes = [],
                } = foodData;

                const noteComponentMaybe = (
                  <div className={css.foodNoteContainer}>
                    {intl.formatMessage({
                      id: 'SubOrderSummary.hasNote',
                    })}
                  </div>
                );

                return (
                  <div className={css.row} key={foodId}>
                    <div>{index + 1}</div>
                    <div className={css.foodNameContainer}>
                      <div>{foodName}</div>
                      <RenderWhen condition={isGroupOrder && !isEmpty(notes)}>
                        <Tooltip
                          overlayClassName={css.toolTipOverlay}
                          placement="bottom"
                          trigger="hover"
                          tooltipContent={noteComponentMaybe}>
                          <div className={css.noteIconContainer}>
                            <IconDocument />
                          </div>
                        </Tooltip>
                      </RenderWhen>
                    </div>
                    <div>{frequency}</div>
                    <div>{parseThousandNumber(foodPrice || 0)}đ</div>
                    <div>
                      {parseThousandNumber((foodPrice || 0) * frequency)}đ
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <RenderWhen condition={isGroupOrder}>
          <Button
            variant="inline"
            className={css.viewOrderDetail}
            onClick={onChangeViewMode(
              EPartnerSubOrderDetailPageViewMode.detail,
            )}>
            {intl.formatMessage({ id: 'SubOrderSummary.viewDetail' })}
            <IconArrow direction="right" className={css.arrowIcon} />
          </Button>
        </RenderWhen>

        <RenderWhen condition={isGroupOrder && allowToQRCode}>
          <Button
            variant="inline"
            className={css.viewOrderDetail}
            onClick={onChangeViewMode(
              EPartnerSubOrderDetailPageViewMode.qrCode,
            )}>
            Tải QRCode & Mở trang scan
            <IconArrow direction="right" className={css.arrowIcon} />
          </Button>
        </RenderWhen>
      </Collapsible>

      <RenderWhen.False>
        <Skeleton className={css.loading} />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default SubOrderSummary;
