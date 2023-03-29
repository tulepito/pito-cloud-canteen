import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { companyPaths } from '@src/paths';

import FilterLabelsSection from './components/FilterLabels/FilterLabelsSection';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import KeywordSearchSection from './components/KeywordSearchSection/KeywordSearchSection';
import Layout from './components/Layout/Layout';
import LayoutContent from './components/Layout/LayoutContent';
import LayoutMain from './components/Layout/LayoutMain';
import LayoutSidebar from './components/Layout/LayoutSidebar';
import LayoutTop from './components/Layout/LayoutTop';
import ResultList from './components/ResultList/ResultList';
import SortingSection from './components/SortingSection/SortingSection';
import { useGetCompanyAccount } from './hooks/company';
import { useGetOrder } from './hooks/orderData';
import { useSearchRestaurants } from './hooks/restaurants';

import css from './BookerSelectRestaurant.module.scss';

function BookerSelectRestaurant() {
  const router = useRouter();
  const { orderId } = router.query;

  const { order } = useGetOrder({ orderId: orderId as string });
  const { companyAccount } = useGetCompanyAccount();
  const { restaurants, searchInProgress, totalResultItems } =
    useSearchRestaurants();

  const handleGoBack = () => {
    router.push({
      pathname: companyPaths.EditDraftOrder,
      query: {
        orderId,
      },
    });
  };

  return (
    <Layout>
      <LayoutTop>
        <div className={css.goBackBtn} onClick={handleGoBack}>
          <IconArrow direction="left" />
          Quay lại
        </div>
        <div className={css.pageTilte}>danh sách nhà hàng</div>
      </LayoutTop>
      <LayoutMain>
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
            order={order}
            className={css.resultList}
            restaurants={restaurants}
            isLoading={searchInProgress}
            companyAccount={companyAccount}
          />
        </LayoutContent>
      </LayoutMain>
    </Layout>
  );
}

export default BookerSelectRestaurant;
