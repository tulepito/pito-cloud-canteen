import React from 'react';
import { useIntl } from 'react-intl';

import CTABg from '../../assets/startup/footer-pito-cloud-canteen.webp';
import CTABgMobile from '../../assets/startup/footer-pito-cloud-canteen-mobile.webp';
import CTA from '../MediumBusiness/CTA';

const CTASection = () => {
  const intl = useIntl();

  return (
    <CTA
      src={CTABg}
      srcMobile={CTABgMobile}
      textTop={intl.formatMessage({ id: 'your-teams-meals-1' })}
      textMiddleNode={intl.formatMessage({
        id: 'ready-to-upgrade-your-office-lunch-experience',
      })}
      textBottom={intl.formatMessage({
        id: 'let-pito-help-you-manage-lunch-for-100-300-employees-without-the-need-for-an-in-house-kitchen-or-manual-coordination',
      })}
    />
  );
};

export default CTASection;
