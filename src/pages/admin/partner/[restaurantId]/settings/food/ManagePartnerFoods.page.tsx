/* eslint-disable @typescript-eslint/naming-convention */
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
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
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
        return <div className={css.deletedFood}>Deleted food</div>;
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
      const { publicData = {}, description, title } = food.attributes || {};
      const { sideDishes = [], specialDiets = [], ...rest } = publicData;
      return {
        title,
        description,
        id: food.id.uuid,
        ...rest,
        sideDishes: sideDishes.join(','),
        specialDiets: specialDiets.join(','),
      };
    });
};

const ManagePartnerFoods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [idsToAction, setIdsToAction] = useState<string[]>([]);
  const [foodToRemove, setFoodToRemove] = useState<any>(null);
  const [file, setFile] = useState<File | null>();

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

  const {
    restaurantId,
    page = 1,
    keywords,
    pub_category = '',
    pub_menuType = '',
  } = router.query;

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
  const menuTypeString = pub_menuType as string;

  const groupPubCategory = categoryString
    ?.split(',')
    .filter((item: string) => !!item);

  const groupMenuTypeString = menuTypeString
    ?.split(',')
    .filter((item: string) => !!item);

  const getExposeValues = ({ values }: any) => {
    const { rowCheckbox = [] } = values || {};
    setIdsToAction(rowCheckbox);
  };

  const handleSubmitFilter = ({
    pub_category = [],
    keywords,
    pub_menuType = [],
  }: any) => {
    router.push({
      pathname: adminRoutes.ManagePartnerFoods.path,
      query: {
        keywords,
        pub_category: pub_category?.join(','),
        pub_menuType: pub_menuType?.join(','),
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
      return onQueryPartnerFood({ page: 1, restaurantId });
    }
  };

  const removeCheckedFoods = async () => {
    const { error } = (await dispatch(
      foodSliceThunks.removePartnerFood({ ids: idsToAction }),
    )) as any;
    if (!error) {
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
      ...(groupMenuTypeString.length > 0
        ? { pub_menuType: groupMenuTypeString }
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

  const downloadGuide = () => {
    fetch(fileUrl as string)
      .then((response) => response.blob())
      .then((blob) => {
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `FileName.pdf`);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode && link.parentNode.removeChild(link);
      });
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
            pub_menuType: groupMenuTypeString,
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
          <FieldMultipleSelect
            className={css.input}
            name="pub_menuType"
            id="pub_menuType"
            label="Loại menu"
            placeholder="Chọn loại menu"
            options={MENU_OPTIONS}
          />
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
        <p>
          <FormattedMessage
            id="ManagePartnerFoods.downloadFileHere"
            values={{
              link: (
                <InlineTextButton type="button" onClick={downloadGuide}>
                  <FormattedMessage id="ManagePartnerFoods.templateLink" />
                </InlineTextButton>
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
