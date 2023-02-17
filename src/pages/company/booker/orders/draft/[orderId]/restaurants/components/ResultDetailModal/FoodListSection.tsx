import FoodCard from '@components/FoodCard/FoodCard';
import React from 'react';

import css from './ResultDetailModal.module.scss';

type TFoodsListSectionProps = {
  onClickFood?: () => void;
  onSelectFood?: (foodId: string) => void;
  selectedFoodIds?: string[];
};

const FoodListSection: React.FC<TFoodsListSectionProps> = ({
  onClickFood = () => null,
  onSelectFood = () => null,
  selectedFoodIds = [],
}) => {
  return (
    <section className={css.foodSection}>
      <div className={css.categories}>
        <div className={css.category}>
          <h3 className={css.categoryTitle}>Món ăn</h3>
          <div className={css.foodList}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
              <FoodCard
                key={`${item}`}
                food={item}
                isSelected={selectedFoodIds?.includes(`${item}`)}
                onSelect={onSelectFood}
                onClick={onClickFood}
                className={css.foodItem}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodListSection;
