/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import type { FormApi } from 'final-form';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import Modal from '@components/Modal/Modal';
import Pagination from '@components/Pagination/Pagination';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import KeywordSearchForm from '@src/pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { FOOD_SIDE_DISH_OPTIONS, getLabelByKey } from '@src/utils/options';
import { IntegrationListing } from '@utils/data';
import type {
  TIntegrationListing,
  TObject,
  TTableSortValue,
} from '@utils/types';
import { parsePrice } from '@utils/validators';

import useQueryMenuPickedFoods from '../EditPartnerMenuWizard/useQueryMenuPickedFoods';
import FieldPickedFood from '../FieldPickedFood/FieldPickedFood';

import css from './AddFoodModal.module.scss';

type TAddFoodModal = {
  isOpen: boolean;
  handleClose: () => void;
  currentMenu: TIntegrationListing;
  values: any;
  form: FormApi;
  currentDate?: number | null;
  isReadOnly?: boolean;
};

const FOOD_TABLE_COLUMNS: TColumn[] = [
  {
    key: 'title',
    label: 'Tên món',
    render: (data: any, isChecked: boolean) => {
      return (
        <div className={css.titleRowWrapper}>
          <div className={css.titleRow}>{data.title}</div>
          {data.sideDishes.map((item: string) => (
            <FieldCheckbox
              className={css.sideDishiesCheckbox}
              checkboxWrapperClassName={css.sideDishiesIconCheckboxWrapper}
              key={item}
              name={`${data.id}.sideDishes`}
              id={`${data.id}.${item}`}
              value={item}
              disabled={!isChecked}
              label={getLabelByKey(FOOD_SIDE_DISH_OPTIONS, item)}
            />
          ))}
        </div>
      );
    },
    sortable: true,
  },
  {
    key: 'price',
    label: 'Đơn giá',
    render: (data: any) => {
      return (
        <span className={css.priceRow}>{parsePrice(data.price.amount)}đ</span>
      );
    },
  },
];

const parseEntitiesToTableData = (foods: TIntegrationListing[]) => {
  return foods.map((food) => {
    return {
      key: food.id.uuid,
      data: {
        title: food.attributes.title,
        id: food.id.uuid,
        price: food.attributes.price,
        sideDishes: food.attributes.publicData?.sideDishes || [],
      },
    };
  });
};

const renderPickedFoods = (ids: string[], foods: TIntegrationListing[]) => {
  return ids.map((id) => {
    return foods.find((l) => l.id.uuid === id);
  });
};

const sortFoods = ({ columnName, type }: TTableSortValue, data: any) => {
  const isAsc = type === 'asc';

  // eslint-disable-next-line array-callback-return
  return data.sort((a: any, b: any) => {
    if (typeof a.data[columnName] === 'number') {
      const differenceOf = b.data[columnName] - a.data[columnName];

      return isAsc ? differenceOf : -differenceOf;
    }
    if (typeof a.data[columnName] === 'string') {
      if (a.data[columnName] < b.data[columnName]) {
        return isAsc ? -1 : 1;
      }
      if (a.data[columnName] > b.data[columnName]) {
        return isAsc ? 1 : -1;
      }

      return 0;
    }
  });
};

const AddFoodModal: React.FC<TAddFoodModal> = (props) => {
  const {
    isOpen,
    handleClose,
    currentMenu,
    values,
    form,
    currentDate,
    isReadOnly,
  } = props;
  if (isReadOnly) return null;
  const dispatch = useAppDispatch();
  const [page, setPage] = useState<number>(1);
  const [keywords, setKeywords] = useState<string>('');
  const [sortValue, setSortValue] = useState<TTableSortValue>();
  const foods = useAppSelector((state) => state.foods.foods, shallowEqual);
  const handleSort = (columnName: string) => {
    setSortValue({
      columnName,
      type: sortValue?.type === 'asc' ? 'desc' : 'asc',
    });
  };
  const queryFoodsInProgress = useAppSelector(
    (state) => state.foods.queryFoodsInProgress,
    shallowEqual,
  );

  const pagination = useAppSelector(
    (state) => state.foods.managePartnerFoodPagination,
    shallowEqual,
  );

  const tableData = parseEntitiesToTableData(foods);

  const sortedData = sortValue ? sortFoods(sortValue, tableData) : tableData;

  const router = useRouter();
  const { restaurantId } = router.query;

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (restaurantId && currentMenu && isOpen) {
      const { menuType } = IntegrationListing(currentMenu).getMetadata();
      dispatch(
        foodSliceThunks.queryPartnerFoods({
          restaurantId,
          page,
          pub_menuType: menuType,
          keywords,
          meta_isFoodEnable: true,
        }),
      );
    }
  }, [currentMenu, dispatch, isOpen, page, restaurantId, keywords]);

  const idsToQuery = values?.rowCheckbox || [];

  const { menuPickedFoods, queryMenuPickedFoodsInProgress } =
    useQueryMenuPickedFoods({
      restaurantId: restaurantId as string,
      ids: idsToQuery,
    });

  const handleCloseModal = () => {
    tableData.forEach((item: any) => {
      form.change(`${item.data.id}`, null);
    });
    handleClose();
  };

  const savePickedFoods = () => {
    const { rowCheckbox = [], foodsByDate = {} } = values;

    const newFoodsByDate: TObject = {};

    if (!currentDate || !form) return;

    if (!newFoodsByDate[currentDate]) {
      newFoodsByDate[currentDate] = {};
    }

    rowCheckbox.forEach((key: string) => {
      const food = menuPickedFoods.find(
        (item: TIntegrationListing) => item?.id?.uuid === key,
      );
      const title = food?.attributes?.title;
      const priceAmount = food?.attributes?.price?.amount || 0;

      const nutritionsList = food?.attributes?.publicData?.specialDiets || [];

      Object.keys(newFoodsByDate).forEach((foodId) => {
        if (!rowCheckbox.includes(foodId)) {
          delete newFoodsByDate[currentDate][foodId];
        }
      });

      const sideDishes = values[key]?.sideDishes || [];
      const foodNote = values[key]?.foodNote || '';
      newFoodsByDate[currentDate] = {
        ...newFoodsByDate[currentDate],
        [key]: {
          id: key,
          title,
          sideDishes,
          price: priceAmount,
          foodNote,
          nutritionsList,
        },
      };
    });
    form.change('foodsByDate', { ...foodsByDate, ...newFoodsByDate });
    form.change('rowCheckbox', []);
    form.change('checkAll', []);
    handleCloseModal();
  };

  const onRemovePickedFood = (id: string) => () => {
    const { rowCheckbox = [] } = values;
    const newRowCheckedBox = rowCheckbox.filter((i: string) => i !== id);
    form.change('rowCheckbox', newRowCheckedBox);
    form.change('checkAll', []);
  };

  const afterCheckboxChangeHandler = (e: any, rowCheckbox: string[]) => {
    const { name, checked, value } = e.target;
    const food = sortedData.find((item: any) => item?.key === value);
    if (!form) return;
    if (checked) {
      if (name === 'checkAll') {
        return sortedData.forEach((food: any) => {
          const sideDishes = food?.data?.sideDishes || [];

          return form.change(`${food?.data?.id}.sideDishes`, sideDishes);
        });
      }
      const sideDishes = food?.data?.sideDishes || [];

      return form.change(`${value}.sideDishes`, sideDishes);
    }

    if (name === 'rowCheckbox') {
      form.change(value, null);
    }

    if (name === 'checkAll') {
      rowCheckbox.forEach((item) => {
        form.change(item, null);
      });
    }
  };

  const onSubmitSearchForm = ({ keywords = '' }) => {
    setKeywords(keywords);
    setPage(1);
  };

  const foodsByDate = renderPickedFoods(
    values.rowCheckbox || [],
    menuPickedFoods,
  );

  return (
    <Modal
      contentClassName={css.modalContent}
      containerClassName={css.modal}
      isOpen={isOpen}
      title={<FormattedMessage id="AddFoodModal.title" />}
      handleClose={handleCloseModal}>
      <p className={css.description}>
        <FormattedMessage id="AddFoodModal.description" />
      </p>
      <KeywordSearchForm
        onSubmit={onSubmitSearchForm}
        className={css.keywordForm}
      />
      {queryFoodsInProgress ? (
        <LoadingContainer />
      ) : (
        <div className={css.foodPickContainer}>
          {tableData.length > 0 ? (
            <div className={css.tableContainer}>
              <Table
                tableHeadRowClassName={css.tableHeadRow}
                columns={FOOD_TABLE_COLUMNS}
                data={sortedData}
                hasCheckbox
                values={values}
                form={form as FormApi}
                tableHeadCellClassName={css.tableHeadCell}
                tableBodyCellClassName={css.tableBodyCell}
                afterCheckboxChangeHandler={afterCheckboxChangeHandler}
                tableWrapperClassName={css.tableWrapper}
                tableClassName={css.table}
                handleSort={handleSort}
              />
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  className={css.pagination}
                  total={pagination.totalItems}
                  pageSize={pagination.perPage}
                  current={pagination.page}
                  onChange={onPageChange}
                />
              )}
            </div>
          ) : (
            <div className={css.tableContainer}>Không có kết quả trả về</div>
          )}

          <div className={css.pickedFoodContainer}>
            <div className={css.title}>Món đã chọn</div>
            <div className={css.pickedFoodWrapper}>
              <div className={css.listChoosenFoods}>
                {queryMenuPickedFoodsInProgress ? (
                  <LoadingContainer className={css.loadingContainer} />
                ) : foodsByDate.length > 0 ? (
                  foodsByDate.map((f) => {
                    return (
                      <FieldPickedFood
                        id={f?.id?.uuid}
                        title={f?.attributes.title}
                        key={f?.id?.uuid}
                        price={f?.attributes?.price?.amount}
                        onRemovePickedFood={onRemovePickedFood}
                      />
                    );
                  })
                ) : (
                  <p>Bạn chưa chọn món nào</p>
                )}
              </div>
              <div className={css.modalButton}>
                <div className={css.buttonWrapper}>
                  <Button
                    type="button"
                    onClick={savePickedFoods}
                    className={css.button}>
                    <FormattedMessage id="AddFoodModal.modalButton" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddFoodModal;
