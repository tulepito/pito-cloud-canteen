import { useState } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import Tracker from '@helpers/tracker';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { convertWeekDay, formatTimestamp, VNTimezone } from '@utils/dates';

import DeleteMealModal from './components/DeleteMealModal';

import css from './MealPlanCard.module.scss';

type TMealPlanCardHeaderProps = {
  event: Event;
  removeInprogress?: boolean;
  shouldHideRemoveIcon?: boolean;
  removeEventItem?: (resourceId: string) => void;
  onSearchRestaurant?: (date: Date) => void;
};

const MealPlanCardHeader: React.FC<TMealPlanCardHeaderProps> = ({
  event,
  removeInprogress,
  removeEventItem,
  onSearchRestaurant,
  shouldHideRemoveIcon = false,
}) => {
  const {
    isSelectedFood,
    daySession: session,
    id: resourceId,
    meal = {},
  } = event?.resource || {};
  const dishes = meal.dishes || [];
  const router = useRouter();
  const handleDelete = () => {
    removeEventItem?.(resourceId);
  };

  const menuListings = useAppSelector(
    (state) => state.Order.menuListings,
    shallowEqual,
  );
  const walkthroughStep = useAppSelector(
    (state) => state.BookerDraftOrderPage.walkthroughStep,
  );
  const intl = useIntl();

  const dateTime = DateTime.fromMillis(+resourceId).setZone(VNTimezone);
  const dayOfWeek = convertWeekDay(dateTime.weekday).key;

  const foundMenuListing: any = menuListings?.find(
    (menu) => menu.id.uuid === event.resource.restaurant.menuId,
  );
  const menuListing = Listing(foundMenuListing);
  const foodIdList = menuListing.getMetadata()[`${dayOfWeek}FoodIdList`];

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  const handleSearchRestaurant = () => {
    Tracker.track('booker:order:search-restaurants', {
      orderId: String(router?.query?.orderId),
      planId: String(event?.resource?.planId),
      timestamp: Number(event?.resource?.id),
    });
    onSearchRestaurant?.(event?.start!);
  };

  return (
    <div className={css.header}>
      <div className={css.planTitle}>
        <div className={css.titleContainer}>
          <RenderWhen condition={isSelectedFood}>
            <IconTickWithBackground className={css.tickIcon} />
          </RenderWhen>
          <FormattedMessage id={`DayColumn.Session.${session}`} />
        </div>
        <RenderWhen condition={!shouldHideRemoveIcon}>
          <Tooltip
            placement="top"
            overlayInnerStyle={{
              padding: '8px 12px',
              maxWidth: 250,
            }}
            tooltipContent={
              <div>
                <div className={css.stepTitle}>Xoá menu này</div>
                <div className={css.stepContent}>
                  Bấm để <b>xoá thực đơn đã chọn</b>. Bạn có thể thêm lại sau
                  đó.
                </div>
              </div>
            }>
            <div
              className={classNames(css.iconCloseWrapper, {
                [css.walkthrough]: walkthroughStep === 3,
              })}>
              <IconClose
                className={css.close}
                onClick={handleOpenDeleteModal}
                data-tour="step-4"
              />
            </div>
          </Tooltip>
        </RenderWhen>
      </div>
      <div className={css.headerActions}>
        <div className={css.dishes}>
          {`${dishes.length}${
            foodIdList?.length ? `/${foodIdList?.length}` : ''
          }`}{' '}
          {intl.formatMessage({ id: 'mon' })}
        </div>
        <div className={css.verticalDivider} />
        <Tooltip
          placement="top"
          overlayInnerStyle={{
            padding: '8px 12px',
            maxWidth: 250,
          }}
          tooltipContent={
            <div>
              <div className={css.stepTitle}>Tìm kiếm nhà hàng</div>
              <div className={css.stepContent}>
                Bấm để <b>xem nhà hàng khác </b>{' '}
              </div>
            </div>
          }>
          <div
            className={classNames(css.searchIconWrapper, {
              [css.walkthrough]: walkthroughStep === 2,
            })}>
            <IconMagnifier
              className={css.searchIcon}
              onClick={handleSearchRestaurant}
              data-tour="step-3"
            />
          </div>
        </Tooltip>
      </div>
      <DeleteMealModal
        id="DeleteMealModal"
        isOpen={isOpenDeleteModal}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
        removeInprogress={removeInprogress}
        deleteDate={formatTimestamp(event.start?.getTime(), 'dd MMMM')}
      />
    </div>
  );
};

export default MealPlanCardHeader;
