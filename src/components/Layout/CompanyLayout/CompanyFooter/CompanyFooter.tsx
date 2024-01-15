import React from 'react';
import Link from 'next/link';

import IconFacebook from '@components/Icons/IconFacebook/IconFacebook';
import IconInstagram from '@components/Icons/IconInstagram/IconInstagram';
import IconLinkedIn from '@components/Icons/IconLinkedIn/IconLinkedIn';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import config from '@src/configs';

import css from './CompanyFooter.module.scss';

const CompanyFooter = () => {
  return (
    <div className={css.root}>
      <div className={css.container}>
        <div className={css.logo}>
          <PitoLogo variant="secondary" />
        </div>
        <div className={css.socials}>
          <Link href={config.siteFacebookPage} target="_blank">
            <IconFacebook />
          </Link>
          <Link href={config.siteInstagramPage} target="_blank">
            <IconInstagram />
          </Link>
          <Link href={config.siteLinkedInPage} target="_blank">
            <IconLinkedIn />
          </Link>
        </div>
        <div className={css.sloganWrapper}>
          <p className={css.slogan}>Ⓒ 2024 PITO Cloud Canteen</p>
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
