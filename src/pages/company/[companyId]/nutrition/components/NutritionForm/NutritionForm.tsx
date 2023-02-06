import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { useAppSelector } from '@hooks/reduxHooks';
import NutritionField from '@pages/admin/order/create/components/NutritionField/NutritionField';
import { LISTING } from '@utils/data';
import { useMemo } from 'react';
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

type TExtraProps = {};
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
  const { handleSubmit, form, values } = props;
  const intl = useIntl();

  const favoriteRestaurants = useAppSelector(
    (state) => state.company.favoriteRestaurants,
    shallowEqual,
  );
  const favoriteFood = useAppSelector(
    (state) => state.company.favoriteFood,
    shallowEqual,
  );

  const favoriteRestaurantTableData = useMemo<TRowData[]>(
    () =>
      favoriteRestaurants.reduce(
        (result, restaurant) => [
          ...result,
          {
            key: LISTING(restaurant).getId(),
            data: {
              id: LISTING(restaurant).getId(),
              title: LISTING(restaurant).getAttributes()?.title,
              category: setRestaurantCategoryNames(
                intl,
                LISTING(restaurant).getPublicData()?.categories,
              ),
            },
          },
        ],
        [],
      ),
    [favoriteRestaurants, intl],
  );
  const favoriteFoodTableData = useMemo<TRowData[]>(
    () =>
      favoriteFood.reduce(
        (result, food) => [
          ...result,
          {
            key: LISTING(food).getId(),
            data: {
              id: LISTING(food).getId(),
              title: LISTING(food).getAttributes()?.title,
            },
          },
        ],
        [],
      ),
    [favoriteFood],
  );

  const handleRemoveRestaurant = (restaurantId: string) => () => {
    const { favoriteRestaurantList: oldFavoriteRestaurantList = [] } = values;
    const newFavoriteRestaurantList = oldFavoriteRestaurantList.filter(
      (_restaurantId) => _restaurantId !== restaurantId,
    );
    form.change('favoriteRestaurantList', newFavoriteRestaurantList);
  };

  const handleRemoveFood = (foodId: string) => () => {
    const { favoriteFoodList: oldFavoriteFoodList = [] } = values;
    const newFavoriteFoodList = oldFavoriteFoodList.filter(
      (_foodId) => _foodId !== foodId,
    );
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
        return <IconDelete onClick={handleRemoveRestaurant(id)} />;
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
        return <IconDelete onClick={handleRemoveFood(id)} />;
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
        <Button type="submit">
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
