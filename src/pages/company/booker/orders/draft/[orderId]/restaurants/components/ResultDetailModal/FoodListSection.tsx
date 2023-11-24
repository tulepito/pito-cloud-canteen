import React from 'react';
import { useIntl } from 'react-intl';

import FoodCard from '@components/FoodCard/FoodCard';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import { Listing } from '@src/utils/data';
import type { TListing } from '@utils/types';

import css from './ResultDetailModal.module.scss';

type TFoodsListSectionProps = {
  onClickFood?: (foodId: string) => void;
  onSelectFood?: (foodId: string) => void;
  onRemoveFood?: (foodId: string) => void;
  selectedFoodIds?: string[];
  foodList?: TListing[];
  hideSelection?: boolean;
  fetchFoodInProgress?: boolean;
  packagePerMember?: number;
};

const FoodListSection: React.FC<TFoodsListSectionProps> = ({
  onClickFood = () => null,
  onSelectFood = () => null,
  onRemoveFood = () => null,
  selectedFoodIds = [],
  foodList = [],
  hideSelection = false,
  fetchFoodInProgress = false,
  packagePerMember = 0,
}) => {
  const intl = useIntl();
  const groupedFoodList = foodList.reduce<{
    equalPriceFoodList: TListing[];
    notEqualPriceFoodList: TListing[];
  }>(
    (result: any, foodItem: TListing) => {
      const foodListing = Listing(foodItem);
      const { price } = foodListing.getAttributes();
      const { equalPriceFoodList, notEqualPriceFoodList } = result;

      if (price.amount !== packagePerMember) {
        notEqualPriceFoodList.push(foodItem);
      } else {
        equalPriceFoodList.push(foodItem);
      }

      return {
        equalPriceFoodList,
        notEqualPriceFoodList,
      };
    },
    {
      equalPriceFoodList: [],
      notEqualPriceFoodList: [],
    },
  );

  const sortesFoodList = groupedFoodList.equalPriceFoodList.sort((a, b) => {
    const aPrice = Listing(a).getAttributes().price.amount;
    const bPrice = Listing(b).getAttributes().price.amount;

    return aPrice - bPrice;
  });

  const sortesGreaterFoodList = groupedFoodList.notEqualPriceFoodList.sort(
    (a, b) => {
      const aPrice = Listing(a).getAttributes().price.amount;
      const bPrice = Listing(b).getAttributes().price.amount;

      return aPrice - bPrice;
    },
  );

  return (
    <section className={css.foodSection}>
      <div className={css.categories}>
        <div className={css.category}>
          <h3 className={css.categoryTitle}>
            {intl.formatMessage({
              id: 'SelectRestaurantPage.ScopeFoodTitle',
            })}
          </h3>
          {fetchFoodInProgress ? (
            <div className={css.loading}>
              <IconSpinner />
            </div>
          ) : (
            <div className={css.foodList}>
              {sortesFoodList.map((item) => (
                <FoodCard
                  key={`${item?.id.uuid}`}
                  food={item}
                  isSelected={selectedFoodIds?.includes(`${item?.id.uuid}`)}
                  onSelect={onSelectFood}
                  onRemove={onRemoveFood}
                  onClick={onClickFood}
                  className={css.foodItem}
                  hideSelection={hideSelection}
                />
              ))}
              {foodList.length === 0 && (
                <div className={css.emptyFoodList}>
                  {intl.formatMessage({
                    id: 'SelectRestaurantPage.EmptyFood',
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {sortesGreaterFoodList.length > 0 && (
        <div className={css.categories}>
          <div className={css.category}>
            <h3 className={css.categoryTitle}>
              {intl.formatMessage({
                id: 'SelectRestaurantPage.OutOfScopeFoodTitle',
              })}
            </h3>
            {fetchFoodInProgress ? (
              <div className={css.loading}>
                <IconSpinner />
              </div>
            ) : (
              <div className={css.foodList}>
                {sortesGreaterFoodList.map((item) => (
                  <FoodCard
                    key={`${item?.id.uuid}`}
                    food={item}
                    isSelected={selectedFoodIds?.includes(`${item?.id.uuid}`)}
                    onSelect={onSelectFood}
                    onRemove={onRemoveFood}
                    onClick={onClickFood}
                    className={css.foodItem}
                    hideSelection={hideSelection}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default FoodListSection;
