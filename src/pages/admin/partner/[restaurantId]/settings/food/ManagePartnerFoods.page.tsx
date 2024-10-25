/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';

import Button, { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconDuplicate from '@components/Icons/IconDuplicate/IconDuplicate';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconPrint from '@components/Icons/IconPrint/IconPrint';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import IconUploadFile from '@components/Icons/IconUploadFile/IconUploadFile';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import AlertModal from '@components/Modal/AlertModal';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import Toggle from '@components/Toggle/Toggle';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import { adminRoutes } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import {
  FOOD_SIDE_DISH_OPTIONS,
  FOOD_SPECIAL_DIET_OPTIONS,
  FOOD_TYPE_OPTIONS,
  getLabelByKey,
  MENU_TYPE_OPTIONS,
} from '@src/utils/options';
import type { TIntegrationListing } from '@utils/types';

import FilterForm from './FilterForm/FilterForm';

import css from './ManagePartnerFoods.module.scss';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'title',
    label: 'Tên món',
    render: (data: any) => {
      if (data.isDeleted) {
        return (
          <div className={css.deletedFood}>
            <FormattedMessage id="ManagePartnerFoods.deletedFood" />
          </div>
        );
      }

      return (
        <NamedLink
          path={`/admin/partner/${data.restaurantId}/settings/food/${data.id}`}
          className={css.titleRow}
          title={data.id}>
          {data.title}
        </NamedLink>
      );
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

      return <div className={css.categoryRow}>{data.category}</div>;
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => {
      if (data.isDeleted) {
        return <div></div>;
      }

      const onPublishOrCloseFood = async () => {
        await data.handlePublishOrCloseFood(data.id, !data.isPublished);
      };

      return (
        <div>
          {data.isCloseOrPublishInProgress ? (
            <IconSpinner
              className={classNames(css.actionBtn, css.iconLoading)}
            />
          ) : (
            <Toggle
              className={css.actionBtn}
              status={data.isPublished ? 'on' : 'off'}
              onClick={onPublishOrCloseFood}
            />
          )}
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
  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );

  const { publishOrCloseFoodId, ...restExtraData } = extraData;

  return foods.map((food) => {
    return {
      key: food.id.uuid,
      data: {
        isDeleted: food.attributes.metadata.isDeleted,
        isPublished:
          typeof food.attributes.metadata.isFoodEnable === 'undefined'
            ? true
            : food.attributes.metadata.isFoodEnable,
        isCloseOrPublishInProgress: publishOrCloseFoodId === food.id.uuid,
        title: food.attributes.title,
        description: food.attributes.description,
        id: food.id.uuid,
        menuType: getLabelByKey(
          MENU_TYPE_OPTIONS,
          food.attributes.publicData.menuType,
        ),
        category: getLabelByKey(
          categoryOptions,
          food.attributes.publicData.category,
        ),
        foodType: getLabelByKey(
          FOOD_TYPE_OPTIONS,
          food.attributes.publicData.foodType,
        ),
        ...restExtraData,
      },
    };
  });
};

const parseEntitiesToExportCsv = (
  foods: TIntegrationListing[],
  ids: string[],
) => {
  const packagingOptions = useAppSelector(
    (state) => state.SystemAttributes.packaging,
  );
  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );

  const foodsToExport = foods
    .filter((food) => ids.includes(food.id.uuid))
    .map((food) => {
      const {
        publicData = {},
        description,
        title,
        price,
      } = food.attributes || {};
      const {
        sideDishes = [],
        specialDiets = [],
        category,
        foodType,
        menuType,
        allergicIngredients = [],
        maxQuantity,
        minOrderHourInAdvance,
        minQuantity,
        notes,
        unit,
        numberOfMainDishes,
        packaging,
      } = publicData;

      return {
        'Mã món': food.id.uuid,
        'Tên món ăn': title,
        'Mô tả': description,
        'Đơn giá': `${price?.amount} VND`,
        'Thành phần dị ứng': allergicIngredients.join(','),
        'Chất liệu bao bì': getLabelByKey(packagingOptions, packaging),
        'Phong cách ẩm thực': getLabelByKey(categoryOptions, category),
        'Loại món ăn': getLabelByKey(FOOD_TYPE_OPTIONS, foodType),
        'Loại menu': getLabelByKey(MENU_TYPE_OPTIONS, menuType),
        'Món ăn kèm': sideDishes
          .map((key: string) => getLabelByKey(FOOD_SIDE_DISH_OPTIONS, key))
          .join(','),
        'Chế độ dinh dưỡng đặc biệt': specialDiets
          .map((key: string) => getLabelByKey(FOOD_SPECIAL_DIET_OPTIONS, key))
          .join(','),
        'Số nguời tối đa': maxQuantity,
        'Giờ đặt trước tối thiểu': minOrderHourInAdvance,
        'Số lượng tối thiểu': minQuantity,
        'Ghi chú': notes,
        'Đơn vị tính': unit,
        'Số món chính': numberOfMainDishes,
        'Hình ảnh': food.images?.map(
          (image) => image.attributes.variants['square-small2x'].url,
        ),
      };
    });

  return foodsToExport;
};

const IMPORT_FILE = 'IMPORT_FILE';
const GOOGLE_SHEET_LINK = 'GOOGLE_SHEET_LINK';

const ManagePartnerFoods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );

  const [idsToAction, setIdsToAction] = useState<string[]>([]);
  const [foodToRemove, setFoodToRemove] = useState<any>(null);
  const [file, setFile] = useState<File | null>();
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>();
  const [importType, setImportType] = useState<string>(IMPORT_FILE);

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
    publishOrCloseFoodId,
    publishOrCloseFoodError,
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

  const handlePublishOrCloseFood = async (id: string, isPublish: boolean) => {
    await dispatch(
      foodSliceThunks.publishOrCloseFood({
        id,
        isPublish,
      }),
    );
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
    handlePublishOrCloseFood,
    publishOrCloseFoodId,
    publishOrCloseFoodError,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, restaurantId, keywords, categoryString]);

  const onImportFoodFromCsv = async () => {
    const hasValue = importType === IMPORT_FILE ? file : googleSheetUrl;
    if (hasValue) {
      const { error } = (await dispatch(
        foodSliceThunks.createPartnerFoodFromCsv({
          ...(importType === IMPORT_FILE
            ? { ...(file ? { file } : {}) }
            : { googleSheetUrl }),
          restaurantId: restaurantId as string,
        }),
      )) as any;

      if (!error) {
        closeImportModal();
        setFile(null);

        // reload screen
        window.location.reload();
      }
    }
  };

  const makeExcelFile = () => {
    const foodsToExport = parseEntitiesToExportCsv(foods, idsToAction);
    const ws = XLSX.utils.json_to_sheet(foodsToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
    XLSX.writeFile(wb, `${formatTimestamp(new Date().getTime())}_Món_Ăn.xlsx`);
  };

  const onChangeFile = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    const files =
      e.dataTransfer && e.dataTransfer.files.length > 0
        ? [...e.dataTransfer.files]
        : [...e.target.files];

    if (files[0]) {
      setFile(files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ManagePartnerFoods.title" />
      </h1>
      <div className={css.tableActions}>
        <IntegrationFilterModal
          onClear={handleClearFilter}
          className={css.filterTooltip}
          leftFilters={
            <Tooltip
              tooltipContent={
                <FilterForm
                  onSubmit={handleSubmitFilter}
                  categoryOptions={categoryOptions}
                  initialValues={{
                    keywords,
                    pub_category: groupPubCategory,
                  }}
                />
              }
              placement="bottomLeft"
              trigger="click"
              overlayInnerStyle={{ backgroundColor: '#fff', padding: 20 }}>
              <Button
                type="button"
                variant="secondary"
                className={css.filterButton}>
                <IconFilter className={css.filterIcon} />
                <FormattedMessage id="IntegrationFilterModal.filterMessage" />
              </Button>
            </Tooltip>
          }
        />
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
            onClick={makeExcelFile}
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
          tableBodyCellClassName={css.tableBodyCell}
          pagination={managePartnerFoodPagination}
          paginationPath={`/admin/partner/${restaurantId}/settings/food`}
          tableWrapperClassName={css.tableWrapper}
          tableClassName={css.table}
        />
      )}
      <AlertModal
        isOpen={isImportModalOpen}
        handleClose={closeImportModal}
        confirmLabel="Nhập"
        onCancel={closeImportModal}
        onConfirm={onImportFoodFromCsv}
        title={<FormattedMessage id="ManagePartnerFoods.importTitle" />}
        cancelLabel="Hủy"
        confirmInProgress={createPartnerFoodFromCsvInProgress}
        confirmDisabled={createPartnerFoodFromCsvInProgress}>
        <div className={css.radioButton}>
          <div className={css.inputWrapper}>
            <input
              id="importFile"
              type="radio"
              checked={importType === IMPORT_FILE}
              onChange={() => setImportType(IMPORT_FILE)}
            />
            <label htmlFor="importFile">Nhập file</label>
          </div>
          <div className={css.inputWrapper}>
            <input
              id="googleSheetLink"
              type="radio"
              checked={importType === GOOGLE_SHEET_LINK}
              onChange={() => setImportType(GOOGLE_SHEET_LINK)}
            />
            <label htmlFor="googleSheetLink">Link Google Sheet</label>
          </div>
        </div>
        <p className={css.downloadFileHere}>
          {importType !== GOOGLE_SHEET_LINK ? (
            <FormattedMessage
              id="ManagePartnerFoods.downloadFileHere"
              values={{
                link: (
                  <NamedLink
                    target="_blank"
                    path={process.env.NEXT_PUBLIC_IMPORT_FOOD_GUIDE_FILE_URL}>
                    <FormattedMessage id="ManagePartnerFoods.templateLink" />
                  </NamedLink>
                ),
              }}
            />
          ) : (
            <FormattedMessage
              id="ManagePartnerFoods.sampleFileHere"
              values={{
                link: (
                  <NamedLink
                    target="_blank"
                    path={process.env.NEXT_PUBLIC_IMPORT_FOOD_TEMPLATE}>
                    <FormattedMessage id="ManagePartnerFoods.templateLink" />
                  </NamedLink>
                ),
              }}
            />
          )}
        </p>
        {importType === GOOGLE_SHEET_LINK ? (
          <div>
            <input
              onChange={({ target }) => setGoogleSheetUrl(target.value)}
              type="text"
              name="file"
              value={googleSheetUrl}
              id="file"
              placeholder="Nhập link google sheet"
              className={css.googleSheetInput}
            />
            <p>
              {
                'Vào Google Sheet -> chọn File -> chọn Share -> chọn Publish to the web -> Chọn dạng publish là CSV -> Publish -> Copy pubished link -> Paste vào ô nhập'
              }
            </p>
          </div>
        ) : (
          <div className={css.inputWrapper}>
            <input
              accept=".xlsx,.xls"
              onChange={onChangeFile}
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
        )}
      </AlertModal>
      <AlertModal
        title={<FormattedMessage id="ManagePartnerFoods.removeTitle" />}
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
        childrenClassName={css.removeModalContent}
        confirmDisabled={removeFoodInProgress}>
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
