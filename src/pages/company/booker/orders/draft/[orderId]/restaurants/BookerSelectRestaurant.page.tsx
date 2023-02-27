import { useRouter } from 'next/router';

import css from './BookerSelectRestaurant.module.scss';
import FilterLabelsSection from './components/FilterLabels/FilterLabelsSection';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import KeywordSearchSection from './components/KeywordSearchSection/KeywordSearchSection';
import Layout from './components/Layout/Layout';
import LayoutContent from './components/Layout/LayoutContent';
import LayoutSidebar from './components/Layout/LayoutSidebar';
import ResultList from './components/ResultList/ResultList';
import SortingSection from './components/SortingSection/SortingSection';
import { useGetCompanyAccount } from './hooks/company';
import { useGetOrder } from './hooks/orderData';
import { useSearchRestaurants } from './hooks/restaurants';

function BookerSelectRestaurant() {
  const router = useRouter();
  const { orderId } = router.query;

  useGetOrder({ orderId: orderId as string });
  const { companyAccount } = useGetCompanyAccount();
  const { restaurants, searchInProgress, totalResultItems, totalRatings } =
    useSearchRestaurants();

  return (
    <Layout>
      <LayoutSidebar>
        <FilterSidebar />
      </LayoutSidebar>
      <LayoutContent className={css.result}>
        <div className={css.resultHeaderWrapper}>
          <div className={css.searchAndSort}>
            <KeywordSearchSection />
            <SortingSection />
          </div>
          <FilterLabelsSection totalResultItems={totalResultItems} />
        </div>
        <ResultList
          className={css.resultList}
          restaurants={restaurants}
          isLoading={searchInProgress}
          totalRatings={totalRatings}
          companyAccount={companyAccount}
        />
      </LayoutContent>
    </Layout>
  );
}

export default BookerSelectRestaurant;
