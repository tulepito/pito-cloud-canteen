import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Layout from '@pages/website/pages/Layout';
import StartUp from '@pages/website/pages/StartUp';
import { websitePaths } from '@src/paths';

import 'lenis/dist/lenis.css';

const StartUpPage = () => {
  const intl = useIntl();

  return (
    <MetaWrapper
      routeName="StartUpRoute"
      title={intl.formatMessage({
        id: 'flexible-lunch-solution-for-startups-or-pito-cloud-canteen',
      })}
      description={intl.formatMessage({
        id: 'save-90-of-lunch-coordination-time-employees-choose-their-own-meals-delivered-on-time-pito-cloud-canteen-helps-startups-optimize-operations-and-boost-team-satisfaction',
      })}
      canonical={process.env.NEXT_PUBLIC_CANONICAL_URL + websitePaths.Startup}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <StartUp />
      </Layout>
    </MetaWrapper>
  );
};

export default StartUpPage;
