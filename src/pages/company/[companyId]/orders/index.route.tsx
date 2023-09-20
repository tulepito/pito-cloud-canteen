import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import ManageCompanyOrdersPage from './ManageCompanyOrders.page';

const CompanyOrdersRoute = () => {
  return (
    <>
      <MetaWrapper routeName="CompanyOrdersRoute">
        <ManageCompanyOrdersPage />
      </MetaWrapper>
    </>
  );
};

export default CompanyOrdersRoute;
