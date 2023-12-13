import { useMemo, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { customPristine } from '@helpers/form';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import MealTypeField from '@pages/admin/order/components/MealTypeField/MealTypeField';
import NutritionField from '@pages/admin/order/components/NutritionField/NutritionField';
import { FOOD_CATEGORY_OPTIONS } from '@src/utils/options';
import { Listing, User } from '@utils/data';
import type { TUser } from '@utils/types';

import { NutritionThunks } from '../../Nutrition.slice';
import RestaurantModal from '../RestaurantModal/RestaurantModal';

import css from './NutritionForm.module.scss';

export type TNutritionFormValues = {
  favoriteRestaurantList: string[];
  favoriteFoodList: string[];
  nutritions: string[];
  mealType: string[];
};

type TExtraProps = {
  nutritionsOptions: { key: string; label: string }[];
  mealTypeOptions: { key: string; label: string }[];
};
type TNutritionFormComponentProps = FormRenderProps<TNutritionFormValues> &
  Partial<TExtraProps> & { showFavoriteRestaurantAndFood?: boolean };
type TNutritionFormProps = FormProps<TNutritionFormValues> & TExtraProps;

const NutritionFormComponent: React.FC<TNutritionFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    form,
    values,
    initialValues,
    nutritionsOptions,
    showFavoriteRestaurantAndFood,
    mealTypeOptions,
  } = props;

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [removedFavoriteRestaurantIds, setRemovedFavoriteRestaurantIds] =
    useState<string[]>([]);

  const [removedFavoriteFoodIds, setRemovedFavoriteFoodIds] = useState<
    string[]
  >([]);

  const restaurantModalControl = useBoolean();

  const favoriteRestaurants = useAppSelector(
    (state) => state.company.favoriteRestaurants,
    shallowEqual,
  );
  const favoriteFood = useAppSelector(
    (state) => state.company.favoriteFood,
    shallowEqual,
  );

  const updateCompanyAccountInProgress = useAppSelector(
    (state) => state.company.updateCompanyInProgress,
  );
  const selectedRestaurant = useAppSelector(
    (state) => state.Nutrition.selectedRestaurant,
    shallowEqual,
  );
  const restaurantFoodList = useAppSelector(
    (state) => state.Nutrition.restaurantFoodList,
    shallowEqual,
  );

  const companyAccount = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );

  const companyGeoOrigin = useMemo(
    () => ({
      ...User(companyAccount as TUser).getPublicData().location?.origin,
    }),
    [companyAccount],
  );
  const favoriteRestaurantTableData = useMemo<TRowData[]>(
    () =>
      favoriteRestaurants.reduce((result, restaurant) => {
        const restaurantListing = Listing(restaurant);
        const restaurantId = restaurantListing.getId();
        if (removedFavoriteRestaurantIds.includes(restaurantId)) {
          return result;
        }
        const categoryValue = restaurantListing
          .getPublicData()
          ?.categories?.slice(0, 3)
          .map(
            (category: string) =>
              FOOD_CATEGORY_OPTIONS.find((item) => item.key === category)
                ?.label,
          )
          .join(', ');

        return [
          ...result,
          {
            key: restaurantId,
            data: {
              id: restaurantId,
              title: restaurantListing.getAttributes().title,
              category: categoryValue,
            },
          },
        ];
      }, []),
    [favoriteRestaurants, removedFavoriteRestaurantIds],
  );
  const favoriteFoodTableData = useMemo<TRowData[]>(
    () =>
      favoriteFood.reduce((result, food) => {
        const foodListing = Listing(food);
        const foodId = foodListing.getId();
        if (removedFavoriteFoodIds.includes(foodId)) {
          return result;
        }

        return [
          ...result,
          {
            key: foodId,
            data: {
              id: foodId,
              title: foodListing.getAttributes().title,
            },
          },
        ];
      }, []),
    [favoriteFood, removedFavoriteFoodIds],
  );
  const formPristine = customPristine(initialValues, values);
  const submitDisabled = formPristine || updateCompanyAccountInProgress;

  const handleRemoveRestaurant = (restaurantId: string) => () => {
    const { favoriteRestaurantList: oldFavoriteRestaurantList = [] } = values;
    const newFavoriteRestaurantList = oldFavoriteRestaurantList.filter(
      (_restaurantId) => _restaurantId !== restaurantId,
    );
    setRemovedFavoriteRestaurantIds([
      ...removedFavoriteRestaurantIds,
      restaurantId,
    ]);
    form.change('favoriteRestaurantList', newFavoriteRestaurantList);
  };

  const handleRemoveFood = (foodId: string) => () => {
    const { favoriteFoodList: oldFavoriteFoodList = [] } = values;
    const newFavoriteFoodList = oldFavoriteFoodList.filter(
      (_foodId) => _foodId !== foodId,
    );
    setRemovedFavoriteFoodIds([...removedFavoriteFoodIds, foodId]);
    form.change('favoriteFoodList', newFavoriteFoodList);
  };

  const handleOpenRestaurantModal = (restaurantId: string) => () => {
    restaurantModalControl.setTrue();
    if (restaurantId !== selectedRestaurant?.id.uuid) {
      dispatch(NutritionThunks.fetchSelectedRestaurant(restaurantId));
      dispatch(NutritionThunks.fetchFoodFromRestaurant(restaurantId));
    }
  };

  const onSearchFoodNameInRestaurant = (
    keywords: string,
    restaurantId: string,
  ) => {
    dispatch(
      NutritionThunks.searchFoodInRestaurant({ restaurantId, keywords }),
    );
  };
  const favoriteRestaurantColumns: TColumn[] = [
    {
      key: 'restaurantName',
      label: 'TÊN NHÀ HÀNG',
      render: ({ title, id }: any) => {
        return (
          <span
            onClick={handleOpenRestaurantModal(id)}
            title={title}
            className={css.restaurantName}>
            {title}
          </span>
        );
      },
    },
    {
      key: 'category',
      label: 'ẨM THỰC',
      render: ({ category }: any) => {
        return <span title={category}>{category}</span>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: ({ id }: any) => {
        return (
          <IconDelete
            className={css.deleteIcon}
            onClick={handleRemoveRestaurant(id)}
          />
        );
      },
    },
  ];
  const favoriteFoodColumns: TColumn[] = [
    {
      key: 'foodName',
      label: 'TÊN MÓN ĂN',
      render: ({ title }: any) => {
        return <span title={title}>{title}</span>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: ({ id }: any) => {
        return (
          <IconDelete
            className={css.deleteIcon}
            onClick={handleRemoveFood(id)}
          />
        );
      },
    },
  ];

  return (
    <>
      <Form className={css.container} onSubmit={handleSubmit}>
        <div className={css.fieldsContainer}>
          <div className={css.fieldSection}>
            <MealTypeField
              title={intl.formatMessage({
                id: 'MealTypeField.title',
              })}
              titleClassName={css.customTitle}
              fieldClassName={css.customField}
              options={mealTypeOptions}
            />
          </div>
          <div className={css.fieldSection}>
            <NutritionField
              title={intl.formatMessage({
                id: 'NutritionForm.nutrition.title',
              })}
              titleClassName={css.customTitle}
              fieldClassName={css.customField}
              options={nutritionsOptions}
            />
          </div>
          {showFavoriteRestaurantAndFood && (
            <>
              <div className={css.fieldSection}>
                <div className={css.fieldLabel}>
                  {intl.formatMessage({
                    id: 'NutritionForm.favoriteRestaurant.title',
                  })}
                </div>
                <Table
                  columns={favoriteRestaurantColumns}
                  data={favoriteRestaurantTableData}
                  tableClassName={css.tableRoot}
                  tableHeadClassName={css.tableHead}
                  tableHeadCellClassName={css.tableHeadCell}
                  tableBodyClassName={css.tableBody}
                  tableBodyRowClassName={css.tableBodyRow}
                  tableBodyCellClassName={css.tableBodyCell}
                />
              </div>
              <div className={css.fieldSection}>
                <div className={css.fieldLabel}>
                  {intl.formatMessage({
                    id: 'NutritionForm.favoriteFood.title',
                  })}
                </div>
                <Table
                  columns={favoriteFoodColumns}
                  data={favoriteFoodTableData}
                  tableClassName={css.tableRoot}
                  tableHeadClassName={css.tableHead}
                  tableHeadCellClassName={css.tableHeadCell}
                  tableBodyClassName={css.tableBody}
                  tableBodyRowClassName={css.tableBodyRow}
                  tableBodyCellClassName={css.tableBodyCell}
                />
              </div>
            </>
          )}
        </div>
        <div className={css.submitChangeBtn}>
          <Button
            type="submit"
            disabled={submitDisabled}
            inProgress={updateCompanyAccountInProgress}>
            {intl.formatMessage({ id: 'NutritionForm.submit' })}
          </Button>
        </div>
      </Form>
      <RestaurantModal
        isOpen={restaurantModalControl.value}
        onClose={restaurantModalControl.setFalse}
        currentRestaurant={selectedRestaurant!}
        companyGeoOrigin={companyGeoOrigin}
        restaurantFoodList={restaurantFoodList}
        onSearchFoodName={onSearchFoodNameInRestaurant}
      />
    </>
  );
};

const NutritionForm: React.FC<TNutritionFormProps> = (props) => {
  return <FinalForm {...props} component={NutritionFormComponent} />;
};

export default NutritionForm;
