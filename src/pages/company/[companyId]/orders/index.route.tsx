import { useIntl } from 'react-intl';

import Meta from '@components/Layout/Meta';

import ManageCompanyOrdersPage from './ManageCompanyOrders.page';

const CompanyOrdersRoute = () => {
  const intl = useIntl();

  return (
    <>
      <Meta title={intl.formatMessage({ id: 'CompanyOrdersRoute.title' })} />
      <ManageCompanyOrdersPage />
    </>
  );
};

export default CompanyOrdersRoute;
