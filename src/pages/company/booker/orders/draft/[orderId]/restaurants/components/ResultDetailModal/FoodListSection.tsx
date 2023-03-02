import FoodCard from '@components/FoodCard/FoodCard';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import type { TListing } from '@utils/types';
import React from 'react';

import css from './ResultDetailModal.module.scss';

type TFoodsListSectionProps = {
  onClickFood?: (foodId: string) => void;
  onSelectFood?: (foodId: string) => void;
  onRemoveFood?: (foodId: string) => void;
  selectedFoodIds?: string[];
  foodList?: TListing[];
  hideSelection?: boolean;
  fetchFoodInProgress?: boolean;
};

const FoodListSection: React.FC<TFoodsListSectionProps> = ({
  onClickFood = () => null,
  onSelectFood = () => null,
  onRemoveFood = () => null,
  selectedFoodIds = [],
  foodList = [],
  hideSelection = false,
  fetchFoodInProgress = false,
}) => {
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
              {foodList.map((item) => (
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
