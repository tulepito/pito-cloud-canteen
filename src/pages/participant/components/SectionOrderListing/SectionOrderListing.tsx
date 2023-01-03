import IconCheckmarkTabTitle from '@components/Icons/IconCheckmarkTabTitle';
import ListingCard from '@components/ListingCard/ListingCard';
import Tabs from '@components/Tabs/Tabs';
import { useAppSelector } from '@hooks/reduxHooks';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { FormattedMessage, useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';

import css from './SectionOrderListing.module.scss';

type TSectionOrderListingProps = {
  plan: any;
  onSelectTab: (restaurant: any) => void;
};

const SectionOrderListing: React.FC<TSectionOrderListingProps> = ({
  plan,
  onSelectTab,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const { planId, orderDay } = router.query;
  const cartList = useAppSelector((state) => {
    const currentUser = state.user.currentUser;
    const currUserId = currentUser?.id?.uuid;
    return state.shopingCart.orders?.[currUserId]?.[`${planId}` || 1];
  });
  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantSetupPlanPage.loadDataInProgress,
  );

  const autoSelectionButtonLabel = intl.formatMessage({
    id: 'SectionOrderListing.autoSelectionButtonLabel',
  });
  const unCheckThisDateButtonLabel = intl.formatMessage({
    id: 'SectionOrderListing.unCheckThisDateButtonLabel',
  });

  const converDataToTabItem = (plan: any) => {
    if (loadDataInProgress) {
      return [
        {
          label: <Skeleton className={css.loadTitle} />,
          id: 'Loading...',
          children: [1, 2, 3].map((item) => (
            <Skeleton key={item} className={css.loading} />
          )),
        },
        {
          label: <Skeleton className={css.loadTitle} />,
          id: 'Loading...',
          children: [1, 2, 3].map((item) => (
            <Skeleton key={item} className={css.loading} />
          )),
        },
        {
          label: <Skeleton className={css.loadTitle} />,
          id: 'Loading...',
          children: [1, 2, 3].map((item) => (
            <Skeleton key={item} className={css.loading} />
          )),
        },
      ];
    }
    const convertedData = [];

    for (const item in plan) {
      const { foodList, restaurant }: { foodList: any[]; restaurant: any } =
        plan[item];
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
          {hasDishInCart && (
            <IconCheckmarkTabTitle className={css.tabTitleCheckmark} />
          )}
        </div>
      );

      const childrenList = foodList.map((dish, index) => (
        <ListingCard
          key={dish?.id?.uuid || index}
          className={css.listingCard}
          listing={dish}
          dayId={item}
          planId={`${planId}`}
          isSelected={hasDishInCart === dish?.id?.uuid}
          selectDisabled={!!hasDishInCart}
        />
      ));

      convertedData.push({
        label: itemLabel,
        id: item,
        children: <>{childrenList}</>,
        restaurant: restaurant,
      });
    }
    return convertedData;
  };

  const tabItems = converDataToTabItem(plan);
  const defaultActiveKey = tabItems.findIndex((item) => item.id === orderDay);
  console.log('defaultActiveKey', defaultActiveKey);
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
        />
      </div>
    </div>
  );
};

export default SectionOrderListing;
