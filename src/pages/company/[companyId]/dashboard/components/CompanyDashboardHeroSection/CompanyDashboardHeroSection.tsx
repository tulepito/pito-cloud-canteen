import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Image from 'next/image';

import {
  AFTERNOON_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { BookerNewOrderAction } from '@pages/company/booker/orders/new/BookerNewOrder.slice';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import { getDeliveryTimeFromMealType } from '@src/utils/dates';
import { EMenuMealType } from '@src/utils/enums';
import type { TCurrentUser } from '@src/utils/types';

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
    daySession: MORNING_SESSION,
  },
  {
    key: EMenuMealType.lunch,
    label: <FormattedMessage id="MenuMealType.label.lunch" />,
    path: `/company/booker/orders/new/?deliveryHour=${getDeliveryTimeFromMealType(
      EMenuMealType.lunch,
    )}`,
    image: miquangImage,
    daySession: AFTERNOON_SESSION,
  },
  {
    key: EMenuMealType.dinner,
    label: <FormattedMessage id="MenuMealType.label.dinner" />,
    path: `/company/booker/orders/new/?deliveryHour=${getDeliveryTimeFromMealType(
      EMenuMealType.dinner,
    )}`,
    image: xoixeoImage,
    daySession: EVENING_SESSION,
  },
];

const CompanyDashboardHeroSection = () => {
  const { isMobileLayout, isTabletLayout } = useViewport();

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(currentUserSelector);
  const { firstName } = CurrentUser(currentUser as TCurrentUser).getProfile();

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

  const handleMealClick = (daySession: string) => () => {
    dispatch(QuizActions.clearQuizData());
    dispatch(QuizActions.openQuizFlow());
    dispatch(BookerNewOrderAction.setCurrentStep(0));
    dispatch(
      QuizActions.updateQuiz({
        daySession,
      }),
    );
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
        </h1>
        <div id="homePageMealLinks" className={css.homePageMealLinks}>
          {HOMEPAGE_MEAL_LINKS.map((item) => (
            <div
              key={item.key}
              className={css.homePageLink}
              onClick={handleMealClick(item.daySession)}>
              <Image
                src={item.image}
                className={css.image}
                alt={item.key}
                fill
              />
              <p className={css.label}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardHeroSection;
