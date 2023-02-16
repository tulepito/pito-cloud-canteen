/* eslint-disable @typescript-eslint/default-param-last */
import { InlineTextButton } from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import Form from '@components/Form/Form';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import { IntegrationListing } from '@utils/data';
import { getDayOfWeekByIndex } from '@utils/dates';
import type { TIntegrationListing } from '@utils/types';
import type { FormApi } from 'final-form';
import { DateTime } from 'luxon';
import { useImperativeHandle, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import AddFoodModal from '../AddFoodModal/AddFoodModal';
import DayOfWeekCalendarHeader from '../DayOfWeekCalendarHeader/DayOfWeekCalendarHeader';
import type { TEditMenuPricingCalendarResources } from '../EditPartnerMenuWizard/utils';
import FoodEventCard from '../FoodEventCard/FoodEventCard';
import css from './EditMenuPricingForm.module.scss';

export type TEditMenuPricingFormValues = {
  foodsByDate: any;
  checkAll: string[];
  rowCheckbox: string[];
  [id: string]: any;
};

type TExtraProps = {
  currentMenu: TIntegrationListing;
  formRef: any;
  restaurantId: string;
};
type TEditMenuPricingFormComponentProps =
  FormRenderProps<TEditMenuPricingFormValues> & Partial<TExtraProps>;
type TEditMenuPricingFormProps = FormProps<TEditMenuPricingFormValues> &
  TExtraProps;

type TFoodResource = {
  title: string;
  sideDishes: string[];
  id: string;
  price: number;
  foodNote?: string;
};

const renderResourcesForCalendar = (
  foodsByDate: any = {},
  extraData: {
    onRemovePickedFood: (id: string, date: Date) => void;
    daysOfWeek: string[];
  },
) => {
  const resourses: {
    resource: TEditMenuPricingCalendarResources;
    start: Date;
    end: Date;
  }[] = [];

  Object.keys(foodsByDate).forEach((key) => {
    Object.keys(foodsByDate[key]).forEach((foodKey) => {
      resourses.push({
        resource: {
          id: foodsByDate[key][foodKey]?.id,
          title: foodsByDate[key][foodKey]?.title,
          sideDishes: foodsByDate[key][foodKey]?.sideDishes || [],
          price: foodsByDate[key][foodKey]?.price || 0,
          foodNote: foodsByDate[key][foodKey]?.foodNote || '',
          ...extraData,
        },
        start: DateTime.fromMillis(Number(key)).toJSDate(),
        end: DateTime.fromMillis(Number(key)).plus({ hour: 1 }).toJSDate(),
      });
    });
  });
  return resourses;
};

const EditMenuPricingFormComponent: React.FC<
  TEditMenuPricingFormComponentProps
> = (props) => {
  const [currentDate, setCurrentDate] = useState<number | null>();
  const { handleSubmit, currentMenu, values, form, formRef } = props;

  useImperativeHandle(formRef, () => form);

  const onRemovePickedFood = (removeId: string, date: Date) => {
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

  const { daysOfWeek } = IntegrationListing(currentMenu).getPublicData();

  const resourcesForCalendar = renderResourcesForCalendar(values.foodsByDate, {
    onRemovePickedFood,
    daysOfWeek,
  });

  const onSetCurrentDate = (params: any) => () => {
    const { date, events } = params;
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

  const calendarContentStart = (contentProps: any) => {
    const dayAsIndex = new Date(contentProps.date).getDay() - 1;
    const dayOfWeekToCompare = getDayOfWeekByIndex(dayAsIndex);

    const { daysOfWeek: daysOfWeekFromMenu = [] } =
      IntegrationListing(currentMenu).getPublicData();
    if (!daysOfWeekFromMenu.includes(dayOfWeekToCompare)) {
      return <></>;
    }
    return (
      <InlineTextButton
        onClick={onSetCurrentDate(contentProps)}
        className={css.addButton}>
        <div className={css.iconAdd}>
          <IconAdd />
        </div>
        <FormattedMessage id="EditMenuPricingForm.addFoodButton" />
      </InlineTextButton>
    );
  };

  const calendarContentEnd = ({
    events = [],
    date,
  }: {
    events: any[];
    date: Date;
  }) => {
    const dayAsIndex = new Date(date).getDay() - 1;
    const dayOfWeekToCompare = getDayOfWeekByIndex(dayAsIndex);

    const { daysOfWeek: daysOfWeekFromMenu = [] } =
      IntegrationListing(currentMenu).getPublicData();
    if (!daysOfWeekFromMenu.includes(dayOfWeekToCompare)) {
      return <></>;
    }
    const noFood = events.length === 0;
    return noFood ? (
      <div className={css.noFood}>
        <FormattedMessage id="EditMenuPricingForm.noFoods" />
      </div>
    ) : (
      <></>
    );
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <h2 className={css.title}>
          <FormattedMessage id="EditMenuPricingForm.pricingTitle" />
        </h2>
        {currentMenu && (
          <CalendarDashboard
            renderEvent={FoodEventCard}
            events={resourcesForCalendar}
            headerComponent={(headerProps) => (
              <DayOfWeekCalendarHeader {...headerProps} />
            )}
            components={{
              toolbar: () => <></>,
              contentStart: calendarContentStart,
              contentEnd: calendarContentEnd,
            }}
          />
        )}
      </Form>
      <AddFoodModal
        isOpen={!!currentDate}
        handleClose={onCloseModal}
        currentMenu={currentMenu as TIntegrationListing}
        values={values}
        form={form as unknown as FormApi}
        currentDate={currentDate}
      />
    </>
  );
};

const EditMenuPricingForm: React.FC<TEditMenuPricingFormProps> = (props) => {
  return <FinalForm {...props} component={EditMenuPricingFormComponent} />;
};

export default EditMenuPricingForm;
