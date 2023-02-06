import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import Form from '@components/Form/Form';
import { INTERGRATION_LISTING } from '@utils/data';
import { parseTimestaimpToFormat } from '@utils/dates';
import { EMenuTypes, getLabelByKey, MENU_OPTIONS } from '@utils/enums';
import type { TIntergrationListing } from '@utils/types';
import { DateTime } from 'luxon';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import useQueryMenuPickedFoods from '../EditPartnerMenuWizard/useQueryMenuPickedFoods';
import type { TEditMenuPricingCalendarResources } from '../EditPartnerMenuWizard/utils';
import { renderInitialValuesForFoodsByDate } from '../EditPartnerMenuWizard/utils';
import FoodEventCard from '../FoodEventCard/FoodEventCard';
import css from './EditMenuCompleteForm.module.scss';

export type TEditMenuCompleteFormValues = {};

type TExtraProps = {
  currentMenu?: TIntergrationListing | null;
  formRef: any;
  restaurantId: string;
};
type TEditMenuCompleteFormComponentProps =
  FormRenderProps<TEditMenuCompleteFormValues> & Partial<TExtraProps>;
type TEditMenuCompleteFormProps = FormProps<TEditMenuCompleteFormValues> &
  TExtraProps;

const renderResourcesForCalendar = (foodsByDate: any) => {
  const resourses: {
    resource: TEditMenuPricingCalendarResources;
    start: Date;
    end: Date;
  }[] = [];

  if (!foodsByDate) return;
  Object.keys(foodsByDate).forEach((key) => {
    Object.keys(foodsByDate[key]).forEach((foodKey) => {
      resourses.push({
        resource: {
          id: foodsByDate[key][foodKey]?.id,
          title: foodsByDate[key][foodKey]?.title,
          hideRemoveButton: true,
          sideDishes: foodsByDate[key][foodKey]?.sideDishes || [],
        },
        start: DateTime.fromMillis(Number(key)).toJSDate(),
        end: DateTime.fromMillis(Number(key)).plus({ hour: 1 }).toJSDate(),
      });
    });
  });
  return resourses;
};

const EditMenuCompleteFormComponent: React.FC<
  TEditMenuCompleteFormComponentProps
> = (props) => {
  const { handleSubmit, currentMenu, formRef, form, restaurantId } = props;
  formRef.current = form;
  const { title } = INTERGRATION_LISTING(currentMenu).getAttributes();
  const { menuType } = INTERGRATION_LISTING(currentMenu).getMetadata();
  const {
    foodsByDate = {},
    startDate,
    endDate,
  } = INTERGRATION_LISTING(currentMenu).getPublicData();

  const getFoodsByDateIds = () => {
    const ids: string[] = [];
    Object.keys(foodsByDate).forEach((dKey) => {
      Object.keys(foodsByDate[dKey]).forEach((id) => {
        ids.push(id);
      });
    });
    return ids;
  };

  const { menuPickedFoods } = useQueryMenuPickedFoods({
    restaurantId: restaurantId as string,
    ids: getFoodsByDateIds(),
  });

  const foodsByDateToRender = renderInitialValuesForFoodsByDate(
    foodsByDate,
    menuPickedFoods,
  );

  const resourcesForCalendar = renderResourcesForCalendar(foodsByDateToRender);

  const isFixedMenu = menuType === EMenuTypes.fixedMenu;

  return (
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
              <div>{getLabelByKey(MENU_OPTIONS, menuType)}</div>
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
                  parseTimestaimpToFormat(startDate, 'EEE, dd MMMM, yyyy')}
              </div>
            </div>
            {!isFixedMenu && (
              <div className={css.titleGroup}>
                <label className={css.label}>
                  <FormattedMessage id="EditMenuCompleteForm.menuType" />
                </label>
                <div>
                  {endDate &&
                    parseTimestaimpToFormat(endDate, 'EEE, dd MMMM, yyyy')}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={css.devidedSection}>
          <h3 className={css.sectionTitle}>
            <FormattedMessage id="EditMenuCompleteForm.foodList" />
          </h3>
          <CalendarDashboard
            renderEvent={FoodEventCard}
            events={resourcesForCalendar}
            components={{
              contentEnd: ({ events = [] }) => {
                const noFood = events.length === 0;
                return noFood ? (
                  <div className={css.noFood}>Chưa có món ăn</div>
                ) : (
                  <></>
                );
              },
            }}
          />
        </div>
      </div>
    </Form>
  );
};

const EditMenuCompleteForm: React.FC<TEditMenuCompleteFormProps> = (props) => {
  return <FinalForm {...props} component={EditMenuCompleteFormComponent} />;
};

export default EditMenuCompleteForm;
