import React from 'react';
import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Employee from '@pages/website/pages/Employee';
import Layout from '@pages/website/pages/Layout';
import { websitePaths } from '@src/paths';

function Page() {
  const intl = useIntl();

  return (
    <MetaWrapper
      routeName="EmployeesRoute"
      title={intl.formatMessage({
        id: 'propose-a-smart-lunch-solution-for-your-company',
      })}
      description={intl.formatMessage({
        id: 'smart-lunch-solution-choose-once-get-what-you-like-delivered-on-time-suggest-pito-cloud-canteen-to-improve-your-companys-lunch-experience',
      })}
      canonical={websitePaths.Employee}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <Employee />
      </Layout>
    </MetaWrapper>
  );
}

export default Page;
