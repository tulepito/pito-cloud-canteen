import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';

import FieldFoodSelectCheckboxGroup from '../FieldFoodSelect/FieldFoodSelectCheckboxGroup';
import css from './FoodTable.module.scss';

type TFoodTableProps = {
  items: any[];
};

const FoodTable: React.FC<TFoodTableProps> = ({ items }) => {
  const options = items.map((item) => {
    const { id, attributes } = item || {};
    const { title, price } = attributes;
    return { key: id?.uuid, value: id?.uuid, title, price };
  });

  return (
    <div>
      <div className={css.checkAllLabel}>
        <FieldCheckbox
          svgClassName={css.checkboxSvg}
          name="checkAll"
          id={`food.checkAll`}
          label=""
          value="true"
        />
        <div className={css.label}>
          <div>Tên thực đơn</div>
          <div>Đơn giá</div>
        </div>
      </div>
      <FieldFoodSelectCheckboxGroup id="food" name="food" options={options} />
    </div>
  );
};

export default FoodTable;
