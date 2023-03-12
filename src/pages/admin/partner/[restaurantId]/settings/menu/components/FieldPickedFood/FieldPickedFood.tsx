import React from 'react';

import { InlineTextButton } from '@components/Button/Button';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconClose from '@components/Icons/IconClose/IconClose';
import { parsePrice } from '@utils/validators';

import css from './FieldPickedFood.module.scss';

type TFieldPickedFood = {
  title?: string;
  price: number;
  id: string;
  onRemovePickedFood: (id: string) => () => void;
};

const FieldPickedFood: React.FC<TFieldPickedFood> = (props) => {
  const { price, title, id, onRemovePickedFood } = props;

  return (
    <div className={css.root}>
      <div className={css.label}>
        <div className={css.labelLeft}>
          <InlineTextButton
            type="button"
            onClick={onRemovePickedFood(id)}
            className={css.iconCloseButton}>
            <IconClose className={css.iconClose} />
          </InlineTextButton>
          <div className={css.title}>{title}</div>
        </div>
        <div className={css.price}>{parsePrice(String(price))}đ</div>
      </div>
      <FieldTextInput
        className={css.field}
        name={`${id}.foodNote`}
        id={`${id}.foodNote`}
        placeholder="Thêm ghi chú..."
      />
    </div>
  );
};

export default FieldPickedFood;
