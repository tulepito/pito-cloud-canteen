import React from 'react';
import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { generalPaths } from '@src/paths';

import Home from './pages/Home';
import Layout from './pages/Layout';

function Homepage() {
  const intl = useIntl();

  return (
    <MetaWrapper
      title={intl.formatMessage({
        id: 'automated-corporate-lunch-ordering-solution',
      })}
      description={intl.formatMessage({
        id: 'pcc-helps-companies-plan-lunch-choose-vendors-manage-and-deliver-on-time-without-setup-costs-and-save-time',
      })}
      routeName="HomeRoute"
      canonical={generalPaths.Home}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <Home />
      </Layout>
    </MetaWrapper>
  );
}

export default Homepage;
