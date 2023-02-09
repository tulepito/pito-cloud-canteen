import Form from '@components/Form/Form';
import { calculateGroupMembersAmount } from '@helpers/companyMembers';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { OrderAsyncAction } from '@redux/slices/Order.slice';
import { Listing, User } from '@utils/data';
import type { TListing } from '@utils/types';
import isEmpty from 'lodash/isEmpty';
import { useMemo } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import DayInWeekField from '../../create/components/DayInWeekField/DayInWeekField';
import DeliveryAddressField from '../../create/components/DeliveryAddressField/DeliveryAddressField';
import FoodPickingField from '../../create/components/FoodPickingField/FoodPickingField';
import MealPlanDateField from '../../create/components/MealPlanDateField/MealPlanDateField';
import MemberAmountField from '../../create/components/MemberAmountField/MemberAmountField';
// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../../create/components/NavigateButtons/NavigateButtons';
import NutritionField from '../../create/components/NutritionField/NutritionField';
import OrderDeadlineField from '../../create/components/OrderDeadlineField/OrderDeadlineField';
import ParticipantSetupField from '../../create/components/ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../../create/components/PerPackageField/PerPackageField';
import css from './MealPlanSetup.module.scss';

type MealPlanSetupProps = {
  goBack: () => void;
  nextTab: () => void;
};
const MealPlanSetup: React.FC<MealPlanSetupProps> = (props) => {
  const { nextTab } = props;
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );
  const selectedBooker = useAppSelector(
    (state) => state.Order.selectedBooker,
    shallowEqual,
  );
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const {
    companyId: clientId,
    dayInWeek,
    packagePerMember = '',
    vatAllow = true,
    pickAllow = true,
    selectedGroups = ['allMembers'],
    deliveryHour,
    startDate,
    endDate,
    nutritions,
    deliveryAddress,
    detailAddress,
    deadlineDate,
    deadlineHour,
    memberAmount,
  } = Listing(order as TListing).getMetadata();
  const { address, origin } = deliveryAddress || {};
  const companies = useAppSelector(
    (state) => state.ManageCompaniesPage.companyRefs,
    shallowEqual,
  );
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );

  const {
    location: { address: defaultAddress = '', origin: defautlOrigin = {} } = {},
    location,
  } = currentClient?.attributes.profile.publicData || {};

  const onSubmit = (values: any) => {
    const {
      deliveryAddress: deliveryAddressValues,
      packagePerMember: packagePerMemberValue,
      pickAllow: pickAllowSubmitValue,
      deadlineDate: deadlineDateSubmitValue,
      deadlineHour: deadlineHourSubmitValue,
      selectedGroups: selectedGroupsSubmitValue,
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
      pickAllow: pickAllowSubmitValue,
      packagePerMember: +packagePerMemberValue.replace(/,/g, '') || 0,
      selectedGroups: pickAllowSubmitValue ? selectedGroupsSubmitValue : [],
      deadlineDate: pickAllowSubmitValue ? deadlineDateSubmitValue : null,
      deadlineHour: pickAllowSubmitValue ? deadlineHourSubmitValue : null,
      ...rest,
    };
    dispatch(OrderAsyncAction.updateOrder({ generalInfo })).then(() => {
      nextTab();
    });
  };

  const initialValues = useMemo(
    () => ({
      vatAllow,
      pickAllow,
      dayInWeek: !isEmpty(dayInWeek)
        ? dayInWeek
        : ['mon', 'tue', 'wed', 'thu', 'fri'],
      packagePerMember: addCommas(packagePerMember?.toString()) || '',
      selectedGroups,
      nutritions: !isEmpty(nutritions) ? nutritions : [],
      deliveryHour: deliveryHour || '07:00',
      deliveryAddress:
        location || deliveryAddress
          ? {
              search: address || defaultAddress,
              selectedPlace: {
                address: address || defaultAddress,
                origin: origin || defautlOrigin,
              },
            }
          : null,
      detailAddress: detailAddress || '',
      startDate: startDate || '',
      endDate: endDate || '',
      deadlineDate: deadlineDate || null,
      deadlineHour: deadlineHour || '07:00',
      memberAmount:
        memberAmount || currentClient
          ? calculateGroupMembersAmount(currentClient, selectedGroups)
          : null,
    }),
    [
      dayInWeek,
      packagePerMember,
      vatAllow,
      pickAllow,
      nutritions,
      selectedGroups,
      deliveryHour,
      location,
      deliveryAddress,
      defaultAddress,
      detailAddress,
      address,
      defautlOrigin,
      origin,
      startDate,
      endDate,
      deadlineDate,
      deadlineHour,
      memberAmount,
      currentClient,
    ],
  );
  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, form, values } = formRenderProps;
        const { pickAllow: pickAllowValue = true } = values;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.headerLabel}>
              {intl.formatMessage(
                { id: 'MealPlanSetup.headerLabel' },
                {
                  companyName: User(currentClient).getPublicData().companyName,
                  bookerName: User(selectedBooker).getProfile().displayName,
                },
              )}
            </div>
            <div className={css.fieldSection}>
              <DeliveryAddressField
                title={intl.formatMessage({ id: 'DeliveryAddressField.title' })}
              />
            </div>
            <div className={css.fieldSection}>
              <PerPackageField
                title={intl.formatMessage({ id: 'PerPackageField.title' })}
              />
              <div className={css.verticalSpace}>
                <MemberAmountField
                  title={intl.formatMessage({ id: 'MemberAmountField.title' })}
                />
              </div>
            </div>
            <div className={css.fieldSection}>
              <NutritionField
                title={intl.formatMessage({ id: 'NutritionField.title' })}
              />
            </div>
            <div className={css.fieldSection}>
              <MealPlanDateField
                form={form}
                values={values}
                title={intl.formatMessage({ id: 'MealPlanDateField.title' })}
              />
              <div className={css.verticalSpace}>
                <DayInWeekField form={form} values={values} />
              </div>
            </div>

            <div className={css.fieldSection}>
              <FoodPickingField />
              {pickAllowValue && (
                <div className={css.verticalSpace}>
                  <OrderDeadlineField
                    title={intl.formatMessage({
                      id: 'OrderDeadlineField.title',
                    })}
                    form={form}
                    values={values}
                  />
                </div>
              )}
              {pickAllowValue && (
                <div className={css.verticalSpace}>
                  <ParticipantSetupField
                    form={form}
                    clientId={clientId}
                    title={intl.formatMessage({
                      id: 'ParticipantSetupField.title',
                    })}
                  />
                </div>
              )}
            </div>

            <NavigateButtons inProgress={updateOrderInProgress} />
          </Form>
        );
      }}
    />
  );
};

export default MealPlanSetup;
