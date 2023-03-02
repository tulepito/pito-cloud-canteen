import { InlineTextButton } from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { TEditMenuPricingCalendarResources } from '../EditPartnerMenuWizard/utils';
import css from './FoodEventCard.module.scss';

const FoodEventCard = ({
  event,
}: {
  event: { resource: TEditMenuPricingCalendarResources; start: Date };
}) => {
  const { resource, start } = event;
  const { title, onRemovePickedFood, sideDishes = [] } = resource;
  return (
    <div className={css.root}>
      <div className={css.title}>
        {title}
        {sideDishes.length > 0 && (
          <div className={css.sideDishesContent}>
            <FormattedMessage
              id="FoodEventCard.sideDishesContent"
              values={{
                boldText: (
                  <span className={css.boldText}>
                    <FormattedMessage id="FoodEventCard.sideDishesLabel" />
                  </span>
                ),
              }}
            />
          </div>
        )}
      </div>
      <InlineTextButton
        type="button"
        onClick={() =>
          onRemovePickedFood && onRemovePickedFood(resource.id, start)
        }
        className={css.buttonClose}>
        <IconClose rootClassName={css.iconClose} />
      </InlineTextButton>
    </div>
  );
};

export default FoodEventCard;
