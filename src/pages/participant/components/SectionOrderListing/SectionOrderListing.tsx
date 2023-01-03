import IconCheckmarkTabTitle from '@components/Icons/IconCheckmarkTabTitle';
import ListingCard from '@components/ListingCard/ListingCard';
import Tabs from '@components/Tabs/Tabs';
import { useAppSelector } from '@hooks/reduxHooks';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './SectionOrderListing.module.scss';

type TSectionOrderListingProps = {
  plan: any;
};

const SectionOrderListing: React.FC<TSectionOrderListingProps> = ({ plan }) => {
  const intl = useIntl();
  const router = useRouter();
  const { planId } = router.query;
  const cartList = useAppSelector((state) => {
    const currentUser = state.user.currentUser;
    const currUserId = currentUser?.id?.uuid;
    return state.shopingCart.orders?.[currUserId]?.[`${planId}` || 1];
  });
  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantSetupPlanPage.loadDataInProgress,
  );

  const ParticipantSetupPlanPage = useAppSelector(
    (state) => state.ParticipantSetupPlanPage,
  );

  console.log('loadDataInProgress', loadDataInProgress);
  console.log('ParticipantSetupPlanPage', ParticipantSetupPlanPage);

  const autoSelectionButtonLabel = intl.formatMessage({
    id: 'SectionOrderListing.autoSelectionButtonLabel',
  });
  const unCheckThisDateButtonLabel = intl.formatMessage({
    id: 'SectionOrderListing.unCheckThisDateButtonLabel',
  });

  const converDataToTabItem = (plan: any) => {
    // console.log('loadDataInProgress', loadDataInProgress);
    if (loadDataInProgress) {
      return [
        {
          label: 'Loading...',
          id: 'Loading...',
          children: <div>Loading...</div>,
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
      });
    }
    return convertedData;
  };

  const tabItems = converDataToTabItem(plan);

  return (
    <div className={css.root}>
      <div className={css.sectionOrderNotify}>
        <FormattedMessage id="SectionOrderListing.sectionOrderNotify" />
      </div>
      <div className={css.sectionMainOrder}>
        <Tabs
          items={tabItems}
          defaultActiveKey="1"
          contentClassName={css.sectionMainOrderListings}
          headerClassName={css.sectionMainOrderHeader}
        />
      </div>
    </div>
  );
};

export default SectionOrderListing;
