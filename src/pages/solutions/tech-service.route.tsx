import React from 'react';
import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Layout from '@pages/website/pages/Layout';
import TechService from '@pages/website/pages/TechService';
import { websitePaths } from '@src/paths';

function Page() {
  const intl = useIntl();

  return (
    <MetaWrapper
      routeName="SmallBusinessRoute"
      title={intl.formatMessage({
        id: 'automated-lunch-solution-or-pito-cloud-canteen',
      })}
      description={intl.formatMessage({
        id: 'plan-weekly-meals-let-employees-choose-dishes-ensure-on-time-delivery-and-track-transparent-costs-all-on-one-platform',
      })}
      canonical={
        process.env.NEXT_PUBLIC_CANONICAL_URL + websitePaths.TechService
      }
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <TechService />
      </Layout>
    </MetaWrapper>
  );
}

export default Page;
