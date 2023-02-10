import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import Form from '@components/Form/Form';
import { IntegrationListing } from '@utils/data';
import { parseTimestampToFormat } from '@utils/dates';
import { EMenuTypes, getLabelByKey, MENU_OPTIONS } from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';
import { DateTime } from 'luxon';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import DayOfWeekCalendarHeader from '../DayOfWeekCalendarHeader/DayOfWeekCalendarHeader';
import useQueryMenuPickedFoods from '../EditPartnerMenuWizard/useQueryMenuPickedFoods';
import type { TEditMenuPricingCalendarResources } from '../EditPartnerMenuWizard/utils';
import {
  createInitialValuesForFoodsByDate,
  renderValuesForFoodsByDate,
} from '../EditPartnerMenuWizard/utils';
import FoodEventCard from '../FoodEventCard/FoodEventCard';
import css from './EditMenuCompleteForm.module.scss';

export type TEditMenuCompleteFormValues = {};

type TExtraProps = {
  currentMenu?: TIntegrationListing | null;
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
  const { title } = IntegrationListing(currentMenu).getAttributes();
  const { menuType } = IntegrationListing(currentMenu).getMetadata();
  const { startDate, endDate } =
    IntegrationListing(currentMenu).getPublicData();

  const {
    monFoodIdList = [],
    tueFoodIdList = [],
    wedFoodIdList = [],
    thuFoodIdList = [],
    friFoodIdList = [],
    satFoodIdList = [],
    sunFoodIdList = [],
  } = IntegrationListing(currentMenu).getMetadata();

  const getFoodsByDateIds = () => {
    return [
      ...monFoodIdList,
      ...tueFoodIdList,
      ...wedFoodIdList,
      ...thuFoodIdList,
      ...friFoodIdList,
      ...satFoodIdList,
      ...sunFoodIdList,
    ];
  };

  const { menuPickedFoods } = useQueryMenuPickedFoods({
    restaurantId: restaurantId as string,
    ids: getFoodsByDateIds(),
  });

  const initialFoodsByDate = createInitialValuesForFoodsByDate({
    monFoodIdList,
    tueFoodIdList,
    wedFoodIdList,
    thuFoodIdList,
    friFoodIdList,
    satFoodIdList,
    sunFoodIdList,
  });

  const foodsByDateToRender = renderValuesForFoodsByDate(
    initialFoodsByDate,
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
                  parseTimestampToFormat(startDate, 'EEE, dd MMMM, yyyy')}
              </div>
            </div>
            {!isFixedMenu && (
              <div className={css.titleGroup}>
                <label className={css.label}>
                  <FormattedMessage id="EditMenuCompleteForm.menuType" />
                </label>
                <div>
                  {endDate &&
                    parseTimestampToFormat(endDate, 'EEE, dd MMMM, yyyy')}
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
            headerComponent={(params) => (
              <DayOfWeekCalendarHeader {...params} />
            )}
            renderEvent={FoodEventCard}
            events={resourcesForCalendar}
            components={{
              toolbar: () => <></>,
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
