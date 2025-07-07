import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconDocument from '@components/Icons/IconDocument/IconDocument';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import css from './MobileSubOrderSummary.module.scss';

enum EPartnerSubOrderDetailPageViewMode {
  summary = 'summary',
  detail = 'detail',
  qrCode = 'qrCode',
}

type TMobileSubOrderSummaryProps = {
  onChangeViewMode: (v: EPartnerSubOrderDetailPageViewMode) => () => void;
};

const MobileSubOrderSummary: React.FC<TMobileSubOrderSummaryProps> = ({
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

  const [data] = groupFoodOrderByDate({
    isGroupOrder,
    orderDetail,
    date: date ? Number(date) : undefined,
  }) || [{}];

  const renderDishItem = (item: any, index: number) => {
    const { foodName, notes, frequency, foodPrice } = item;
    const noteComponentMaybe = (
      <div className={css.foodNoteContainer}>
        {intl.formatMessage({
          id: 'SubOrderSummary.hasNote',
        })}
      </div>
    );

    return (
      <div className={css.itemWrapper} key={index}>
        <div className={css.orderNumber}>{index + 1}</div>
        <div className={css.foodNameContainer}>
          <div>{foodName}</div>
          <RenderWhen condition={isGroupOrder && !isEmpty(notes)}>
            <Tooltip
              overlayClassName={css.toolTipOverlay}
              placement="bottom"
              trigger="click"
              tooltipContent={noteComponentMaybe}>
              <div className={css.noteIconContainer}>
                <IconDocument />
              </div>
            </Tooltip>
          </RenderWhen>
        </div>
        <div
          className={css.priceWrapper}>{`${frequency} x ${parseThousandNumber(
          foodPrice || 0,
        )}đ`}</div>
      </div>
    );
  };

  const handleChangeViewDetail = () => {
    onChangeViewMode(EPartnerSubOrderDetailPageViewMode.detail)();
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleChangeViewQRCode = () => {
    onChangeViewMode(EPartnerSubOrderDetailPageViewMode.qrCode)();
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={css.container}>
      <div className={css.title}>Chi tiết đơn hàng</div>
      <RenderWhen condition={!fetchOrderInProgress}>
        <div className={css.dishTable}>
          <div className={css.tableHeader}>
            <div className={css.orderNumber}>STT</div>
            <div className={css.foodNameContainer}>Hạng mục</div>
            <div className={css.price}></div>
          </div>
          <div className={css.tableBody}>
            {data?.foodDataList?.map((foodData: any, index: number) =>
              renderDishItem(foodData, index),
            )}
          </div>
        </div>
        <RenderWhen condition={isGroupOrder}>
          <Button
            variant="inline"
            className={css.viewOrderDetail}
            onClick={handleChangeViewDetail}>
            {intl.formatMessage({ id: 'SubOrderSummary.viewDetail' })}
            <IconArrow direction="right" className={css.arrowIcon} />
          </Button>
        </RenderWhen>
        <RenderWhen condition={isGroupOrder && allowToQRCode}>
          <Button
            variant="inline"
            className={css.viewOrderDetail}
            onClick={handleChangeViewQRCode}>
            Tải QRCode và Mở trang scan
            <IconArrow direction="right" className={css.arrowIcon} />
          </Button>
        </RenderWhen>
        <RenderWhen.False>
          <Skeleton className={css.loading} />
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default MobileSubOrderSummary;
