import isEmpty from 'lodash/isEmpty';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { MEAL_OPTIONS } from '@src/utils/enums';

import css from './MenuInfo.module.scss';

type TMenuInfoProps = {
  meals: string[];
  categories: string[];
};

const MenuInfo: React.FC<TMenuInfoProps> = ({ meals, categories }) => {
  return (
    <div className={css.root}>
      <div>
        <div>Thực đơn bạn muốn phục vụ</div>{' '}
        <RenderWhen condition={isEmpty(meals)}>
          <div>Bạn chưa có lựa chọn</div>

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
                />
              );
            }

            return null;
          })}
        </RenderWhen>
      </div>

      <div>
        <div>Phong cách ẩm thực nhà hàng của bạn</div>

        <RenderWhen condition={isEmpty(categories)}>
          <div>Bạn chưa có lựa chọn</div>
        </RenderWhen>
      </div>
    </div>
  );
};

export default MenuInfo;
