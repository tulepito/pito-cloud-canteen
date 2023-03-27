import React from 'react';

import IconFacebook from '@components/Icons/IconFacebook/IconFacebook';
import IconInstagram from '@components/Icons/IconInstagram/IconInstagram';
import IconLinkedIn from '@components/Icons/IconLinkedIn/IconLinkedIn';
import NamedLink from '@components/NamedLink/NamedLink';
import PitoLogo from '@components/PitoLogo/PitoLogo';

import css from './CompanyFooter.module.scss';

const CompanyFooter = () => {
  return (
    <div className={css.root}>
      <div className={css.container}>
        <div className={css.logo}>
          <PitoLogo variant="secondary" />
        </div>
        <div className={css.socials}>
          <NamedLink>
            <IconFacebook />
          </NamedLink>
          <NamedLink>
            <IconInstagram />
          </NamedLink>
          <NamedLink>
            <IconLinkedIn />
          </NamedLink>
        </div>
        <div className={css.sloganWrapper}>
          <p className={css.slogan}>Ⓒ 2023 PITO Cloud Canteen</p>
          <p className={css.slogan}>
            <span className={css.minus}>{' - '}</span> A New Way To Order Lunch
            At Work. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyFooter;
