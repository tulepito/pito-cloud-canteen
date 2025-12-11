import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import type { FormApi } from 'final-form';

import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import Form from '@components/Form/Form';
import ValidationError from '@components/ValidationError/ValidationError';
import { getLabelByKey, MENU_TYPE_OPTIONS } from '@src/utils/options';
import { foodByDatesAtLeastOneDayHasFood } from '@src/utils/validators';
import { IntegrationListing } from '@utils/data';
import { formatTimestamp } from '@utils/dates';
import type { TIntegrationListing } from '@utils/types';

import AddFoodModal from '../AddFoodModal/AddFoodModal';
import CalendarContentEnd from '../CalendarContentEnd/CalendarContentEnd';
import CalendarContentStart from '../CalendarContentStart/CalendarContentStart';
import { renderResourcesForCalendar } from '../EditPartnerMenuWizard/utils';
import FoodEventCard from '../FoodEventCard/FoodEventCard';

import css from './EditMenuCompleteForm.module.scss';

export type TEditMenuCompleteFormValues = {
  rowCheckbox: string[];
  [id: string]: any;
};

const HiddenField = (hiddenProps: any) => {
  const { input, meta: fieldMeta } = hiddenProps;

  return (
    <div className={css.imageRequiredWrapper}>
      <input {...input} />
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

type TFoodResource = {
  title: string;
  sideDishes: string[];
  id: string;
  price: number;
  foodNote?: string;
};

type TExtraProps = {
  currentMenu?: TIntegrationListing | null;
  formRef: any;
  restaurantId: string;
  anchorDate: Date;
  isReadOnly?: boolean;
};
type TEditMenuCompleteFormComponentProps =
  FormRenderProps<TEditMenuCompleteFormValues> & Partial<TExtraProps>;
type TEditMenuCompleteFormProps = FormProps<TEditMenuCompleteFormValues> &
  TExtraProps;

const EditMenuCompleteFormComponent: React.FC<
  TEditMenuCompleteFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    currentMenu,
    formRef,
    form,
    values,
    anchorDate,
    isReadOnly,
  } = props;
  formRef.current = form;
  const [currentDate, setCurrentDate] = useState<number | null>();
  const { title } = IntegrationListing(currentMenu).getAttributes();
  const { menuType } = IntegrationListing(currentMenu).getMetadata();
  const { startDate, endDate } =
    IntegrationListing(currentMenu).getPublicData();

  const { daysOfWeek = [] } = IntegrationListing(currentMenu).getPublicData();
  const { foodsByDate } = values;
  const onRemovePickedFood = (removeId: string, date: Date) => {
    if (isReadOnly) return;
    const currentDateAsTimestamp = date.getTime();
    const pickedFoodsOnDate = { ...values.foodsByDate[currentDateAsTimestamp] };
    Object.keys(pickedFoodsOnDate).forEach((keyId: string) => {
      if (removeId === keyId) {
        delete pickedFoodsOnDate[removeId];
        const newFoodsByDate = {
          ...values.foodsByDate,
          [currentDateAsTimestamp]: {
            ...pickedFoodsOnDate,
          },
        };

        form.change('foodsByDate', newFoodsByDate);
      }
    });
  };

  const resourcesForCalendar = renderResourcesForCalendar(foodsByDate, {
    onRemovePickedFood,
    daysOfWeek,
    hideRemoveButton: isReadOnly,
  });

  const onSetCurrentDate = (params: any) => () => {
    const { date, events } = params;
    if (isReadOnly) return;
    const dateAsTimeStaimp = new Date(date).getTime();
    setCurrentDate(dateAsTimeStaimp);
    const currentDayEvents = events.filter(
      (e: any) => new Date(e.start).getTime() === new Date(date).getTime(),
    );
    const listIds = currentDayEvents.map((e: any) => e.resource.id);
    const listIdsWithSideDishes = currentDayEvents.map((e: any) => e.resource);
    form.change('rowCheckbox', listIds);
    listIdsWithSideDishes.forEach(
      ({ id, sideDishes = [], foodNote }: TFoodResource) => {
        form.change(`${id}.foodNote`, foodNote);

        return form.change(`${id}.sideDishes`, sideDishes);
      },
    );
  };

  const onCloseModal = () => {
    setCurrentDate(null);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <div className={css.root}>
          <div className={css.devidedSection}>
            <h3 className={css.sectionTitle}>
              <FormattedMessage id="EditMenuCompleteForm.menuInformation" />
            </h3>
            <div className={css.content}>
              <div className={css.titleGroup}>
                <label className={css.label}>
                  <FormattedMessage id="EditMenuCompleteForm.menuName" />
                </label>
                <div className={css.title}>{title}</div>
              </div>
              <div className={css.titleGroup}>
                <label className={css.label}>
                  <FormattedMessage id="EditMenuCompleteForm.menuType" />
                </label>
                <div>{getLabelByKey(MENU_TYPE_OPTIONS, menuType)}</div>
              </div>
            </div>
          </div>
          <div className={css.devidedSection}>
            <h3 className={css.sectionTitle}>
              <FormattedMessage id="EditMenuCompleteForm.applyTime" />
            </h3>
            <div className={css.content}>
              <div className={css.titleGroup}>
                <label className={css.label}>
                  <FormattedMessage id="EditMenuCompleteForm.startDate" />
                </label>
                <div className={css.title}>
                  {startDate &&
                    formatTimestamp(startDate, 'EEE, dd MMMM, yyyy')}
                </div>
              </div>
              <div className={css.titleGroup}>
                <label className={css.label}>
                  <FormattedMessage id="EditMenuCompleteForm.endDateLabel" />
                </label>
                <div>
                  {endDate && formatTimestamp(endDate, 'EEE, dd MMMM, yyyy')}
                </div>
              </div>
            </div>
          </div>
          <div className={css.devidedSection}>
            <h3 className={css.sectionTitle}>
              <FormattedMessage id="EditMenuCompleteForm.foodList" />
            </h3>
            {currentMenu && (
              <CalendarDashboard
                anchorDate={anchorDate}
                renderEvent={FoodEventCard}
                events={resourcesForCalendar}
                components={{
                  toolbar: () => <></>,
                  contentEnd: (contentProps: any) => (
                    <CalendarContentEnd
                      {...contentProps}
                      currentMenu={currentMenu}
                    />
                  ),
                  contentStart: (contentProps: any) => (
                    <CalendarContentStart
                      {...contentProps}
                      currentMenu={currentMenu}
                      onSetCurrentDate={onSetCurrentDate}
                      isReadOnly={isReadOnly}
                    />
                  ),
                }}
              />
            )}
          </div>
          <Field
            component={HiddenField}
            name="foodsByDate"
            type="hidden"
            validate={foodByDatesAtLeastOneDayHasFood(
              'Chọn ít nhất một món cho một ngày',
              daysOfWeek,
            )}
          />
        </div>
      </Form>
      <AddFoodModal
        isOpen={!!currentDate}
        handleClose={onCloseModal}
        currentMenu={currentMenu as TIntegrationListing}
        values={values}
        form={form as unknown as FormApi}
        currentDate={currentDate}
        isReadOnly={isReadOnly}
      />
    </>
  );
};

const EditMenuCompleteForm: React.FC<TEditMenuCompleteFormProps> = (props) => {
  return <FinalForm {...props} component={EditMenuCompleteFormComponent} />;
};

export default EditMenuCompleteForm;
