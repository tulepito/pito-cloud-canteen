import { InlineTextButton } from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import Form from '@components/Form/Form';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import { INTERGRATION_LISTING } from '@utils/data';
import type { TIntergrationListing } from '@utils/types';
import type { FormApi } from 'final-form';
import { DateTime } from 'luxon';
import { useImperativeHandle, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import AddFoodModal from '../AddFoodModal/AddFoodModal';
import FoodEventCard from '../FoodEventCard/FoodEventCard';
import css from './EditMenuPricingForm.module.scss';

export type TEditMenuPricingFormValues = {
  foodsByDate: any;
  checkAll: string[];
  rowCheckbox: string[];
};

type TExtraProps = {
  currentMenu: TIntergrationListing;
  formRef: any;
};
type TEditMenuPricingFormComponentProps =
  FormRenderProps<TEditMenuPricingFormValues> & Partial<TExtraProps>;
type TEditMenuPricingFormProps = FormProps<TEditMenuPricingFormValues> &
  TExtraProps;

const renderResourcesForCalendar = (
  foodsByDate: any,
  extraData: {
    onRemovePickedFood: (id: string, date: Date) => void;
    daysOfWeek: string[];
  },
) => {
  const resourses: {
    resource: { title: any; sideDishes: string[]; id: any };
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
    const dateAsTimeStaimp = date.getTime();
    const pickedFoodsOnDate = { ...values.foodsByDate[dateAsTimeStaimp] };
    Object.keys(pickedFoodsOnDate).forEach((keyId: string) => {
      if (removeId === keyId) {
        delete pickedFoodsOnDate[removeId];
        form.change('foodsByDate', {
          ...values.foodsByDate,
          [dateAsTimeStaimp]: {
            ...pickedFoodsOnDate,
          },
        });
      }
    });
  };

  const { daysOfWeek } = INTERGRATION_LISTING(currentMenu).getPublicData();

  const resourcesForCalendar = renderResourcesForCalendar(
    values.foodsByDate || {},
    { onRemovePickedFood, daysOfWeek },
  );

  const onSetCurrentDate = (params: any) => () => {
    const { date, events } = params;
    const dateAsTimeStaimp = new Date(date).getTime();
    setCurrentDate(dateAsTimeStaimp);
    const currentDayEvents = events.filter(
      (e: any) => new Date(e.start).getTime() === new Date(date).getTime(),
    );
    const listIds = currentDayEvents.map((e: any) => e.resource.id);
    form.change('rowCheckbox', listIds);
  };

  const onCloseModal = () => {
    setCurrentDate(null);
  };

  const calendarContentStart = (params: any) => {
    return (
      <InlineTextButton
        onClick={onSetCurrentDate(params)}
        className={css.addButton}>
        <div className={css.iconAdd}>
          <IconAdd />
        </div>
        <FormattedMessage id="EditMenuPricingForm.addFoodButton" />
      </InlineTextButton>
    );
  };

  const calendarContentEnd = ({ events = [] }) => {
    const noFood = events.length === 0;
    return noFood ? <div className={css.noFood}>Chưa có món ăn</div> : <></>;
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <CalendarDashboard
          renderEvent={FoodEventCard}
          events={resourcesForCalendar}
          components={{
            contentStart: calendarContentStart,
            contentEnd: calendarContentEnd,
          }}
        />
      </Form>
      <AddFoodModal
        isOpen={!!currentDate}
        handleClose={onCloseModal}
        currentMenu={currentMenu as TIntergrationListing}
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
