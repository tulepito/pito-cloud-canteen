/* eslint-disable @typescript-eslint/no-shadow */
import Button, { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldMultipleSelect from '@components/FieldMutipleSelect/FieldMultipleSelect';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import IconDelete from '@components/IconDelete/IconDelete';
import IconEdit from '@components/IconEdit/IconEdit';
import IconDuplicate from '@components/Icons/IconDuplicate/IconDuplicate';
import IconPrint from '@components/Icons/IconPrint/IconPrint';
import IconUploadFile from '@components/Icons/IconUploadFile/IconUploadFile';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import AlertModal from '@components/Modal/AlertModal';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import { adminRoutes } from '@src/paths';
import { getTableDataForExport, makeCsv } from '@utils/csv';
import { parseTimestaimpToFormat } from '@utils/dates';
import {
  CATEGORY_OPTIONS,
  FOOD_TYPE_OPTIONS,
  getLabelByKey,
  MENU_OPTIONS,
} from '@utils/enums';
import type { TIntergrationFoodListing } from '@utils/types';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManagePartnerFoods.module.scss';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: 'ID',
    render: (data: any) => {
      if (data.isDeleted) {
        return <div className={css.deletedFood}>Deleted food</div>;
      }
      return (
        <div className={css.idRow} title={data.id}>
          {data.id}
        </div>
      );
    },
  },
  {
    key: 'title',
    label: 'Tên món',
    render: (data: any) => {
      if (data.isDeleted) {
        return <div></div>;
      }
      return <div title={data.title}>{data.title}</div>;
    },
  },
  {
    key: 'menuType',
    label: 'Loại menu',
    render: (data: any) => {
      if (data.isDeleted) {
        return <div></div>;
      }
      return <div className={css.descriptionRow}>{data.menuType}</div>;
    },
  },
  {
    key: 'foodType',
    label: 'Loại món',
    render: (data: any) => {
      if (data.isDeleted) {
        return <div></div>;
      }
      return <div className={css.descriptionRow}>{data.foodType}</div>;
    },
  },
  {
    key: 'category',
    label: 'Phong cách ẩm thực',
    render: (data: any) => {
      if (data.isDeleted) {
        return <div></div>;
      }
      return <div className={css.descriptionRow}>{data.category}</div>;
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => {
      if (data.isDeleted) {
        return <div></div>;
      }
      return (
        <div>
          <NamedLink
            path={`/admin/partner/${data.restaurantId}/settings/food/${data.id}`}
            className={css.actionBtn}>
            <IconEdit />
          </NamedLink>
          <NamedLink
            path={`/admin/partner/${data.restaurantId}/settings/food/create?duplicateId=${data.id}`}
            className={css.actionBtn}>
            <IconDuplicate />
          </NamedLink>
          <InlineTextButton
            type="button"
            onClick={data.onSetFoodToRemove(data)}
            className={css.actionBtn}>
            <IconDelete />
          </InlineTextButton>
        </div>
      );
    },
  },
];

const parseEntitiesToTableData = (
  foods: TIntergrationFoodListing[],
  extraData: any,
) => {
  return foods.map((food) => {
    return {
      key: food.id.uuid,
      data: {
        isDeleted: food.attributes.metadata.isDeleted,
        title: food.attributes.title,
        description: food.attributes.description,
        id: food.id.uuid,
        menuType: getLabelByKey(
          MENU_OPTIONS,
          food.attributes.publicData.menuType,
        ),
        category: getLabelByKey(
          CATEGORY_OPTIONS,
          food.attributes.publicData.category,
        ),
        foodType: getLabelByKey(
          FOOD_TYPE_OPTIONS,
          food.attributes.publicData.foodType,
        ),
        ...extraData,
      },
    };
  });
};

const parseEntitiesToExportCsv = (
  foods: TIntergrationFoodListing[],
  ids: string[],
) => {
  return foods
    .filter((food) => ids.includes(food.id.uuid))
    .map((food) => {
      return {
        title: food.attributes.title,
        description: food.attributes.description,
        id: food.id.uuid,
        menuType: getLabelByKey(
          MENU_OPTIONS,
          food.attributes.publicData.menuType,
        ),
        category: getLabelByKey(
          CATEGORY_OPTIONS,
          food.attributes.publicData.category,
        ),
        foodType: getLabelByKey(
          FOOD_TYPE_OPTIONS,
          food.attributes.publicData.foodType,
        ),
      };
    });
};

const ManagePartnerFoods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [idsToAction, setIdsToAction] = useState<string[]>([]);
  const [foodToRemove, setFoodToRemove] = useState<any>(null);

  const {
    value: removeCheckedModalOpen,
    setTrue: openRemoveCheckedModal,
    setFalse: closeRemoveCheckedModal,
  } = useBoolean(false);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { restaurantId, page = 1, keywords, pub_category = '' } = router.query;

  const { foods, queryFoodsInProgress, queryFoodsError, removeFoodInProgress } =
    useAppSelector((state) => state.foods, shallowEqual);

  const categoryString = pub_category as string;

  const groupPubCategory = categoryString
    ?.split(',')
    .filter((item: string) => !!item);

  const getExposeValues = ({ values }: any) => {
    const { rowCheckbox = [] } = values || {};
    setIdsToAction(rowCheckbox);
  };

  const handleSubmitFilter = ({ pub_category = [], keywords }: any) => {
    router.push({
      pathname: adminRoutes.ManagePartnerFoods.path,
      query: {
        keywords,
        pub_category: pub_category?.join(','),
        restaurantId,
      },
    });
  };

  const onSetFoodToRemove = (foodData: any) => () => {
    setFoodToRemove(foodData);
  };

  const onClearFoodToRemove = () => {
    setFoodToRemove(null);
  };

  const removeFood = async () => {
    if (!foodToRemove) return;
    const { id } = foodToRemove;
    const { error } = (await dispatch(
      foodSliceThunks.removePartnerFood({ id }),
    )) as any;
    if (!error) {
      dispatch(
        foodSliceThunks.queryPartnerFoods({
          restaurantId,
          page,
          ...(groupPubCategory.length > 0
            ? { pub_category: groupPubCategory }
            : {}),
          ...(keywords ? { keywords } : {}),
        }),
      );
    }
  };

  const removeCheckedFoods = async () => {
    const { error } = (await dispatch(
      foodSliceThunks.removePartnerFood({ ids: idsToAction }),
    )) as any;
    if (!error) {
      dispatch(
        foodSliceThunks.queryPartnerFoods({
          restaurantId,
          page,
          ...(groupPubCategory.length > 0
            ? { pub_category: groupPubCategory }
            : {}),
          ...(keywords ? { keywords } : {}),
        }),
      );
    }
  };

  const parsedFoods = parseEntitiesToTableData(foods, {
    restaurantId,
    onSetFoodToRemove,
  });

  const handleClearFilter = () => {
    router.push({
      pathname: adminRoutes.ManagePartnerFoods.path,
      query: { restaurantId },
    });
  };

  useEffect(() => {
    dispatch(
      foodSliceThunks.queryPartnerFoods({
        restaurantId,
        page,
        ...(groupPubCategory.length > 0
          ? { pub_category: groupPubCategory }
          : {}),
        ...(keywords ? { keywords } : {}),
      }),
    );
  }, [
    dispatch,
    page,
    restaurantId,
    JSON.stringify(groupPubCategory),
    keywords,
  ]);

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ManagePartnerFoods.title" />
      </h1>
      <div className={css.tableActions}>
        <IntegrationFilterModal
          onSubmit={handleSubmitFilter}
          onClear={handleClearFilter}
          initialValues={{
            keywords,
            pub_category: groupPubCategory,
          }}>
          <FieldTextInput
            name="keywords"
            id="keywords"
            label="Tên món"
            placeholder="Nhập tên món"
            className={css.input}
          />
          <FieldMultipleSelect
            className={css.input}
            name="pub_category"
            id="pub_category"
            label="Phong cách ẩm thực"
            placeholder="Phong cách ẩm thực"
            options={CATEGORY_OPTIONS}
          />
        </IntegrationFilterModal>
        <div className={css.ctaButtons}>
          <InlineTextButton
            inProgress={removeFoodInProgress}
            onClick={openRemoveCheckedModal}
            disabled={idsToAction.length === 0 || removeFoodInProgress}
            className={css.removeButton}>
            <IconDelete className={css.buttonIcon} />
            Xóa món
          </InlineTextButton>
          <Button className={css.lightButton}>
            <IconUploadFile className={css.buttonIcon} />
            Tải món ăn
          </Button>
          <Button
            onClick={() =>
              makeCsv(
                getTableDataForExport(
                  parseEntitiesToExportCsv(foods, idsToAction),
                  TABLE_COLUMN,
                ),
                `${parseTimestaimpToFormat(new Date().getTime())}_donhang.csv`,
              )
            }
            disabled={idsToAction.length === 0}
            className={css.lightButton}>
            <IconPrint className={css.buttonIcon} />
            In danh sách món ăn
          </Button>
          <NamedLink
            path={`/admin/partner/${restaurantId}/settings/food/create`}>
            <Button className={css.addButton}>Thêm món ăn</Button>
          </NamedLink>
        </div>
      </div>
      {queryFoodsError && <ErrorMessage message={queryFoodsError.message} />}
      {queryFoodsInProgress ? (
        <LoadingContainer />
      ) : (
        <TableForm
          columns={TABLE_COLUMN}
          data={parsedFoods}
          isLoading={queryFoodsInProgress}
          hasCheckbox
          exposeValues={getExposeValues}
        />
      )}
      <AlertModal
        isOpen={foodToRemove || removeCheckedModalOpen}
        handleClose={
          removeCheckedModalOpen ? closeRemoveCheckedModal : onClearFoodToRemove
        }
        onCancel={
          removeCheckedModalOpen ? closeRemoveCheckedModal : onClearFoodToRemove
        }
        onConfirm={
          removeCheckedModalOpen
            ? removeCheckedFoods
            : (removeFood as unknown as () => void)
        }
        cancelLabel="Hủy"
        confirmLabel="Xóa món ăn"
        confirmInProgress={removeFoodInProgress}
        confirmDisabled={removeFoodInProgress}>
        <div className={css.removeTitle}>
          <FormattedMessage id="ManagePartnerFoods.removeTitle" />
        </div>
        <p className={css.removeContent}>
          <FormattedMessage
            id="ManagePartnerFoods.removeContent"
            values={{
              foodName: (
                <div className={css.foodTitle}>
                  {removeCheckedModalOpen ? (
                    <FormattedMessage
                      id="ManagePartnerFoods.foodLength"
                      values={{ foodLength: idsToAction.length }}
                    />
                  ) : (
                    foodToRemove?.title
                  )}
                </div>
              ),
            }}
          />
        </p>
      </AlertModal>
    </div>
  );
};

export default ManagePartnerFoods;
