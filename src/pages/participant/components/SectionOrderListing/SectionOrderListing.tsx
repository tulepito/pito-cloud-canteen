import { useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import IconBanned from '@components/Icons/IconBanned/IconBanned';
import IconCheckmarkTabTitle from '@components/Icons/IconCheckmark/IconCheckmarkTabTitle';
import ListingCard from '@components/ListingCard/ListingCard';
import Tabs from '@components/Tabs/Tabs';
import Tooltip from '@components/Tooltip/Tooltip';
import { isOrderOverDeadline as isOverDeadline } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderStates } from '@src/utils/enums';

import { listingLoading } from './Loading';
import TabActions from './TabActions';

import css from './SectionOrderListing.module.scss';

type TSectionOrderListingProps = {
  plan: any;
  onSelectTab: (restaurant: any) => void;
  orderDay: string;
};

const SectionOrderListing: React.FC<TSectionOrderListingProps> = ({
  plan,
  onSelectTab,
  orderDay,
}) => {
  const intl = useIntl();

  const router = useRouter();
  const { planId } = router.query;

  const cartList = useAppSelector((state) => {
    const { currentUser } = state.user;
    const currUserId = currentUser?.id?.uuid;

    return state.shoppingCart.orders?.[currUserId]?.[`${planId}` || 1];
  });
  const order = useAppSelector((state) => state.ParticipantPlanPage.order);

  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantPlanPage.loadDataInProgress,
  );
  const reloadDataInProgress = useAppSelector(
    (state) => state.ParticipantPlanPage.reloadDataInProgress,
  );
  const submitDataInprogress = useAppSelector(
    (state) => state.ParticipantPlanPage.submitDataInprogress,
  );
  const orderListing = Listing(order);
  const { orderState } = orderListing.getMetadata();
  const isOrderDeadlineOver = isOverDeadline(order);
  const isOrderAlreadyStarted = orderState !== EOrderStates.picking;

  const getNextSubOrderDay = (dayId: string) => {
    const subOrderDates = Object.keys(plan);

    const dayIndex = subOrderDates.findIndex((item) => item === dayId);
    const firstDayIndexNotHaveDish = subOrderDates.findIndex(
      (item) => !cartList?.[+item]?.foodId,
    );
    const nextDayIndex =
      subOrderDates.length - 1 === dayIndex
        ? firstDayIndexNotHaveDish !== -1
          ? firstDayIndexNotHaveDish
          : dayIndex
        : dayIndex + 1;

    return (
      subOrderDates[nextDayIndex] || subOrderDates[firstDayIndexNotHaveDish]
    );
  };

  const scrollTimeoutRef = useRef<any | null>(null);
  const { isMobileLayout } = useViewport();

  const onAddedToCart = ({
    foodName,
    timestamp,
  }: {
    foodName?: string;
    timestamp: string;
  }) => {
    toast.success(
      foodName
        ? `Đã thêm món ${foodName} cho ngày ${formatTimestamp(+timestamp)}`
        : `Không chọn món cho ngày ${formatTimestamp(+timestamp)}`,
      {
        position: isMobileLayout ? 'top-center' : 'bottom-center',
        toastId: 'add-to-cart',
        updateId: 'add-to-cart',
        pauseOnHover: false,
        autoClose: 3000,
      },
    );

    scrollTimeoutRef.current = setTimeout(() => {
      const nextDate = getNextSubOrderDay(timestamp);
      onSelectTab({ id: nextDate });
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 1000);
  };

  const convertDataToTabItem = () => {
    if (loadDataInProgress) {
      return listingLoading();
    }
    const convertedData: any = [];
    Object.keys(plan).forEach((item) => {
      const {
        foodList,
        restaurant,
      }: { foodList: any[]; restaurant: any; memberOrder: any } = plan[item];
      const { foodId: hasDishInCart } = cartList?.[item as any] || {};
      const planDate = DateTime.fromMillis(Number(item)).toJSDate();
      const itemLabel = (
        <div className={css.tabTitle}>
          <div>
            {intl.formatMessage({
              id: `Calendar.week.dayHeader.${planDate.getDay()}`,
            })}
            , {planDate.getDate()}/{planDate.getMonth() + 1}
          </div>
          {hasDishInCart &&
            (hasDishInCart === 'notJoined' ? (
              <Tooltip tooltipContent={'meow'}>
                <IconBanned className={css.tabTitleIcon} />
              </Tooltip>
            ) : (
              <Tooltip tooltipContent={'meow'}>
                <IconCheckmarkTabTitle className={css.tabTitleIcon} />
              </Tooltip>
            ))}
          {}
        </div>
      );

      const selectDisabled =
        isOrderDeadlineOver ||
        reloadDataInProgress ||
        submitDataInprogress ||
        isOrderAlreadyStarted;

      const childrenList = foodList.map((dish, index) => (
        <ListingCard
          key={dish?.id?.uuid || index}
          className={css.listingCard}
          listing={dish}
          dayId={item}
          planId={`${planId}`}
          isSelected={hasDishInCart === dish?.id?.uuid}
          selectDisabled={selectDisabled}
          isOrderAlreadyStarted={isOrderAlreadyStarted}
          onAddedToCart={onAddedToCart}
        />
      ));

      convertedData.push({
        label: itemLabel,
        id: item,
        children: <>{childrenList}</>,
        restaurant,
      });
    });

    return convertedData;
  };

  const tabItems = convertDataToTabItem();
  const defaultActiveKey = tabItems.findIndex(
    (item: any) => item.id === orderDay,
  );

  return (
    <div className={css.root}>
      <div className={css.sectionOrderNotify}>
        <FormattedMessage id="SectionOrderListing.sectionOrderNotify" />
      </div>
      <div className={css.sectionMainOrder}>
        <Tabs
          items={tabItems}
          defaultActiveKey={`${
            (defaultActiveKey < 0 ? 0 : defaultActiveKey) + 1
          }`}
          contentClassName={css.sectionMainOrderListings}
          headerClassName={css.sectionMainOrderHeader}
          onChange={onSelectTab}
          showNavigation
          middleLabel
          navigationStartClassName={css.leftNavigation}
          navigationEndClassName={css.rightNavigation}
          actionsComponent={
            <TabActions
              orderId={order?.id?.uuid}
              orderDay={orderDay}
              planId={`${planId}`}
              isOrderDeadlineOver={isOrderDeadlineOver}
              onAddedToCart={onAddedToCart}
            />
          }
          enableTabScroll
        />
      </div>
    </div>
  );
};

export default SectionOrderListing;
