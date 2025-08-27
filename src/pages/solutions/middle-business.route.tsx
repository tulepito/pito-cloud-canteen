import React from 'react';
import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Layout from '@pages/website/pages/Layout';
import MediumBusiness from '@pages/website/pages/MediumBusiness';
import { websitePaths } from '@src/paths';

function Page() {
  const intl = useIntl();

  return (
    <MetaWrapper
      routeName="MiddleBusinessRoute"
      title={intl.formatMessage({
        id: 'lunch-ordering-solution-for-companies-no-canteen-needed',
      })}
      description={intl.formatMessage({
        id: 'pito-helps-businesses-optimize-team-lunches-employees-choose-meals-online-receive-unified-delivery-and-access-transparent-cost-reporting-weekly-menu-planning-is-fully-automated-no-more-zalo-or-excel',
      })}
      canonical={websitePaths.MiddleBusiness}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <MediumBusiness />
      </Layout>
    </MetaWrapper>
  );
}

export default Page;
