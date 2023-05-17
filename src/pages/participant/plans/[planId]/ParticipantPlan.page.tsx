import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import type { Duration } from 'luxon';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconArrowFull from '@components/Icons/IconArrow/IconArrowFull';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { SystemAttributesThunks } from '@redux/slices/systemAttributes.slice';
import { UIActions } from '@redux/slices/UI.slice';
import type { RootState } from '@redux/store';
import { Listing } from '@utils/data';

import SectionCountdown from '../../components/SectionCountdown/SectionCountdown';
import SectionOrderListing from '../../components/SectionOrderListing/SectionOrderListing';
import SectionOrderPanel from '../../components/SectionOrderPanel/SectionOrderPanel';
import SectionRestaurantHero from '../../components/SectionRestaurantHero/SectionRestaurantHero';

import { useLoadData } from './hooks/loadData';
import { useSelectRestaurant } from './hooks/restaurant';

import css from './ParticipantPlan.module.scss';

const stopTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };

const ParticipantPlan = () => {
  const intl = useIntl();
  const infoSectionController = useBoolean();
  const dispatch = useAppDispatch();
  // Router
  const router = useRouter();
  const { planId } = router.query;

  // Load data
  const { loadDataInProgress, order, plan } = useLoadData();
  const { orderDayState, selectedRestaurant, handleSelectRestaurant } =
    useSelectRestaurant();

  const cartList = useAppSelector((state: RootState) => {
    const { currentUser } = state.user;
    const currUserId = currentUser?.id?.uuid;

    return state.shoppingCart.orders?.[currUserId]?.[(planId as string) || 1];
  });
  const orderId = order?.id?.uuid;
  const orderDays = Object.keys(plan);
  const cartListKeys = Object.keys(cartList || []).filter(
    (cartKey) => !!cartList[Number(cartKey)],
  );

  const { deadlineDate = Date.now() } = Listing(order).getMetadata();
  const [diffTime, setDiffTime] = useState<Duration | null>(null);
  const formattedTimeLeft =
    diffTime === null
      ? DateTime.fromMillis(deadlineDate)
          .diffNow()
          .toFormat("d'd':h'h':mm'm':ss's'")
      : (diffTime! as Duration).toFormat("d'd':h'h':mm'm':ss's'");

  const formattedDeadlineDate = DateTime.fromMillis(deadlineDate).toFormat(
    "HH:mm, dd 'tháng' MM, yyyy",
  );

  const timeLeftText = intl.formatMessage(
    {
      id: 'ParticipantPlan.summary.timeLeft',
    },
    {
      timeLeft: <span className={css.timeLeftTime}>{formattedTimeLeft}</span>,
    },
  );

  const infoSectionClasses = classNames(css.infoSection, {
    [css.visible]: infoSectionController.value,
  });

  const showMobileInfoSection = () => {
    infoSectionController.setTrue();
  };
  const hideMobileInfoSection = () => {
    infoSectionController.setFalse();
  };

  useEffect(() => {
    dispatch(SystemAttributesThunks.fetchAttributes());
  }, []);

  useEffect(() => {
    if (infoSectionController.value) {
      dispatch(UIActions.disableScrollRequest('Plan_InfoSection'));
    } else {
      dispatch(UIActions.disableScrollRemove('Plan_InfoSection'));
    }

    return () => {
      dispatch(UIActions.disableScrollRemove('Plan_InfoSection'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoSectionController.value]);

  useEffect(() => {
    if (isEmpty(order)) {
      return;
    }
    const intervalId = setInterval(() => {
      let diffObj = DateTime.fromMillis(
        parseInt(`${deadlineDate}`, 10),
      ).diffNow(['day', 'hour', 'minute', 'second']);
      if (stopTime !== null) {
        if (
          diffObj.get('days') <= stopTime.days &&
          diffObj.get('hours') <= stopTime.hours &&
          diffObj.get('minutes') <= stopTime.minutes &&
          diffObj.get('seconds') <= stopTime.seconds
        ) {
          diffObj = diffObj.set({
            ...stopTime,
          });
          clearInterval(intervalId);
        }
      }
      setDiffTime(diffObj);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [deadlineDate, JSON.stringify(order)]);

  const handleGoBack = () => {
    router.back();
  };

  // Render
  return (
    <ParticipantLayout>
      <div className={css.root}>
        <div className={css.leftSection}>
          <div className={css.goBack} onClick={handleGoBack}>
            <IconArrow direction="left" />
            <span>Quay lại</span>
          </div>
          <SectionRestaurantHero
            listing={selectedRestaurant}
            orderDay={Number(orderDayState)}
            inProgress={loadDataInProgress}
          />
          <SectionOrderListing
            plan={plan}
            onSelectTab={handleSelectRestaurant}
            orderDay={`${orderDayState}`}
          />
        </div>
        <div className={css.rightSection}>
          <SectionCountdown orderDeadline={deadlineDate} />
          <SectionOrderPanel planId={`${planId}`} orderId={orderId} />
        </div>
        <div className={css.summarySection}>
          <div>
            <div className={css.timeLeft}>{timeLeftText}</div>
            <div className={css.orderEndAt}>
              {intl.formatMessage(
                { id: 'ParticipantPlan.summary.orderEndAt' },
                {
                  deadline: (
                    <span className={css.orderEndAtTime}>
                      {formattedDeadlineDate}
                    </span>
                  ),
                },
              )}
            </div>
          </div>
          <Button
            className={css.viewCartMobile}
            onClick={showMobileInfoSection}>
            <div>
              {intl.formatMessage({ id: 'ParticipantPlan.summary.cart' })}
            </div>
            <div className={css.selections}>
              {intl.formatMessage(
                { id: 'ParticipantPlan.summary.selections' },
                {
                  selectedDays: cartListKeys.length,
                  totalDays: orderDays.length,
                },
              )}
            </div>
          </Button>
        </div>

        <div className={infoSectionClasses}>
          <Button
            variant="inline"
            className={css.goBackBtn}
            onClick={hideMobileInfoSection}>
            <IconArrowFull />
            <FormattedMessage id="ParticipantPlan.goBackText" />
          </Button>
          <SectionCountdown orderDeadline={deadlineDate} />
          <SectionOrderPanel planId={`${planId}`} orderId={orderId} />
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default ParticipantPlan;
