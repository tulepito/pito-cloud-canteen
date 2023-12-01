import { useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { companyPaths } from '@src/paths';
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
        router.push({ pathname: companyPaths.CreateNewOrder });
      } else if (!EnableToAccessPageOrderStates.includes(orderState)) {
        router.push({
          pathname: companyPaths.ManageOrderPicking,
          query: { orderId: orderId as string },
        });
      }
    }
  }, [orderId, orderState, router]);
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

  return (
    <Layout className={css.container}>
      <LayoutTop className={css.topContainer}>
        <div className={css.goBackBtn} onClick={handleGoBack}>
          <IconArrow direction="left" />
          Quay lại
        </div>
        <div className={css.pageTilte}>
          <IconArrow
            className={css.icon}
            direction="left"
            onClick={handleGoBack}
          />
          <div className={css.title}>danh sách nhà hàng</div>
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
