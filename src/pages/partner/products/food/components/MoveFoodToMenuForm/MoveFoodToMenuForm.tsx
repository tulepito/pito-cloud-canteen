import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { isEmpty, pick } from 'lodash';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import IconClock from '@components/Icons/IconClock/IconClock';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import type { TListing } from '@src/utils/types';

import {
  moveFoodToMenuSteps,
  STEP_REVIEW,
  STEP_SELECT_DAYS,
  STEP_SELECT_MENU,
} from '../../helpers/moveFoodToMenu';
import CalendarDayController from '../CalendarDayController/CalendarDayController';
import MenuDayInWeekField from '../MenuDayInWeekField/MenuDayInWeekField';
import MenuFoodList from '../MenuFoodList/MenuFoodList';

import css from './MoveFoodToMenuForm.module.scss';

export type TMoveFoodToMenuFormValues = {
  menuId: string;
  selectedDays: string[];
};

type TExtraProps = {
  menus: TListing[];
  setFormValues: (values: TMoveFoodToMenuFormValues) => void;
  currentStep?: string;
  setCurrentStep?: (step: string) => void;
  selectedFood: TListing;
  inProgress?: boolean;
  selectedMenu?: TListing;
  onRemoveNewFoodFromMenu?: (selectedDay: string) => void;
  handleCloseModal?: () => void;
};
type TMoveFoodToMenuFormComponentProps =
  FormRenderProps<TMoveFoodToMenuFormValues> & Partial<TExtraProps>;
type TMoveFoodToMenuFormProps = FormProps<TMoveFoodToMenuFormValues> &
  TExtraProps;

const MoveFoodToMenuFormComponent: React.FC<
  TMoveFoodToMenuFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    menus = [],
    values,
    form,
    setFormValues,
    currentStep = STEP_SELECT_MENU,
    setCurrentStep = () => {},
    selectedFood,
    inProgress,
    selectedMenu,
    onRemoveNewFoodFromMenu,
    handleCloseModal,
  } = props;

  const intl = useIntl();

  const [selectedMenuWeekDay, setSelectedMenuWeekDay] = useState<string>();

  const { menuId, selectedDays = [] } = values;
  const selectedMenuListing = selectedMenu && Listing(selectedMenu!);
  const {
    startDate: selectedMenuStartDate,
    endDate: selectedMenuEndDate,
    foodsByDate = {},
    mealType,
  } = selectedMenuListing ? selectedMenuListing.getPublicData() : ({} as any);
  const menuWeekDays = Object.keys(foodsByDate);
  const foodList = pick(foodsByDate, selectedDays!)[
    selectedMenuWeekDay || selectedDays[0]
  ];

  const submitText = intl.formatMessage({
    id: `MoveFoodToMenuForm.formStep.${currentStep}.submitText`,
  });
  const selectedFoodListing = Listing(selectedFood!) || {};
  const selectedFoodId = selectedFoodListing.getId();

  const filteredMenuAlreadyHasFood = menus.filter((menu) => {
    const menuListing = Listing(menu);
    const { foodsByDate: menuFoodByDate = {} } = menuListing.getPublicData();
    const menuFoodList = Object.values(menuFoodByDate).flat();

    return menuFoodList.some(
      (weekdayObj: any) => !isEmpty(weekdayObj) && !weekdayObj[selectedFoodId],
    );
  });

  const submitValid = () => {
    switch (currentStep) {
      case STEP_SELECT_MENU:
        return !menuId;
      case STEP_SELECT_DAYS:
        return !selectedDays.length;
      default:
        break;
    }
  };

  const onSubmitBtnClick = async () => {
    const currentStepIndex = moveFoodToMenuSteps.indexOf(currentStep);
    if (currentStepIndex === moveFoodToMenuSteps.length - 2) {
      await handleSubmit();
    }

    if (currentStepIndex === moveFoodToMenuSteps.length - 1) {
      handleCloseModal?.();
    }

    setCurrentStep(moveFoodToMenuSteps[currentStepIndex + 1]);
  };

  const handleFoodRemoveClick = () => {
    if (selectedMenuWeekDay) {
      onRemoveNewFoodFromMenu?.(selectedMenuWeekDay);
    }
  };

  useEffect(() => {
    setFormValues?.(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.formTitle}>
        {intl.formatMessage({
          id: `MoveFoodToMenuForm.formStep.${currentStep}.title`,
        })}
      </div>
      <RenderWhen condition={currentStep === STEP_SELECT_MENU}>
        {filteredMenuAlreadyHasFood.map((menu) => {
          const menuListing = Listing(menu);
          const { startDate, endDate } = menuListing.getPublicData();

          return (
            <div key={menu.id.uuid} className={css.fieldWrapper}>
              <FieldRadioButton
                id={`menuId-${menu.id.uuid}`}
                name="menuId"
                value={menu.id.uuid}
              />
              <div className={css.menuContent}>
                <div className={css.menuTitle}>{menu.attributes.title}</div>
                <div className={css.content}>
                  <IconClock className={css.iconClock} />
                  {`${formatTimestamp(startDate)} - ${formatTimestamp(
                    endDate,
                  )}`}
                </div>
              </div>
            </div>
          );
        })}
      </RenderWhen>

      <RenderWhen condition={currentStep === STEP_SELECT_DAYS}>
        <MenuDayInWeekField form={form} enableDays={menuWeekDays} />
      </RenderWhen>

      <RenderWhen condition={currentStep === STEP_REVIEW}>
        <CalendarDayController
          startDate={new Date(+selectedMenuStartDate) || new Date()}
          endDate={new Date(+selectedMenuEndDate) || new Date()}
          activeDayList={selectedDays}
          onDayClick={setSelectedMenuWeekDay}
        />
        <MenuFoodList
          menuDaySession={mealType || ''}
          foodList={foodList}
          containerClassName={css.menuFoodListContainer}
          handleFoodRemoveClick={handleFoodRemoveClick}
          selectedFoodId={selectedFoodId}
        />
      </RenderWhen>

      <Button
        type="button"
        className={css.submitBtn}
        disabled={submitValid() || inProgress}
        inProgress={inProgress}
        onClick={onSubmitBtnClick}>
        {submitText}
      </Button>
    </Form>
  );
};

const MoveFoodToMenuForm: React.FC<TMoveFoodToMenuFormProps> = (props) => {
  return <FinalForm {...props} component={MoveFoodToMenuFormComponent} />;
};

export default MoveFoodToMenuForm;
