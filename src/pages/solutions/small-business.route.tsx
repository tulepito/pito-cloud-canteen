import React from 'react';
import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Layout from '@pages/website/pages/Layout';
import SmallBusiness from '@pages/website/pages/SmallBusiness';
import { websitePaths } from '@src/paths';

function Page() {
  const intl = useIntl();

  return (
    <MetaWrapper
      routeName="SmallBusinessRoute"
      title={intl.formatMessage({
        id: 'automated-lunch-ordering-save-time-for-your-admin-team',
      })}
      description={intl.formatMessage({
        id: 'no-more-zalo-excel-or-manual-coordination-pito-helps-businesses-plan-weekly-menus-lets-employees-pre-select-meals-ensures-on-time-delivery-and-provides-clear-cost-tracking',
      })}
      canonical={websitePaths.SmallBusiness}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <SmallBusiness />
      </Layout>
    </MetaWrapper>
  );
}

export default Page;
