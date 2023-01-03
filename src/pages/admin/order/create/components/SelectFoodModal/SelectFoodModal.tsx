import Badge from '@components/Badge/Badge';
import Modal from '@components/Modal/Modal';
import type { FormState } from 'final-form';
import { useEffect, useState } from 'react';

import type { TSelectFoodFormValues } from './components/SelectFoodForm/SelectFoodForm';
import SelectFoodForm from './components/SelectFoodForm/SelectFoodForm';
import css from './SelectFoodModal.module.scss';

type TSelectFoodModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  items: any[];
  restaurant: any;
  handleSelectFood: (values: TSelectFoodFormValues) => void;
};

const SelectFoodModal: React.FC<TSelectFoodModalProps> = (props) => {
  const { isOpen, handleClose, items, restaurant, handleSelectFood } = props;
  const restaurantId = restaurant?.id?.uuid;
  const { title } = restaurant?.attributes || {};
  const [foodCount, setFoodCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const handleFormChange = (
    form: FormState<TSelectFoodFormValues, Partial<TSelectFoodFormValues>>,
  ) => {
    if (!mounted) {
      return;
    }

    const {
      values: { food },
    } = form;

    setFoodCount(food?.length);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const titlePart = (
    <div className={css.modalTitleContainer}>
      <div className={css.title} title={title}>
        {title}
      </div>
      <Badge type="warning" label={`Đã chọn: ${foodCount} món`} hasDotIcon />
    </div>
  );

  return (
    <Modal title={titlePart} isOpen={isOpen} handleClose={handleClose}>
      {isOpen && (
        <SelectFoodForm
          formId={restaurantId}
          onSubmit={handleSelectFood}
          items={items}
          handleFormChange={handleFormChange}
          initialValues={{ checkAll: false }}
        />
      )}
    </Modal>
  );
};

export default SelectFoodModal;
