import Form from '@components/Form/Form';
import IconArrow from '@components/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import classNames from 'classnames';
import { useState } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './OrderSettingModal.module.scss';

type OrderSettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialFieldValues: any;
};

export enum OrderSettingField {
  COMPANY = 'company',
  DELIVERY_ADDRESS = 'deliveryAddress',
  DELIVERY_TIME = 'deliveryTime',
  PICKING_DEADLINE = 'pickingDeadline',
  EMPLOYEE_AMOUNT = 'employeeAmount',
  SPECIAL_DEMAND = 'specialDemand',
  ACCESS_SETTING = 'accessSetting',
  PER_PACK = 'perPack',
}

const OrderSettingModal: React.FC<OrderSettingModalProps> = (props) => {
  const { isOpen, onClose, initialFieldValues } = props;
  const [selectedField, setSelectedField] = useState<string>(
    OrderSettingField.COMPANY,
  );
  const intl = useIntl();
  const leftSideRenderer = () =>
    Object.keys(initialFieldValues).map((field: string) => {
      const fieldSelectorClasses = classNames(css.fieldSelector, {
        [css.selected]: field === selectedField,
      });
      const onSelectField = () => {
        setSelectedField(field);
      };
      return (
        <div
          key={field}
          className={fieldSelectorClasses}
          onClick={onSelectField}>
          <div className={css.fieldName}>
            {intl.formatMessage({ id: `OrderSettingModal.field.${field}` })}
          </div>
          <div className={css.fieldValue}>{initialFieldValues[field]}</div>
          <IconArrow className={css.iconArrowRight} direction="right" />
        </div>
      );
    });
  const rightSideRenderer = () => {
    switch (selectedField) {
      case OrderSettingField.COMPANY:
        return <div>Company</div>;
      case OrderSettingField.DELIVERY_ADDRESS:
        return <div>deliveryAddress</div>;
      case OrderSettingField.DELIVERY_TIME:
        return <div>deliveryTime</div>;
      case OrderSettingField.PICKING_DEADLINE:
        return <div>pickingDeadline</div>;
      case OrderSettingField.EMPLOYEE_AMOUNT:
        return <div>employeeAmount</div>;
      case OrderSettingField.SPECIAL_DEMAND:
        return <div>specialDemand</div>;
      case OrderSettingField.ACCESS_SETTING:
        return <div>accessSetting</div>;
      case OrderSettingField.PER_PACK:
        return <div>perPack</div>;

      default:
        return null;
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      handleClose={onClose}
      title={intl.formatMessage({ id: 'OrderSettingModal.title' })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.orderId}>PT0001</div>
        <div className={css.container}>
          <div className={css.leftSide}>{leftSideRenderer()}</div>
          <div className={css.rightSide}>
            <FinalForm
              onSubmit={() => {}}
              render={(formRenderProps: FormRenderProps) => {
                const { handleSubmit } = formRenderProps;
                return (
                  <Form onSubmit={handleSubmit}>{rightSideRenderer()}</Form>
                );
              }}
            />
          </div>
        </div>
      </OutsideClickHandler>
    </Modal>
  );
};
export default OrderSettingModal;
