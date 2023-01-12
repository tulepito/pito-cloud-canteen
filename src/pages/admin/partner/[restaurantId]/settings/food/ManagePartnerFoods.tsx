/* eslint-disable @typescript-eslint/no-shadow */
import Button, { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import FieldMultipleSelect from '@components/FieldMutipleSelect/FieldMultipleSelect';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import IconDelete from '@components/IconDelete/IconDelete';
import IconEdit from '@components/IconEdit/IconEdit';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import { adminRoutes } from '@src/paths';
import { CATEGORY_OPTIONS } from '@utils/enums';
import type { TListing } from '@utils/types';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManagePartnerFoods.module.scss';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'foodId',
    label: '',
    render: (data: any) => {
      return (
        <FieldCheckbox
          retrieveValue={data.onCheckboxChange(data.id)}
          name="foodIds"
          id={data.id}
          value={data.id}
          label=" "
        />
      );
    },
  },
  {
    key: 'id',
    label: 'ID',
    render: (data: any) => {
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
      return <div title={data.title}>{data.title}</div>;
    },
  },
  {
    key: 'description',
    label: 'Mô tả',
    render: (data: any) => {
      return <div className={css.descriptionRow}>{data.description}</div>;
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => {
      return (
        <div>
          {data.isLoading ? (
            <IconSpinner className={css.iconSpinner} />
          ) : (
            <>
              <NamedLink
                path={`/admin/partner/${data.restaurantId}/settings/food/${data.id}`}
                className={css.actionBtn}>
                <IconEdit />
              </NamedLink>
              <InlineTextButton
                type="button"
                onClick={data.removeFood(data.id)}
                className={css.actionBtn}>
                <IconDelete />
              </InlineTextButton>
            </>
          )}
        </div>
      );
    },
  },
];

const parseEntitiesToTableData = (foods: TListing[], extraData: any) => {
  return foods.map((food) => {
    return {
      key: food.id.uuid,
      data: {
        title: food.attributes.title,
        description: food.attributes.description,
        id: food.id.uuid,
        isLoading: extraData.removeFoodInProgress === food.id.uuid,
        ...extraData,
      },
    };
  });
};

const ManagePartnerFoods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [idsToRemove, setIdsToRemove] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { restaurantId, page = 1, keywords, pub_category = '' } = router.query;

  const { foods, queryFoodsInProgress, queryFoodsError, removeFoodInProgress } =
    useAppSelector((state) => state.foods, shallowEqual);

  const categoryString = pub_category as string;

  const groupPubCategory = categoryString
    ?.split(',')
    .filter((item: string) => !!item);

  const onCheckboxChange = (value: string) => () => {
    const newIds = [...idsToRemove];
    const alreadyAddedIndex = newIds.findIndex((id: string) => id === value);
    if (alreadyAddedIndex >= 0) {
      newIds.splice(alreadyAddedIndex, 1);
    } else {
      newIds.push(value);
    }
    setIdsToRemove(newIds);
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

  const removeFood = (id: string) => async () => {
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
      foodSliceThunks.removePartnerFood({ ids: idsToRemove }),
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
    removeFood,
    removeFoodInProgress,
    onCheckboxChange,
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
          <NamedLink
            path={`/admin/partner/${restaurantId}/settings/food/create`}>
            <Button className={css.ctaButton}>Thêm</Button>
          </NamedLink>
          <Button
            inProgress={removeFoodInProgress}
            onClick={removeCheckedFoods}
            disabled={idsToRemove.length === 0 || removeFoodInProgress}
            className={css.ctaButton}>
            Xóa
          </Button>
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
        />
      )}
    </div>
  );
};

export default ManagePartnerFoods;
