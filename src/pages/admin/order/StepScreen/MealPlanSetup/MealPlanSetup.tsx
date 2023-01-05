import Form from '@components/Form/Form';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
import { useMemo } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import DayInWeekField from '../../create/components/DayInWeekField/DayInWeekField';
import DeliveryAddressField from '../../create/components/DeliveryAddressField/DeliveryAddressField';
import FoodPickingField from '../../create/components/FoodPickingField/FoodPickingField';
import MealPlanDateField from '../../create/components/MealPlanDateField/MealPlanDateField';
// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../../create/components/NavigateButtons/NavigateButtons';
import OrderDeadlineField from '../../create/components/OrderDeadlineField/OrderDeadlineField';
import ParticipantSetupField from '../../create/components/ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../../create/components/PerPackageField/PerPackageField';
import css from './MealPlanSetup.module.scss';

type MealPlanSetupProps = {
  goBack: () => void;
  nextTab: () => void;
};
const MealPlanSetup: React.FC<MealPlanSetupProps> = (props) => {
  const { goBack, nextTab } = props;
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const {
    draftOrder: {
      clientId,
      dayInWeek,
      packagePerMember,
      vatAllow,
      pickAllow,
      selectedGroups,
      deliveryHour,
      startDate,
      endDate,
      deliveryAddress,
      deadlineDate,
      deadlineHour,
    },
  } = useAppSelector((state) => state.Order, shallowEqual);
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
    nextTab();
  };
  const initialValues = useMemo(
    () => ({
      dayInWeek: dayInWeek || [],
      packagePerMember: addCommas(packagePerMember?.toString()) || '',
      vatAllow: vatAllow || true,
      pickAllow: pickAllow || true,
      selectedGroups: selectedGroups || ['allMembers'],
      deliveryHour: deliveryHour || '7:00',
      deliveryAddress:
        location || deliveryAddress
          ? {
              search: defaultAddress || address,
              selectedPlace: {
                address: defaultAddress || address,
                origin: defautlOrigin || origin,
              },
            }
          : null,
      startDate: startDate || '',
      endDate: endDate || '',
      deadlineDate: deadlineDate || null,
      deadlineHour: deadlineHour || '7:00',
    }),
    [
      dayInWeek,
      packagePerMember,
      vatAllow,
      pickAllow,
      selectedGroups,
      deliveryHour,
      location,
      deliveryAddress,
      defaultAddress,
      address,
      defautlOrigin,
      origin,
      startDate,
      endDate,
      deadlineDate,
      deadlineHour,
    ],
  );
  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, form, values } = formRenderProps;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.fieldSection}>
              <DeliveryAddressField
                title={intl.formatMessage({ id: 'DeliveryAddressField.title' })}
              />
            </div>
            <div className={css.fieldSection}>
              <PerPackageField
                title={intl.formatMessage({ id: 'PerPackageField.title' })}
              />
            </div>
            <div className={css.fieldSection}>
              <MealPlanDateField form={form} values={values} />
              <div className={css.verticalSpace}>
                <DayInWeekField form={form} values={values} />
              </div>
            </div>
            {/* <NutritionField /> */}
            <div className={css.fieldSection}>
              <FoodPickingField />
              <div className={css.verticalSpace}>
                <OrderDeadlineField
                  title={intl.formatMessage({ id: 'OrderDeadlineField.title' })}
                  form={form}
                  values={values}
                />
              </div>
              <div className={css.verticalSpace}>
                <ParticipantSetupField
                  form={form}
                  clientId={clientId}
                  title={intl.formatMessage({
                    id: 'ParticipantSetupField.title',
                  })}
                />
              </div>
            </div>

            <NavigateButtons goBack={goBack} />
          </Form>
        );
      }}
    />
  );
};

export default MealPlanSetup;
