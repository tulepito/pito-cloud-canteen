import React from 'react';
import { useIntl } from 'react-intl';

import CTABg from '../../assets/startup/footer-pito-cloud-canteen.webp';
import CTABgMobile from '../../assets/startup/footer-pito-cloud-canteen-mobile.webp';

import CTA from './CTA';

const CTASection = () => {
  const intl = useIntl();

  return (
    <CTA
      src={CTABg}
      srcMobile={CTABgMobile}
      textTop={intl.formatMessage({
        id: 'get-started-today',
      })}
      textMiddleNode={intl.formatMessage({
        id: 'dont-let-lunch-slow-your-team-down',
      })}
    />
  );
};

export default CTASection;
