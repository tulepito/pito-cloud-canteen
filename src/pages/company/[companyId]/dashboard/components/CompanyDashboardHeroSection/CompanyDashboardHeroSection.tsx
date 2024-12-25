import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import Image from 'next/image';

import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { HOMEPAGE_MEAL_LINKS } from '@pages/company/helpers/companyMeals';
import { useCompanyMealSelect } from '@pages/company/hooks/useCompanyMealSelect';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import type { TCurrentUser } from '@src/utils/types';

import css from './CompanyDashboardHeroSection.module.scss';

const CompanyDashboardHeroSection = () => {
  const { isMobileLayout, isTabletLayout } = useViewport();

  const selectedCompany = useAppSelector((state) => state.Quiz.selectedCompany);
  const currentUser = useAppSelector(currentUserSelector);
  const { handleMealClick } = useCompanyMealSelect();

  const { firstName } = CurrentUser(currentUser as TCurrentUser).getProfile();

  const isNotDesktop = isTabletLayout || isMobileLayout;
  const isSelectedCompanyEmpty =
    selectedCompany === null || isEmpty(selectedCompany);

  const homePageLinkClasses = classNames(css.homePageLink, {
    [css.homePageLinkDisabled]: isSelectedCompanyEmpty,
  });

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

  const onMealClick = (daySession: string) => () => {
    if (isSelectedCompanyEmpty) {
      return;
    }
    handleMealClick(daySession);
  };

  return (
    <div className={css.root}>
      <div className={css.content}>
        <h1 className={css.title}>
          <FormattedMessage
            id="CompanyDashboardHeroSection.heroTitle"
            values={{
              bookerName: ` ${firstName}`,
            }}
          />
          <span className={css.whatMeal}>
            &nbsp;
            <FormattedMessage id="CompanyDashboardHeroSection.whatMeal" />
          </span>
          ?
        </h1>
        <div id="homePageMealLinks" className={css.homePageMealLinks}>
          {HOMEPAGE_MEAL_LINKS.map((item) => (
            <div
              key={item.key}
              className={homePageLinkClasses}
              onClick={onMealClick(item.daySession)}>
              <div className={css.imageWrapper}>
                <Image
                  src={item.imageSrc}
                  className={css.image}
                  alt={item.key}
                  fill
                />
              </div>
              <p className={css.label}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardHeroSection;
