/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import Button, { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldMultipleSelect from '@components/FormFields/FieldMultipleSelect/FieldMultipleSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconDuplicate from '@components/Icons/IconDuplicate/IconDuplicate';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
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
import { parseTimestampToFormat } from '@utils/dates';
import {
  CATEGORY_OPTIONS,
  FOOD_TYPE_OPTIONS,
  getLabelByKey,
  MENU_OPTIONS,
} from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManagePartnerFoods.module.scss';

const fileUrl = process.env.NEXT_PUBLIC_IMPORT_FOOD_GUIDE_FILE_URL;

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: 'ID',
    render: (data: any) => {
      if (data.isDeleted) {
        return (
          <div className={css.deletedMenu}>
            <FormattedMessage id="ManagePartnerFoods.deletedMenu" />
          </div>
        );
      }
      return (
        <NamedLink
          path={`/admin/partner/${data.restaurantId}/settings/food/${data.id}`}
          className={css.idRow}
          title={data.id}>
          {data.id}
        </NamedLink>
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
    label: 'Loại thức ăn',
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
  foods: TIntegrationListing[],
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
  foods: TIntegrationListing[],
  ids: string[],
) => {
  const foodsToExport = foods
    .filter((food) => ids.includes(food.id.uuid))
    .map((food) => {
      const { publicData = {}, description, title } = food.attributes || {};
      const {
        sideDishes = [],
        specialDiets = [],
        category,
        foodType,
        menuType,
        ingredients,
        maxMember,
        minOrderHourInAdvance,
        minQuantity,
        notes,
        unit,
      } = publicData;
      return {
        'Mã món': food.id.uuid,
        'Tên món ăn': title,
        'Mô tả': description,
        'Thành phần chính': ingredients,
        'Phong cách ẩm thực': getLabelByKey(CATEGORY_OPTIONS, category),
        'Loại món ăn': getLabelByKey(FOOD_TYPE_OPTIONS, foodType),
        'Loại menu': getLabelByKey(MENU_OPTIONS, menuType),
        'Món ăn kèm': sideDishes.join(','),
        'Chế độ dinh dưỡng đặc biệt': specialDiets.join(','),
        'Số nguời tối đa': maxMember,
        'Giờ đặt trước tối thiểu': minOrderHourInAdvance,
        'Số lượng tối thiểu': minQuantity,
        'Ghi chú': notes,
        'Đơn vị tính': unit,
        'Hình ảnh': food.images?.map(
          (image) => image.attributes.variants['square-small2x'].url,
        ),
      };
    });
  return foodsToExport;
};

const ManagePartnerFoods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [idsToAction, setIdsToAction] = useState<string[]>([]);
  const [foodToRemove, setFoodToRemove] = useState<any>(null);
  const [file, setFile] = useState<File | null>();
  const csvLinkRef = useRef<any>();
  const {
    value: isImportModalOpen,
    setTrue: openImportModal,
    setFalse: closeImportModal,
  } = useBoolean(false);

  const {
    value: removeCheckedModalOpen,
    setTrue: openRemoveCheckedModal,
    setFalse: closeRemoveCheckedModal,
  } = useBoolean(false);

  const { restaurantId, page = 1, keywords, pub_category = '' } = router.query;

  const {
    foods,
    queryFoodsInProgress,
    queryFoodsError,
    removeFoodInProgress,
    createPartnerFoodFromCsvInProgress,
    createPartnerFoodFromCsvError,
    managePartnerFoodPagination,
  } = useAppSelector((state) => state.foods, shallowEqual);

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

  const onQueryPartnerFood = (params: any = {}) => {
    return dispatch(foodSliceThunks.queryPartnerFoods(params));
  };

  const removeFood = async () => {
    if (!foodToRemove) return;
    const { id } = foodToRemove;
    const { error } = (await dispatch(
      foodSliceThunks.removePartnerFood({ id }),
    )) as any;
    if (!error) {
      onClearFoodToRemove();
      return onQueryPartnerFood({ page: 1, restaurantId });
    }
  };

  const removeCheckedFoods = async () => {
    const { error } = (await dispatch(
      foodSliceThunks.removePartnerFood({ ids: idsToAction }),
    )) as any;
    if (!error) {
      setIdsToAction([]);
      closeRemoveCheckedModal();
      return onQueryPartnerFood({ page: 1, restaurantId });
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
    onQueryPartnerFood({
      restaurantId,
      page,
      ...(groupPubCategory.length > 0
        ? { pub_category: groupPubCategory }
        : {}),

      ...(keywords ? { keywords } : {}),
    });
  }, [page, restaurantId, keywords, categoryString]);

  const onImportFoodFromCsv = async () => {
    if (file) {
      const { error } = (await dispatch(
        foodSliceThunks.creataPartnerFoodFromCsv({
          file,
          restaurantId: restaurantId as string,
        }),
      )) as any;

      if (!error) {
        closeImportModal();
        setFile(null);
      }
    }
  };

  const makeCsv = () => {
    csvLinkRef.current?.link?.click();
  };

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
          {() => (
            <>
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
            </>
          )}
        </IntegrationFilterModal>
        <div className={css.ctaButtons}>
          <InlineTextButton
            inProgress={removeFoodInProgress}
            onClick={openRemoveCheckedModal}
            disabled={idsToAction.length === 0 || removeFoodInProgress}
            className={css.removeButton}>
            <IconDelete
              className={classNames(css.buttonIcon, {
                [css.disabled]:
                  idsToAction.length === 0 || removeFoodInProgress,
              })}
            />
            <div
              className={classNames({
                [css.disabled]:
                  idsToAction.length === 0 || removeFoodInProgress,
              })}>
              Xóa món
            </div>
          </InlineTextButton>
          <Button onClick={openImportModal} className={css.lightButton}>
            <IconUploadFile className={css.buttonIcon} />
            Tải món
          </Button>
          <CSVLink
            data={parseEntitiesToExportCsv(foods, idsToAction)}
            filename={`${parseTimestampToFormat(
              new Date().getTime(),
            )}_donhang.csv`}
            className="hidden"
            ref={csvLinkRef}
            target="_blank"
          />
          <Button
            onClick={makeCsv}
            disabled={idsToAction.length === 0}
            className={css.lightButton}>
            <IconPrint
              className={classNames(css.buttonIcon, {
                [css.disabled]: idsToAction.length === 0,
              })}
            />
            <div
              className={classNames({
                [css.disabled]: idsToAction.length === 0,
              })}>
              In danh sách món ăn
            </div>
          </Button>
          <NamedLink
            className={css.link}
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
          pagination={managePartnerFoodPagination}
          paginationPath={`/admin/partner/${restaurantId}/settings/food`}
        />
      )}
      <AlertModal
        isOpen={isImportModalOpen}
        handleClose={closeImportModal}
        confirmLabel="Nhập"
        onCancel={closeImportModal}
        onConfirm={onImportFoodFromCsv}
        cancelLabel="Hủy"
        confirmInProgress={createPartnerFoodFromCsvInProgress}
        confirmDisabled={createPartnerFoodFromCsvInProgress}>
        <h2 className={css.importTitle}>
          <FormattedMessage id="ManagePartnerFoods.importTitle" />
        </h2>
        <p className={css.downloadFileHere}>
          <FormattedMessage
            id="ManagePartnerFoods.downloadFileHere"
            values={{
              link: (
                <NamedLink path={fileUrl}>
                  <FormattedMessage id="ManagePartnerFoods.templateLink" />
                </NamedLink>
              ),
            }}
          />
        </p>
        <div className={css.inputWrapper}>
          <input
            accept=".csv"
            onChange={({ target }) => setFile(target?.files?.[0])}
            type="file"
            className={css.inputFile}
            name="file"
            id="file"
          />
          <label className={css.importLabel}>
            <FormattedMessage id="ManagePartnerFoods.importLabel" />
          </label>
          <label htmlFor="file">
            <div className={css.fileLabel}>
              {file ? (
                file.name
              ) : (
                <FormattedMessage id="ManagePartnerFoods.inputFile" />
              )}
            </div>
          </label>
          {createPartnerFoodFromCsvError && (
            <ErrorMessage message={createPartnerFoodFromCsvError.message} />
          )}
        </div>
      </AlertModal>
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
