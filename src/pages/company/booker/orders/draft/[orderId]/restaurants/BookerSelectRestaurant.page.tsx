import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { companyPaths, enGeneralPaths } from '@src/paths';
import { Listing, User } from '@src/utils/data';
import { EBookerOrderDraftStates, EOrderDraftStates } from '@src/utils/enums';
import type { TUser } from '@src/utils/types';

import FilterLabelsSection from './components/FilterLabels/FilterLabelsSection';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import KeywordSearchSection from './components/KeywordSearchSection/KeywordSearchSection';
import Layout from './components/Layout/Layout';
import LayoutContent from './components/Layout/LayoutContent';
import LayoutMain from './components/Layout/LayoutMain';
import LayoutSidebar from './components/Layout/LayoutSidebar';
import LayoutTop from './components/Layout/LayoutTop';
import ResultList from './components/ResultList/ResultList';
import { useGetCompanyAccount } from './hooks/company';
import { useGetOrder } from './hooks/orderData';
import { useSearchRestaurants } from './hooks/restaurants';

import css from './BookerSelectRestaurant.module.scss';

const EnableToAccessPageOrderStates = [
  EOrderDraftStates.pendingApproval,
  EBookerOrderDraftStates.bookerDraft,
];

function BookerSelectRestaurant() {
  const router = useRouter();
  const { orderId, timestamp } = router.query;

  const { order } = useGetOrder({ orderId: orderId as string });
  const orderListing = Listing(order!);
  const { orderState } = orderListing.getMetadata();
  const { companyAccount } = useGetCompanyAccount();

  const companyGeoOrigin = useMemo(
    () => ({
      ...User(companyAccount as TUser).getPublicData()?.companyLocation?.origin,
    }),
    [companyAccount],
  );

  useEffect(() => {
    if (!isEmpty(orderState)) {
      if (orderState === EOrderDraftStates.draft) {
        router.push({
          pathname: enGeneralPaths.company.booker.orders.new[
            '[companyId]'
          ].index(String(companyAccount?.id?.uuid)),
        });
      } else if (!EnableToAccessPageOrderStates.includes(orderState)) {
        router.push({
          pathname: companyPaths.ManageOrderPicking,
          query: { orderId: orderId as string },
        });
      }
    }
  }, [companyAccount?.id?.uuid, orderId, orderState, router]);

  const {
    restaurants,
    searchInProgress,
    totalResultItems,
    combinedRestaurantInFoods,
  } = useSearchRestaurants();

  const groupRestaurantInFoods = combinedRestaurantInFoods.reduce(
    (acc, combinedRestaurantInFood) => {
      const { restaurantId } = combinedRestaurantInFood;
      if (acc.has(restaurantId)) {
        acc.get(restaurantId)?.push(combinedRestaurantInFood);
      } else {
        acc.set(restaurantId, [combinedRestaurantInFood]);
      }

      return acc;
    },
    new Map<string, typeof combinedRestaurantInFoods>(),
  );

  const handleGoBack = () => {
    router.push({
      pathname: companyPaths.EditDraftOrder,
      query: {
        orderId,
        subOrderDate: timestamp,
      },
    });
  };

  const intl = useIntl();

  return (
    <Layout
      className={classNames(
        css.container,
        '!pt-0 md:pt-[40px] !px-0 md:px-[24px]',
      )}>
      <LayoutTop className={classNames(css.topContainer, '!mt-0 md:mt-[40px]')}>
        <div
          className={classNames(css.goBackBtn, 'text-nowrap')}
          onClick={handleGoBack}>
          <IconArrow direction="left" />
          {intl.formatMessage({ id: 'quay-lai' })}
        </div>
        <div className={classNames(css.pageTilte)}>
          <IconArrow
            className={css.icon}
            direction="left"
            onClick={handleGoBack}
          />
          <div className={css.title}>
            {intl.formatMessage({ id: 'danh-sach-nha-hang' })}
          </div>
        </div>
      </LayoutTop>
      <LayoutMain>
        <LayoutSidebar>
          <FilterSidebar />
        </LayoutSidebar>
        <LayoutContent className={css.result}>
          <div className={css.resultHeaderWrapper}>
            <div className={css.searchAndSort}>
              <KeywordSearchSection />
            </div>
            <FilterLabelsSection totalResultItems={totalResultItems} />
          </div>
          <ResultList
            order={order}
            className={css.resultList}
            restaurants={restaurants}
            groupRestaurantInFoods={groupRestaurantInFoods}
            isLoading={searchInProgress}
            companyGeoOrigin={companyGeoOrigin}
          />
        </LayoutContent>
      </LayoutMain>
    </Layout>
  );
}

export default BookerSelectRestaurant;
