/* eslint-disable @typescript-eslint/no-shadow */
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
import { getArrayByUuid, INTERGRATION_LISTING } from '@utils/data';
import { EDayOfWeek, getLabelByKey, SIDE_DISH_OPTIONS } from '@utils/enums';
import type { TIntergrationListing } from '@utils/types';
import { parsePrice } from '@utils/validators';
import type { FormApi } from 'final-form';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import FieldPickedFood from '../FieldPickedFood/FieldPickedFood';
import css from './AddFoodModal.module.scss';

type TAddFoodModal = {
  isOpen: boolean;
  handleClose: () => void;
  currentMenu: TIntergrationListing;
  values: any;
  form: FormApi;
  currentDate?: number | null;
};

const FOOD_TABLE_COLUMNS: TColumn[] = [
  {
    key: 'title',
    label: 'Tên món',
    render: (data: any, isChecked: boolean) => {
      return (
        <div>
          <div>{data.title}</div>
          {data.sideDishes.map((item: string) => (
            <FieldCheckbox
              key={item}
              name={`${data.id}.sideDishes`}
              id={`${data.id}.${item}`}
              value={item}
              disabled={!isChecked}
              label={getLabelByKey(SIDE_DISH_OPTIONS, item)}
            />
          ))}
        </div>
      );
    },
  },
  {
    key: 'price',
    label: 'Đơn giá',
    render: (data: any) => {
      return <span>{parsePrice(data.price.amount)}đ</span>;
    },
  },
];

const parseEntitiesToTableData = (foods: TIntergrationListing[]) => {
  return foods.map((food) => {
    return {
      key: food.id.uuid,
      data: {
        title: food.attributes.title,
        id: food.id.uuid,
        price: food.attributes.price,
        sideDishes: food.attributes.publicData.sideDishes,
      },
    };
  });
};

const renderPickedFoods = (ids: string[], foods: Record<any, any>[]) => {
  return ids.map((id) => {
    return foods.find((l) => l.id === id);
  });
};

const AddFoodModal: React.FC<TAddFoodModal> = (props) => {
  const { isOpen, handleClose, currentMenu, values, form, currentDate } = props;
  const dispatch = useAppDispatch();
  const [page, setPage] = useState<number>(1);
  const [keywords, setKeywords] = useState<string>('');
  const foods = useAppSelector((state) => state.foods.foods, shallowEqual);
  const queryFoodsInProgress = useAppSelector(
    (state) => state.foods.queryFoodsInProgress,
    shallowEqual,
  );
  const [tempFoodTitles, setTempFoodTitles] = useState<any[]>([]);
  const pagination = useAppSelector(
    (state) => state.foods.managePartnerFoodPagination,
    shallowEqual,
  );

  const tableData = parseEntitiesToTableData(foods);
  const router = useRouter();
  const { restaurantId } = router.query;

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (restaurantId && currentMenu && isOpen) {
      const { menuType } = INTERGRATION_LISTING(currentMenu).getMetadata();
      dispatch(
        foodSliceThunks.queryPartnerFoods({
          restaurantId,
          page,
          pub_menuType: menuType,
          keywords,
        }),
      );
    }
  }, [currentMenu, dispatch, isOpen, page, restaurantId, keywords]);

  useEffect(() => {
    const tempFoods = foods.map((f: TIntergrationListing) => ({
      id: f.id.uuid,
      title: f.attributes.title,
      price: f.attributes.price.amount,
    }));
    const newTempFoods = getArrayByUuid([
      ...tempFoodTitles,
      ...tempFoods,
    ]) as any;
    setTempFoodTitles(newTempFoods);
  }, [JSON.stringify(foods)]);

  const foodsByDate = renderPickedFoods(
    values.rowCheckbox || [],
    tempFoodTitles,
  );

  const savePickedFoods = () => {
    const { rowCheckbox = [], foodsByDate = {} } = values;
    const newPickedFoods = { ...foodsByDate };
    if (!currentDate || !form) return;
    const dayOfWeekIndex = new Date(currentDate).getDay();
    const dayOfWeek = Object.keys(EDayOfWeek).find(
      (_d, index) => index === dayOfWeekIndex,
    );
    rowCheckbox.forEach((key: string) => {
      const { title = '', id = '' } =
        tempFoodTitles.find((item) => item.id === key) || {};
      newPickedFoods[currentDate] = {
        ...newPickedFoods[currentDate],
        [key]: values[key]
          ? {
              ...values[key],
              id,
              title,
              dayOfWeek,
            }
          : {
              id,
              title,
              dayOfWeek,
            },
      };
    });
    form.change('foodsByDate', newPickedFoods);
    form.change('rowCheckbox', []);
    form.change('checkAll', []);
    handleClose();
  };

  const onRemovePickedFood = (id: string) => () => {
    const { rowCheckbox = [] } = values;
    const newRowCheckedBox = rowCheckbox.filter((i: string) => i !== id);
    form.change('rowCheckbox', newRowCheckedBox);
    form.change('checkAll', []);
  };

  const afterCheckboxChangeHandler = (e: any, rowCheckbox: string[]) => {
    const { name, checked, value } = e.target;
    if (checked || !form) return;

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
  };

  return (
    <Modal
      containerClassName={css.modal}
      isOpen={isOpen}
      handleClose={handleClose}>
      <h2 className={css.title}>
        <FormattedMessage id="AddFoodModal.title" />
      </h2>
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
          <div className={css.tableContainer}>
            <Table
              columns={FOOD_TABLE_COLUMNS}
              data={tableData}
              hasCheckbox
              values={values}
              form={form as FormApi}
              tableHeadCellClassName={css.tableHeadCell}
              tableBodyCellClassName={css.tableBodyCell}
              afterCheckboxChangeHandler={afterCheckboxChangeHandler}
            />
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                total={pagination.totalItems}
                pageSize={pagination.perPage}
                current={pagination.page}
                onChange={onPageChange}
              />
            )}
          </div>
          <div className={css.pickedFoodContainer}>
            <div className={css.title}>Món đã chọn</div>
            <div className={css.foodsByDate}>
              {foodsByDate.map((f) => {
                return (
                  <FieldPickedFood
                    id={f?.id}
                    title={f?.title}
                    key={f?.id}
                    price={f?.price}
                    onRemovePickedFood={onRemovePickedFood}
                  />
                );
              })}
            </div>
            <div className={css.modalButton}>
              <Button
                type="button"
                onClick={savePickedFoods}
                className={css.button}>
                <FormattedMessage id="AddFoodModal.modalButton" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddFoodModal;
