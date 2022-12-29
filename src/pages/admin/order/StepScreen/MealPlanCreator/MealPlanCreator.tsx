import Button from '@components/Button/Button';
import useBoolean from '@hooks/useBoolean';

import OrderSettingModal, {
  OrderSettingField,
} from '../../create/components/OrderSettingModal/OrderSettingModal';
import css from './MealPlanCreator.module.scss';

type MealPlanCreatorProps = {};

const MealPlanCreator: React.FC<MealPlanCreatorProps> = () => {
  const {
    value: isOrderSettingModalOpen,
    setFalse: onOrderSettingModalClose,
    setTrue: onOrderSettingModalOpen,
  } = useBoolean();
  const initialFieldValues = {
    [OrderSettingField.COMPANY]: 'Capi Creative',
    [OrderSettingField.DELIVERY_ADDRESS]: '123 Trần Huy Liệu, phuong 4 quan 10',
    [OrderSettingField.DELIVERY_TIME]: '12:00',
    [OrderSettingField.PICKING_DEADLINE]: '20/11/2022, 11:59',
    [OrderSettingField.EMPLOYEE_AMOUNT]: '10',
    [OrderSettingField.SPECIAL_DEMAND]: '',
    [OrderSettingField.ACCESS_SETTING]: 'Tất cả',
    [OrderSettingField.PER_PACK]: '50.000đ/bữa',
  };
  return (
    <div className={css.container}>
      <Button onClick={onOrderSettingModalOpen}>Setting</Button>
      <OrderSettingModal
        isOpen={isOrderSettingModalOpen}
        onClose={onOrderSettingModalClose}
        initialFieldValues={initialFieldValues}
      />
    </div>
  );
};

export default MealPlanCreator;
