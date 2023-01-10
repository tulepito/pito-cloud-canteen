import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconArrow from '@components/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import DeliveryAddressField from '../DeliveryAddressField/DeliveryAddressField';
import MealPlanDateField from '../MealPlanDateField/MealPlanDateField';
import OrderDeadlineField from '../OrderDeadlineField/OrderDeadlineField';
import ParticipantSetupField from '../ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../PerPackageField/PerPackageField';
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
  const dispatch = useAppDispatch();
  const {
    draftOrder: {
      clientId,
      packagePerMember,
      selectedGroups = [],
      deliveryHour,
      deliveryAddress,
      deadlineDate,
      deadlineHour,
      vatAllow,
      startDate,
      endDate,
    },
  } = useAppSelector((state) => state.Order, shallowEqual);
  const { address, origin } = deliveryAddress || {};
  const initialValues = useMemo(
    () => ({
      packagePerMember: addCommas(packagePerMember.toString()) || '',
      vatAllow: vatAllow || true,
      selectedGroups: selectedGroups || ['allMembers'],
      deliveryHour: deliveryHour || '',
      deadlineDate: deadlineDate || null,
      deadlineHour: deadlineHour || null,
      deliveryAddress: deliveryAddress
        ? {
            search: address,
            selectedPlace: { address, origin },
          }
        : null,
      startDate: startDate || null,
      endDate: endDate || null,
    }),
    [
      packagePerMember,
      vatAllow,
      selectedGroups,
      deliveryHour,
      deadlineDate,
      deadlineHour,
      deliveryAddress,
      address,
      origin,
      startDate,
      endDate,
    ],
  );
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
  const rightSideRenderer = (form: any, values: any) => {
    switch (selectedField) {
      case OrderSettingField.COMPANY:
        return (
          <>
            <div className={css.title}>
              {intl.formatMessage({
                id: 'OrderSettingModal.field.company',
              })}
            </div>
            <div className={css.fieldContent}></div>
          </>
        );
      case OrderSettingField.DELIVERY_ADDRESS:
        return (
          <>
            <div className={css.title}>
              {intl.formatMessage({
                id: 'OrderSettingModal.field.deliveryAddress',
              })}
            </div>
            <div className={css.fieldContent}>
              <DeliveryAddressField />
            </div>
          </>
        );
      case OrderSettingField.DELIVERY_TIME:
        return (
          <>
            <div className={css.title}>
              {intl.formatMessage({
                id: 'OrderSettingModal.field.deliveryTime',
              })}
            </div>
            <MealPlanDateField columnLayout form={form} values={values} />
          </>
        );
      case OrderSettingField.PICKING_DEADLINE:
        return (
          <>
            <div className={css.title}>
              {intl.formatMessage({
                id: 'OrderSettingModal.field.pickingDeadline',
              })}
            </div>
            <div className={css.fieldContent}>
              <OrderDeadlineField columnLayout form={form} values={values} />
            </div>
          </>
        );
      case OrderSettingField.EMPLOYEE_AMOUNT:
        return (
          <>
            <div className={css.title}>
              {intl.formatMessage({
                id: 'OrderSettingModal.field.employeeAmount',
              })}
            </div>
            <div className={css.fieldContent}></div>
          </>
        );
      case OrderSettingField.SPECIAL_DEMAND:
        return (
          <>
            <div className={css.title}>
              {intl.formatMessage({
                id: 'OrderSettingModal.field.specialDemand',
              })}
            </div>
            <div className={css.fieldContent}></div>
          </>
        );
      case OrderSettingField.ACCESS_SETTING:
        return (
          <>
            <div className={css.title}>Cài đặt truy cập</div>
            <div className={css.fieldContent}>
              <ParticipantSetupField form={form} clientId={clientId} />
            </div>
          </>
        );
      case OrderSettingField.PER_PACK:
        return (
          <>
            <div className={css.title}>Ngân sách 1 người</div>
            <div className={css.fieldContent}>
              <PerPackageField />
            </div>
          </>
        );

      default:
        return null;
    }
  };
  const onSubmit = (values: any) => {
    const {
      deliveryAddress: deliveryAddressValues,
      packagePerMember: packagePerMemberValue,
      ...rest
    } = values;
    const {
      selectedPlace: { address: addressValue, origin: originValue },
    } = deliveryAddressValues;
    const createOrderValue = {
      deliveryAddress: {
        address: addressValue,
        origin: originValue,
      },
      packagePerMember: +packagePerMemberValue.replace(/,/g, ''),
      ...rest,
    };
    dispatch(updateDraftMealPlan(createOrderValue));
  };
  return (
    <Modal
      isOpen={isOpen}
      handleClose={onClose}
      title={intl.formatMessage({ id: 'OrderSettingModal.title' })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.orderId}>#Draft</div>
        <div className={css.container}>
          <div className={css.leftSide}>{leftSideRenderer()}</div>
          <div className={css.rightSide}>
            <FinalForm
              // mutators={{ ...arrayMutators }}
              onSubmit={onSubmit}
              initialValues={initialValues}
              render={(formRenderProps: FormRenderProps) => {
                const { handleSubmit, form, values, invalid } = formRenderProps;
                console.log('invalid: ', invalid);
                return (
                  <Form onSubmit={handleSubmit}>
                    {rightSideRenderer(form, values)}
                    <Button
                      className={css.submitBtn}
                      disabled={invalid}
                      type="submit">
                      {intl.formatMessage({
                        id: 'OrderSettingModal.saveChange',
                      })}
                    </Button>
                  </Form>
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
