import FoodCard from '@components/FoodCard/FoodCard';
import React from 'react';

import css from './ResultDetailModal.module.scss';

const FoodListSection: React.FC = () => {
  return (
    <section className={css.foodSection}>
      <div className={css.categories}>
        <div className={css.category}>
          <h3 className={css.categoryTitle}>Món ăn</h3>
          <div className={css.foodList}>
            <FoodCard className={css.foodItem} />
            <FoodCard className={css.foodItem} />
            <FoodCard className={css.foodItem} />
            <FoodCard className={css.foodItem} />
            <FoodCard className={css.foodItem} />
            <FoodCard className={css.foodItem} />
            <FoodCard className={css.foodItem} />
            <FoodCard className={css.foodItem} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodListSection;
