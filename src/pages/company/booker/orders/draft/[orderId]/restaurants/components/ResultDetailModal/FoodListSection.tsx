import React from 'react';

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
  const groupedFoodList = foodList.reduce<{
    equalPriceList: TListing[];
    lessPriceList: TListing[];
    greaterPriceList: TListing[];
  }>(
    (result: any, foodItem: TListing) => {
      const foodListing = Listing(foodItem);
      const { price } = foodListing.getAttributes();
      const { equalPriceList, lessPriceList, greaterPriceList } = result;

      if (price.amount === packagePerMember) {
        equalPriceList.push(foodItem);
      } else if (price.amount < packagePerMember) {
        lessPriceList.push(foodItem);
      } else {
        greaterPriceList.push(foodItem);
      }

      return {
        equalPriceList,
        lessPriceList,
        greaterPriceList,
      };
    },
    {
      equalPriceList: [],
      lessPriceList: [],
      greaterPriceList: [],
    },
  );

  const sortesFoodList = [
    ...groupedFoodList.equalPriceList,
    ...groupedFoodList.lessPriceList.sort((a, b) => {
      const aPrice = Listing(a).getAttributes().price.amount;
      const bPrice = Listing(b).getAttributes().price.amount;

      return aPrice - bPrice;
    }),
    ...groupedFoodList.greaterPriceList.sort((a, b) => {
      const aPrice = Listing(a).getAttributes().price.amount;
      const bPrice = Listing(b).getAttributes().price.amount;

      return aPrice - bPrice;
    }),
  ];

  return (
    <section className={css.foodSection}>
      <div className={css.categories}>
        <div className={css.category}>
          <h3 className={css.categoryTitle}>Món ăn</h3>
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
                <div className={css.emptyFoodList}>Không có món ăn nào</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FoodListSection;
