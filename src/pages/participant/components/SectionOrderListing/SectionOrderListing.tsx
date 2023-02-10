import IconBanned from '@components/Icons/IconBanned/IconBanned';
import IconCheckmarkTabTitle from '@components/Icons/IconCheckmark/IconCheckmarkTabTitle';
import ListingCard from '@components/ListingCard/ListingCard';
import Tabs from '@components/Tabs/Tabs';
import Tooltip from '@components/Tooltip/Tooltip';
import { isOverDeadline } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { FormattedMessage, useIntl } from 'react-intl';

import { listingLoading } from './Loading';
import css from './SectionOrderListing.module.scss';
import TabActions from './TabActions';

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
    return state.shopingCart.orders?.[currUserId]?.[`${planId}` || 1];
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

  const isOrderDeadlineOver = isOverDeadline(order);

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
      const hasDishInCart = cartList?.[item as any];
      const planDate = DateTime.fromMillis(Number(item)).toJSDate();
      const itemLabel = (
        <div className={css.tabTitle}>
          <span>
            {intl.formatMessage({
              id: `Calendar.week.dayHeader.${planDate.getDay()}`,
            })}
            , {planDate.getDate()}/{planDate.getMonth() + 1}
          </span>
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
        !!hasDishInCart ||
        reloadDataInProgress ||
        submitDataInprogress;

      const childrenList = foodList.map((dish, index) => (
        <ListingCard
          key={dish?.id?.uuid || index}
          className={css.listingCard}
          listing={dish}
          dayId={item}
          planId={`${planId}`}
          isSelected={hasDishInCart === dish?.id?.uuid}
          selectDisabled={selectDisabled}
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
          actionsComponent={
            <TabActions
              orderDay={orderDay}
              planId={`${planId}`}
              isOrderDeadlineOver={isOrderDeadlineOver}
            />
          }
        />
      </div>
    </div>
  );
};

export default SectionOrderListing;
