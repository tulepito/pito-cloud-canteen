import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Image from 'next/image';

import NamedLink from '@components/NamedLink/NamedLink';
import { useViewport } from '@hooks/useViewport';
import { getDeliveryTimeFromMealType } from '@src/utils/dates';
import { EMenuMealType } from '@src/utils/enums';

import breadImage from '../../assets/banhmi-min.png';
import miquangImage from '../../assets/miquang-min.png';
import xoixeoImage from '../../assets/xoixeo.png';

import css from './CompanyDashboardHeroSection.module.scss';

const HOMEPAGE_MEAL_LINKS = [
  {
    key: EMenuMealType.breakfast,
    label: <FormattedMessage id="MenuMealType.label.breakfast" />,
    path: `/company/booker/orders/new/?deliveryHour=${getDeliveryTimeFromMealType(
      EMenuMealType.breakfast,
    )}`,
    image: breadImage,
  },
  {
    key: EMenuMealType.lunch,
    label: <FormattedMessage id="MenuMealType.label.lunch" />,
    path: `/company/booker/orders/new/?deliveryHour=${getDeliveryTimeFromMealType(
      EMenuMealType.lunch,
    )}}`,
    image: miquangImage,
  },
  {
    key: EMenuMealType.dinner,
    label: <FormattedMessage id="MenuMealType.label.dinner" />,
    path: `/company/booker/orders/new/?deliveryHour=${getDeliveryTimeFromMealType(
      EMenuMealType.dinner,
    )}`,
    image: xoixeoImage,
  },
];

const CompanyDashboardHeroSection = () => {
  const { isMobileLayout, isTabletLayout } = useViewport();

  const isNotDesktop = isTabletLayout || isMobileLayout;

  useEffect(() => {
    const container = document.querySelector(
      '#homePageMealLinks',
    ) as HTMLElement;
    if (!container || !isNotDesktop) return;
    const middle = container.children[
      Math.floor((container.children.length - 1) / 2)
    ] as HTMLElement;
    container.scrollLeft =
      middle.offsetLeft + middle.offsetWidth / 2 - container.offsetWidth / 2;
  }, [isNotDesktop]);

  return (
    <div className={css.root}>
      <div className={css.content}>
        <h1 className={css.title}>
          <FormattedMessage id="CompanyDashboardHeroSection.heroTitle" />
        </h1>
        <div id="homePageMealLinks" className={css.homePageMealLinks}>
          {HOMEPAGE_MEAL_LINKS.map((item) => (
            <NamedLink
              key={item.key}
              className={css.homePageLink}
              path={item.path}>
              <Image
                src={item.image}
                className={css.image}
                alt={item.key}
                fill
              />
              <p className={css.label}>{item.label}</p>
            </NamedLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardHeroSection;
