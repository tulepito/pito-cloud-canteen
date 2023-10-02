import { useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';

import Badge from '@components/Badge/Badge';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClock from '@components/Icons/IconClock/IconClock';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EListingStates } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

import { PartnerManageMenusThunks } from '../PartnerManageMenus.slice';

import css from './MenuCard.module.scss';

type TMenuCardProps = {
  menu: TListing;
};

const MenuCard: React.FC<TMenuCardProps> = ({ menu }) => {
  const dispatch = useAppDispatch();
  const toggleMenuActiveStatusInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.toggleMenuActiveStatusInProgress,
  );

  const menuGetter = Listing(menu);
  const menuId = menuGetter.getId();
  const { title: menuName } = menuGetter.getAttributes();
  const { startDate, endDate } = menuGetter.getPublicData();
  const { listingState = EListingStates.draft } = menuGetter.getMetadata();

  const isDraftMenu = listingState === EListingStates.draft;

  const today = new Date().getTime();
  const isInvalidTimeRangeMenu = endDate < today;
  const shouldShowActiveMenuToggle =
    !isInvalidTimeRangeMenu &&
    [EListingStates.published, EListingStates.closed].includes(listingState);

  const { form } = useForm({
    initialValues: {
      isActive: listingState === EListingStates.published,
    },
    onSubmit: () => {},
  });
  const isActiveField = useField(`isActive`, form);

  const isActiveValue = isActiveField.input.value;
  const formattedMenuValidTimeRange = `${formatTimestamp(
    startDate,
  )} - ${formatTimestamp(endDate)}`;

  useEffect(() => {
    if (typeof isActiveValue === 'boolean') {
      const newListingState = isActiveValue
        ? EListingStates.published
        : EListingStates.closed;

      if (newListingState !== listingState) {
        dispatch(
          PartnerManageMenusThunks.toggleMenuActiveStatus({
            id: menuId,
            newListingState,
          }),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveValue]);

  const handleDeleteMenus =
    ({ id, ids }: TObject) =>
    () => {
      dispatch(PartnerManageMenusThunks.deleteMenus({ id, ids }));
    };

  return (
    <div className={css.root}>
      <div className={css.titleContainer}>
        <div>{menuName}</div>
        <IconArrow className={css.arrowIcon} direction="right" />
      </div>
      <div className={css.infoContainer}>
        <div className={css.timeContainer}>
          <IconClock />

          <div>{formattedMenuValidTimeRange}</div>
        </div>
        <RenderWhen condition={isDraftMenu}>
          <Badge label="Nháp" />
          <RenderWhen.False>
            <RenderWhen condition={isInvalidTimeRangeMenu}>
              <Badge label="Menu đã hết hạn" />
            </RenderWhen>
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <div className={css.actionContainer}>
        <div className={css.iconContainer}>
          <IconEdit />
        </div>
        <div
          className={css.iconContainer}
          onClick={handleDeleteMenus({ id: menuId })}>
          <IconDelete />
        </div>
        <RenderWhen condition={shouldShowActiveMenuToggle}>
          <Toggle
            id={'MealDateForm.orderType'}
            status={isActiveValue ? 'on' : 'off'}
            disabled={toggleMenuActiveStatusInProgress}
            className={css.isActiveField}
            onClick={(value) => {
              isActiveField.input.onChange(value);
            }}
          />
        </RenderWhen>
      </div>
    </div>
  );
};

export default MenuCard;
