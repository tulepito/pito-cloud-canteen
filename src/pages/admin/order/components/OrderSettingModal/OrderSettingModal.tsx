/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';
import difference from 'lodash/difference';
import isEqual from 'lodash/isEqual';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

import DeliveryAddressField from '../DeliveryAddressField/DeliveryAddressField';
import MealPlanDateField from '../MealPlanDateField/MealPlanDateField';
import MealTypeField from '../MealTypeField/MealTypeField';
import MemberAmountField from '../MemberAmountField/MemberAmountField';
import NutritionField from '../NutritionField/NutritionField';
import OrderDeadlineField from '../OrderDeadlineField/OrderDeadlineField';
import ParticipantSetupField from '../ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../PerPackageField/PerPackageField';

import css from './OrderSettingModal.module.scss';

type TOrderSettingModalProps = {
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

const OrderSettingModal: React.FC<TOrderSettingModalProps> = (props) => {
  const { isOpen, onClose, initialFieldValues } = props;
  const [selectedField, setSelectedField] = useState<string>(
    OrderSettingField.COMPANY,
  );
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );
  const recommendRestaurantInProgress = useAppSelector(
    (state) => state.Order.recommendRestaurantInProgress,
  );
  const updateOrderDetailInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );
  const nutritionsOptions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );

  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const { title: orderId } = Listing(order as TListing).getAttributes();

  const {
    companyId: clientId,
    packagePerMember = '',
    pickAllow = true,
    vatAllow = true,
    selectedGroups = [],
    deliveryHour,
    startDate,
    endDate,
    deliveryAddress,
    detailAddress,
    deadlineDate,
    deadlineHour,
    memberAmount,
    nutritions = [],
    dayInWeek = ['mon', 'tue', 'wed', 'thu', 'fri'],
    mealType,
  } = Listing(order as TListing).getMetadata();
  const { address, origin } = deliveryAddress || {};
  const initialValues = useMemo(
    () => ({
      vatAllow,
      packagePerMember: addCommas(packagePerMember.toString()) || '',
      selectedGroups: selectedGroups || ['allMembers'],
      deliveryHour: deliveryHour || '',
      deadlineDate: deadlineDate || null,
      deadlineHour: deadlineHour || null,
      detailAddress: detailAddress || '',
      deliveryAddress: deliveryAddress
        ? {
            search: address,
            selectedPlace: { address, origin },
          }
        : null,
      nutritions,
      startDate: startDate || null,
      endDate: endDate || null,
      memberAmount:
        memberAmount || initialFieldValues[OrderSettingField.EMPLOYEE_AMOUNT],
      dayInWeek,
      mealType,
    }),
    [
      packagePerMember,
      vatAllow,
      JSON.stringify(selectedGroups),
      deliveryHour,
      deadlineDate,
      deadlineHour,
      JSON.stringify(deliveryAddress),
      detailAddress,
      address,
      JSON.stringify(origin),
      startDate,
      endDate,
      memberAmount,
      JSON.stringify(initialFieldValues),
      JSON.stringify(nutritions),
      JSON.stringify(dayInWeek),
      JSON.stringify(mealType),
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
    const customStartDateChangeHandler = (date: number) => {
      form.change(
        'deadlineDate',
        DateTime.fromMillis(date).minus({ days: 3 }).toMillis(),
      );
    };
    switch (selectedField) {
      case OrderSettingField.COMPANY:
        return (
          <>
            <div className={css.title}>
              {intl.formatMessage(
                {
                  id: 'OrderSettingModal.field.company.value',
                },
                { companyName: initialFieldValues[OrderSettingField.COMPANY] },
              )}
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
            <MealPlanDateField
              columnLayout
              form={form}
              values={values}
              onCustomStartDateChange={customStartDateChangeHandler}
              containerClassName={css.fieldContainer}
            />
          </>
        );
      case OrderSettingField.PICKING_DEADLINE:
        return (
          pickAllow && (
            <>
              <div className={css.title}>
                {intl.formatMessage({
                  id: 'OrderSettingModal.field.pickingDeadline',
                })}
              </div>
              <div className={css.fieldContent}>
                <OrderDeadlineField
                  columnLayout
                  form={form}
                  values={values}
                  containerClassName={css.fieldContainer}
                />
              </div>
            </>
          )
        );
      case OrderSettingField.EMPLOYEE_AMOUNT:
        return (
          <>
            <div className={css.title}>
              {intl.formatMessage({
                id: 'OrderSettingModal.field.employeeAmount',
              })}
            </div>
            <div className={css.fieldContent}>
              <MemberAmountField />
            </div>
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
            <div className={css.fieldContent}>
              <div className={css.subLabel}>
                {intl.formatMessage({ id: 'MealTypeField.title' })}
              </div>
              <MealTypeField />

              <div className={css.subLabel}>
                {intl.formatMessage({ id: 'NutritionField.title' })}
              </div>
              <NutritionField options={nutritionsOptions} />
            </div>
          </>
        );
      case OrderSettingField.ACCESS_SETTING:
        return (
          pickAllow && (
            <>
              <div className={css.title}>Cài đặt truy cập</div>
              <div className={css.fieldContent}>
                <ParticipantSetupField form={form} clientId={clientId} />
              </div>
            </>
          )
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

  const onSubmit = async (values: any) => {
    const {
      deliveryAddress: deliveryAddressValues,
      packagePerMember: packagePerMemberValue,
      startDate: startDateValue,
      endDate: endDateValue,
      deliveryHour: deliveryHourValue,
      nutritions: nutritionsValue,
      ...rest
    } = values;
    const {
      selectedPlace: { address: addressValue, origin: originValue },
    } = deliveryAddressValues;
    const generalInfo = {
      deliveryAddress: {
        address: addressValue,
        origin: originValue,
      },
      packagePerMember: parseInt(
        packagePerMemberValue?.replace(/,/g, '') || 0,
        10,
      ),
      startDate: startDateValue,
      endDate: endDateValue,
      deliveryHour: deliveryHourValue,
      nutritions: nutritionsValue,
      ...rest,
    };
    try {
      await dispatch(orderAsyncActions.updateOrder({ generalInfo }));

      const { plans = [] } = Listing(order as TListing).getMetadata();
      const changedOrderDetailFactor =
        startDate !== startDateValue ||
        endDate !== endDateValue ||
        difference(nutritions, nutritionsValue).length > 0 ||
        packagePerMember !==
          parseInt(packagePerMemberValue?.replace(/,/g, '') || 0, 10);
      const { payload: newOrderDetail } = await dispatch(
        orderAsyncActions.recommendRestaurants({}),
      );

      if (!isEqual(orderDetail, newOrderDetail) && changedOrderDetailFactor) {
        const planId = plans[0];
        await dispatch(
          orderAsyncActions.updatePlanDetail({
            orderId: Listing(order as TListing).getId(),
            orderDetail: newOrderDetail,
            planId,
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const hideSubmitButton = selectedField === OrderSettingField.COMPANY;
  const submitInProgress =
    updateOrderInProgress ||
    recommendRestaurantInProgress ||
    updateOrderDetailInProgress;

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      id="OrderSettingModal"
      isOpen={isOpen}
      handleClose={onClose}
      title={intl.formatMessage({ id: 'OrderSettingModal.title' })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.orderId}>#{orderId}</div>
        <div className={css.container}>
          <div className={css.leftSide}>{leftSideRenderer()}</div>
          <div className={css.rightSide}>
            <FinalForm
              mutators={{ ...arrayMutators }}
              onSubmit={onSubmit}
              initialValues={initialValues}
              render={(formRenderProps: FormRenderProps) => {
                const { handleSubmit, form, values, invalid } = formRenderProps;

                return (
                  <Form onSubmit={handleSubmit}>
                    {rightSideRenderer(form, values)}
                    {!hideSubmitButton && (
                      <Button
                        className={css.submitBtn}
                        disabled={invalid || submitInProgress}
                        inProgress={submitInProgress}
                        type="submit">
                        {intl.formatMessage({
                          id: 'OrderSettingModal.saveChange',
                        })}
                      </Button>
                    )}
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
