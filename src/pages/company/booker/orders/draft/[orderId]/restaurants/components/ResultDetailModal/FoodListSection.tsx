import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

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

    return bPrice - aPrice;
  });

  const sortesGreaterFoodList = groupedFoodList.notEqualPriceFoodList.sort(
    (a, b) => {
      const aPrice = Listing(a).getAttributes().price.amount;
      const bPrice = Listing(b).getAttributes().price.amount;

      return bPrice - aPrice;
    },
  );

  return (
    <section className={classNames(css.foodSection)}>
      <div className={css.categories}>
        <div className={css.category}>
          {fetchFoodInProgress ? (
            <div className={css.loading}>
              <IconSpinner />
            </div>
          ) : (
            <div className={classNames(css.foodList, '!gap-2')}>
              <h3
                className={classNames(
                  css.categoryTitle,
                  '!text-base font-semibold w-full !m-0',
                )}>
                Món ăn nằm trong mức giá đã chọn
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {sortesFoodList.map((item) => (
                  <FoodCard
                    food={item}
                    key={item?.id.uuid}
                    isSelected={selectedFoodIds?.includes(`${item?.id.uuid}`)}
                    onSelect={onSelectFood}
                    onRemove={onRemoveFood}
                    onClick={onClickFood}
                    className={classNames(
                      css.foodItem,
                      '!w-full !max-w-[unset]',
                    )}
                    hideSelection={hideSelection}
                  />
                ))}
              </div>

              {!foodList.length && (
                <div className={css.emptyFoodList}>
                  {intl.formatMessage({
                    id: 'SelectRestaurantPage.EmptyFood',
                  })}
                </div>
              )}

              {sortesGreaterFoodList.length > 0 && (
                <div className={classNames(css.categories, 'w-full')}>
                  <div className={css.category}>
                    <h3
                      className={classNames(
                        css.categoryTitle,
                        '!text-base font-semibold w-full !my-2 !mt-4',
                      )}>
                      Món ăn nằm ngoài mức giá đã chọn
                    </h3>

                    {fetchFoodInProgress ? (
                      <div className={css.loading}>
                        <IconSpinner />
                      </div>
                    ) : (
                      <div className={classNames(css.foodList, 'w-full')}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                          {sortesGreaterFoodList.map((item) => (
                            <FoodCard
                              key={`${item?.id.uuid}`}
                              food={item}
                              isSelected={selectedFoodIds?.includes(
                                `${item?.id.uuid}`,
                              )}
                              onSelect={onSelectFood}
                              onRemove={onRemoveFood}
                              onClick={onClickFood}
                              className={classNames(
                                css.foodItem,
                                '!w-full !max-w-[unset]',
                              )}
                              hideSelection={hideSelection}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FoodListSection;
