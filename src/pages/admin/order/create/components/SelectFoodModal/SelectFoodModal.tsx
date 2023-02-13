import Badge, { EBadgeType } from '@components/Badge/Badge';
import Modal from '@components/Modal/Modal';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import type { TSelectFoodFormValues } from './components/SelectFoodForm/SelectFoodForm';
import SelectFoodForm from './components/SelectFoodForm/SelectFoodForm';
import css from './SelectFoodModal.module.scss';

type TSelectFoodModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  items: any[];
  restaurant: any;
  initialFoodList?: any;
  handleSelectFood: (values: TSelectFoodFormValues) => void;
};

const SelectFoodModal: React.FC<TSelectFoodModalProps> = (props) => {
  const intl = useIntl();
  const {
    isOpen,
    handleClose,
    items,
    restaurant,
    handleSelectFood,
    initialFoodList = {},
  } = props;
  const restaurantId = restaurant?.id?.uuid;
  const { title } = restaurant?.attributes || {};
  const [foodCount, setFoodCount] = useState(0);
  useEffect(() => {
    if (Object.keys(initialFoodList).length > 0) {
      setFoodCount(Object.keys(initialFoodList).length);
    }
  }, [initialFoodList]);

  const handleFormChange = (food: string[] | undefined) => {
    setFoodCount(food?.length || 0);
  };

  const titlePart = (
    <div className={css.modalTitleContainer}>
      <div className={css.title} title={title}>
        {title}
      </div>
      <Badge
        type={EBadgeType.WARNING}
        label={intl.formatMessage(
          {
            id: 'SelectFoodModal.selectedTitle',
          },
          { foodCount },
        )}
        hasDotIcon
      />
    </div>
  );
  const initialValues: TSelectFoodFormValues = useMemo(
    () => ({
      checkAll: false,
      food: Object.keys(initialFoodList),
    }),
    [initialFoodList],
  );

  return (
    <Modal title={titlePart} isOpen={isOpen} handleClose={handleClose}>
      {isOpen && (
        <SelectFoodForm
          formId={restaurantId}
          onSubmit={handleSelectFood}
          items={items}
          handleFormChange={handleFormChange}
          initialValues={initialValues}
        />
      )}
    </Modal>
  );
};

export default SelectFoodModal;
