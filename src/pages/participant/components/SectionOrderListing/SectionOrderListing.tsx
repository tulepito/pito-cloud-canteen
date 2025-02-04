import { FormattedMessage, useIntl } from 'react-intl';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import IconBanned from '@components/Icons/IconBanned/IconBanned';
import IconCheckmarkTabTitle from '@components/Icons/IconCheckmark/IconCheckmarkTabTitle';
import ListingCard from '@components/ListingCard/ListingCard';
import Tabs from '@components/Tabs/Tabs';
import Tooltip from '@components/Tooltip/Tooltip';
import { isOrderOverDeadline as isOverDeadline } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
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
    const nextDayIndex =
      Object.keys(plan).length - 1 === dayIndex ? dayIndex : dayIndex + 1;

    return subOrderDates[nextDayIndex];
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
      // eslint-disable-next-line no-unsafe-optional-chaining
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
          getNextSubOrderDay={getNextSubOrderDay}
          onSelectTab={onSelectTab}
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
              getNextSubOrderDay={getNextSubOrderDay}
              onSelectTab={onSelectTab}
            />
          }
          enableTabScroll
        />
      </div>
    </div>
  );
};

export default SectionOrderListing;
