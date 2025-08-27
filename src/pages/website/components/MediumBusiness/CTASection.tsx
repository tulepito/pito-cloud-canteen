import React from 'react';
import { useIntl } from 'react-intl';

import CTABg from '../../assets/CTABg3.webp';
import CTABgMobile from '../../assets/CTABg3-2.webp';

import CTA from './CTA';

const CTASection = () => {
  const intl = useIntl();

  return (
    <CTA
      src={CTABg}
      srcMobile={CTABgMobile}
      textTop={intl.formatMessage({ id: 'your-teams-meals-2' })}
      textMiddleNode={intl.formatMessage({
        id: 'nang-tam-trai-nghiem-bua-trua-tai-van-phong',
      })}
      textBottom={intl.formatMessage({
        id: 'du-100-hay-500-nhan-vien-hay-de-pito-giup-ban-quan-ly-bua-trua-cho-cong-ty-cua-ban',
      })}
    />
  );
};

export default CTASection;
