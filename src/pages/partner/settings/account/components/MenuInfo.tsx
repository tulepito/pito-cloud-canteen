import isEmpty from 'lodash/isEmpty';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { getLabelByKey, MEAL_OPTIONS } from '@src/utils/options';

import css from './MenuInfo.module.scss';

type TMenuInfoProps = {
  meals: string[];
  categories: string[];
};

const MenuInfo: React.FC<TMenuInfoProps> = ({ meals, categories }) => {
  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );

  return (
    <div className={css.root}>
      <div className={css.section}>
        <div className={css.label}>Thực đơn bạn muốn phục vụ</div>
        <RenderWhen condition={isEmpty(meals)}>
          <div>Bạn chưa có lựa chọn</div>

          <RenderWhen.False>
            <div className={css.mealContainer}>
              {meals.map((mealType) => {
                const mealMaybe = MEAL_OPTIONS.find(
                  (option) => option.key === mealType,
                );

                if (mealMaybe) {
                  return (
                    <Badge
                      key={mealType}
                      label={mealMaybe.label}
                      type={EBadgeType.warning}
                      className={css.mealBadge}
                    />
                  );
                }

                return null;
              })}
            </div>
          </RenderWhen.False>
        </RenderWhen>
      </div>

      <div className={css.section}>
        <div className={css.label}>Phong cách ẩm thực nhà hàng của bạn</div>

        <RenderWhen condition={isEmpty(categories)}>
          <div>Bạn chưa có lựa chọn</div>

          <RenderWhen.False>
            <div className={css.categoryContainer}>
              {categories.map((category: string) => {
                const labelMaybe = getLabelByKey(categoryOptions, category);

                if (labelMaybe) {
                  return (
                    <Badge
                      key={category}
                      label={labelMaybe}
                      type={EBadgeType.info}
                      className={css.categoryBadge}
                    />
                  );
                }

                return null;
              })}
            </div>
          </RenderWhen.False>
        </RenderWhen>
      </div>
    </div>
  );
};

export default MenuInfo;
