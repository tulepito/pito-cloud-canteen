import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { customPristine } from '@helpers/form';
import { useAppSelector } from '@hooks/reduxHooks';
import NutritionField from '@pages/admin/order/create/components/NutritionField/NutritionField';
import { Listing } from '@utils/data';
import { useMemo, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './NutritionForm.module.scss';

export type TNutritionFormValues = {
  favoriteRestaurantList: string[];
  favoriteFoodList: string[];
  nutritions: string[];
};

type TExtraProps = { isPersonal: boolean };
type TNutritionFormComponentProps = FormRenderProps<TNutritionFormValues> &
  Partial<TExtraProps>;
type TNutritionFormProps = FormProps<TNutritionFormValues> & TExtraProps;

const setRestaurantCategoryNames = (intl: any, categories: string[] = []) => {
  return categories
    .map((category) =>
      intl.formatMessage({ id: `Restaurant.category.${category}` }),
    )
    .join(', ');
};
const NutritionFormComponent: React.FC<TNutritionFormComponentProps> = (
  props,
) => {
  const { handleSubmit, form, values, isPersonal, initialValues } = props;
  const intl = useIntl();
  const [removedFavoriteRestaurantIds, setRemovedFavoriteRestaurantIds] =
    useState<string[]>([]);

  const [removedFavoriteFoodIds, setRemovedFavoriteFoodIds] = useState<
    string[]
  >([]);

  const favoriteRestaurants = useAppSelector(
    (state) => state.company.favoriteRestaurants,
    shallowEqual,
  );
  const favoriteFood = useAppSelector(
    (state) => state.company.favoriteFood,
    shallowEqual,
  );
  const personalFavoriteRestaurants = useAppSelector(
    (state) => state.user.favoriteRestaurants,
    shallowEqual,
  );
  const personalFavoriteFood = useAppSelector(
    (state) => state.user.favoriteFood,
    shallowEqual,
  );

  const updateCompanyAccountInProgress = useAppSelector(
    (state) => state.company.updateCompanyInProgress,
  );
  const favoriteRestaurantTableData = useMemo<TRowData[]>(
    () =>
      (isPersonal ? personalFavoriteRestaurants : favoriteRestaurants).reduce(
        (result, restaurant) => {
          return removedFavoriteRestaurantIds.includes(
            Listing(restaurant).getId(),
          )
            ? result
            : [
                ...result,
                {
                  key: Listing(restaurant).getId(),
                  data: {
                    id: Listing(restaurant).getId(),
                    title: Listing(restaurant).getAttributes()?.title,
                    category: setRestaurantCategoryNames(
                      intl,
                      Listing(restaurant).getPublicData()?.categories,
                    ),
                  },
                },
              ];
        },
        [],
      ),
    [
      favoriteRestaurants,
      intl,
      isPersonal,
      personalFavoriteRestaurants,
      removedFavoriteRestaurantIds,
    ],
  );
  const favoriteFoodTableData = useMemo<TRowData[]>(
    () =>
      (isPersonal ? personalFavoriteFood : favoriteFood).reduce(
        (result, food) => {
          return removedFavoriteFoodIds.includes(Listing(food).getId())
            ? result
            : [
                ...result,
                {
                  key: Listing(food).getId(),
                  data: {
                    id: Listing(food).getId(),
                    title: Listing(food).getAttributes()?.title,
                  },
                },
              ];
        },
        [],
      ),
    [favoriteFood, isPersonal, personalFavoriteFood, removedFavoriteFoodIds],
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

  const favoriteRestaurantColumns: TColumn[] = [
    {
      key: 'restaurantName',
      label: 'TÊN NHÀ HÀNG',
      render: ({ title }: any) => {
        return (
          <span title={title} className={css.boldText}>
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
        return (
          <span title={title} className={css.boldText}>
            {title}
          </span>
        );
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
    <Form className={css.container} onSubmit={handleSubmit}>
      <div className={css.fieldSection}>
        <NutritionField
          title={intl.formatMessage({ id: 'NutritionForm.nutrition.title' })}
        />
      </div>
      <div className={css.fieldSection}>
        <div className={css.fieldLabel}>
          {intl.formatMessage({ id: 'NutritionForm.favoriteRestaurant.title' })}
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
          {intl.formatMessage({ id: 'NutritionForm.favoriteFood.title' })}
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
      <div className={css.submitChangeBtn}>
        <Button
          type="submit"
          disabled={submitDisabled}
          inProgress={updateCompanyAccountInProgress}>
          {intl.formatMessage({ id: 'NutritionForm.submit' })}
        </Button>
      </div>
    </Form>
  );
};

const NutritionForm: React.FC<TNutritionFormProps> = (props) => {
  return <FinalForm {...props} component={NutritionFormComponent} />;
};

export default NutritionForm;
