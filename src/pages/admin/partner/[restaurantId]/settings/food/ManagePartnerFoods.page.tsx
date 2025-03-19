/* eslint-disable no-await-in-loop */
import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';

import { partnerFoodApi } from '@apis/foodApi';
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
import { sleep } from '@helpers/index';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { getImportDataFromCsv } from '@pages/partner/products/food/utils';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import { createSdkInstance } from '@sharetribe/sdk';
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
import { PastableImageInput } from './PastableImageInput';
import type { Column } from './PreviewTable';
import { PreviewTable } from './PreviewTable';
import { remoteImageUrlToBase64 } from './remoteImageUrlToBase64';

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
  categoryOptions: any,
) => {
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
  packagingOptions: any,
  categoryOptions: any,
) => {
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

interface Record {
  image?: string;
  name?: string;
  menuType?: string;
  category?: string;
  description?: string;
  packaging?: string;
  price?: string;
  numberOfMainDishes?: string;
  stirFriedMeal?: string;
  soup?: string;
  dessert?: string;
  drink?: string;
  allergicIngredients?: string;
  note?: string;
  imageBase64?: string;
  status?: 'loading' | 'success' | string;
}
const ManagePartnerFoods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );

  const [idsToAction, setIdsToAction] = useState<string[]>([]);
  const [foodToRemove, setFoodToRemove] = useState<any>(null);
  const [previewRecords, setPreviewRecords] = useState<Record[]>([]);
  const [isCreatingModeOn, setIsCreatingModeOn] = useState(false);
  const [
    isCreatingModeCompletedOneWayFlag,
    setIsCreatingModeCompletedOneWayFlag,
  ] = useState(false);
  const allowRunFetchRecordRef = React.useRef(true);

  const {
    value: isImportModalOpen,
    setTrue: openImportModal,
    setFalse: closeImportModal,
  } = useBoolean(false);

  const onCloseImportModal = () => {
    closeImportModal();
    if (previewRecords.length > 0) {
      window.location.reload();
    }
  };

  const {
    value: removeCheckedModalOpen,
    setTrue: openRemoveCheckedModal,
    setFalse: closeRemoveCheckedModal,
  } = useBoolean(false);

  const packagingOptions = useAppSelector(
    (state) => state.SystemAttributes.packaging,
  );

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

  const handleSubmitFilter = ({
    pub_category: _pub_category = [],
    keywords: _keywords,
  }: any) => {
    router.push({
      pathname: adminRoutes.ManagePartnerFoods.path,
      query: {
        keywords: _keywords,
        pub_category: _pub_category?.join(','),
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

  const parsedFoods = parseEntitiesToTableData(
    foods,
    {
      restaurantId,
      onSetFoodToRemove,
      handlePublishOrCloseFood,
      publishOrCloseFoodId,
      publishOrCloseFoodError,
    },
    categoryOptions,
  );

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
    setIsCreatingModeOn(true);
    for (let i = 0; i < previewRecords.length; i++) {
      setPreviewRecords((prev) =>
        prev.map((record, index) => {
          if (index === i) {
            return {
              ...record,
              status: 'loading',
            };
          }

          return record;
        }),
      );

      const imageBase64 = previewRecords[i].imageBase64;

      const dataUrlToFile = (dataUrl: string, filename: string) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
      };

      try {
        let imageIdHolder = null;

        if (imageBase64) {
          const fileFromImageBase64 = dataUrlToFile(imageBase64, 'image.png');

          const uploadRes = await createSdkInstance().images.upload(
            {
              image: fileFromImageBase64,
            },
            {
              expand: true,
              'fields.image': [
                'variants.squareSmall',
                'variants.squareSmall2x',
                'variants.scaledLarge',
              ],
            },
          );

          imageIdHolder = uploadRes.data.data.id.uuid;
        }

        const {
          // eslint-disable-next-line unused-imports/no-unused-vars
          imageBase64: _,
          // eslint-disable-next-line unused-imports/no-unused-vars
          status: __,
          ..._dataParams
        } = previewRecords[i];

        const dataParams: ReturnType<typeof getImportDataFromCsv> & {
          images?: string;
        } = getImportDataFromCsv(
          {
            ..._dataParams,
            restaurantId,
          },
          packagingOptions,
          {
            title: _dataParams.name,
            description: _dataParams.description,
            price: _dataParams.price,
            allergicIngredients: _dataParams.allergicIngredients,
            foodType: _dataParams.category,
            numberOfMainDishes: _dataParams.numberOfMainDishes,
            menuType: _dataParams.menuType,
            packaging: _dataParams.packaging,
            notes: _dataParams.note,
            'stir-fried-meal': _dataParams.stirFriedMeal,
            soup: _dataParams.soup,
            dessert: _dataParams.dessert,
            drink: _dataParams.drink,
          },
        );

        dataParams.images = imageIdHolder;

        const queryParams = {
          expand: true,
        };

        await partnerFoodApi.createFood({
          dataParams,
          queryParams,
        });

        // Throttle the requests to avoid rate limiting
        await sleep(500);

        setPreviewRecords((prev) =>
          prev.map((record, index) => {
            if (index === i) {
              return {
                ...record,
                status: 'success',
              };
            }

            return record;
          }),
        );
      } catch (error) {
        setPreviewRecords((prev) =>
          prev.map((record, index) => {
            if (index === i) {
              return {
                ...record,
                status: 'error',
              };
            }

            return record;
          }),
        );
      }
    }

    setIsCreatingModeOn(false);
    setIsCreatingModeCompletedOneWayFlag(true);
  };

  const makeExcelFile = () => {
    const foodsToExport = parseEntitiesToExportCsv(
      foods,
      idsToAction,
      packagingOptions,
      categoryOptions,
    );
    const ws = XLSX.utils.json_to_sheet(foodsToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
    XLSX.writeFile(wb, `${formatTimestamp(new Date().getTime())}_Món_Ăn.xlsx`);
  };

  const onChangeFile = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCreatingModeOn(false);
    const files =
      e.dataTransfer && e.dataTransfer.files.length > 0
        ? [...e.dataTransfer.files]
        : [...e.target.files];

    if (files[0]) {
      setPreviewRecords([]);

      const reader = new FileReader();
      reader.onload = async (_e) => {
        const data = new Uint8Array(_e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets.Template;

        const nameToKeyAdapter = {
          'Hình ảnh': 'image',
          'Tên món ăn': 'name',
          'Loại menu': 'menuType',
          'Phân loại': 'category',
          'Mô tả chi tiết': 'description',
          'Chất liệu bao bì': 'packaging',
          'Đơn giá (Vnđ)': 'price',
          'Số món chính (món)': 'numberOfMainDishes',
          'Món xào': 'sideDish',
          'Món canh': 'soup',
          'Tráng miệng': 'dessert',
          'Nước uống': 'drink',
          'Thành phần dị ứng': 'allergicIngredients',
          'Ghi chú': 'note',
        };

        const sheetRecords = XLSX.utils.sheet_to_json(
          sheet,
        ) as unknown as typeof nameToKeyAdapter[];

        const previewRecordsWithMappedProperties = sheetRecords.map(
          (sheetRecord) => {
            const mappedRecord: Partial<Record> = {};

            Object.keys(sheetRecord).forEach((key) => {
              const keyValue = nameToKeyAdapter[
                key as keyof typeof sheetRecord
              ] as keyof Record;

              if (keyValue) {
                mappedRecord[keyValue] = sheetRecord[
                  key as keyof typeof sheetRecord
                ] as any;
              }
            });

            return mappedRecord;
          },
        );

        setPreviewRecords(previewRecordsWithMappedProperties);
        allowRunFetchRecordRef.current = true;
      };
      reader.readAsArrayBuffer(
        files
          .filter(
            (file: any) =>
              file.type ===
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          )
          .pop(),
      );

      e.target.value = '';
    }
  };

  useEffect(() => {
    if (previewRecords.length === 0) return;
    if (!allowRunFetchRecordRef.current) return;
    const fetchImageBase64 = async () => {
      const previewRecordsWithBase64 = await Promise.all(
        previewRecords.map(async (record) => {
          if (!record.image) {
            return record;
          }

          const imageBase64 = await remoteImageUrlToBase64(record.image);

          return { ...record, imageBase64 };
        }),
      );

      setPreviewRecords(previewRecordsWithBase64);
    };

    fetchImageBase64();
    allowRunFetchRecordRef.current = false;
  }, [previewRecords]);

  const columns: Column[] = [
    {
      label: 'STT',
      accessor: 'index',
      render: (value: string, _, index?: number) => {
        if (index === undefined) {
          return <></>;
        }

        return index + 1;
      },
    },
    {
      label: 'Tình trạng',
      accessor: 'status',
      render: (value: string) => {
        let _node: ReactNode = '❌';
        if (!value) {
          _node = '⚫';
        }

        if (value === 'loading') {
          _node = <IconSpinner className="text-blue-500 stroke-blue-500" />;
        }

        if (value === 'success') {
          _node = '✅';
        }

        return (
          <div className="text-center flex items-center justify-center">
            {_node}
          </div>
        );
      },
    },
    {
      label: 'Hình ảnh',
      accessor: 'imageBase64',
      render: (value: string, _: any, index?: number) => {
        if (index === undefined) {
          return <></>;
        }

        return (
          <div className="flex gap-2">
            <div className="min-w-[64px] min-h-[64px] ">
              {value && (
                <img
                  src={value}
                  alt="Template"
                  className="min-w-[64px] min-h-[64px] object-cover rounded-md"
                />
              )}
            </div>
            <PastableImageInput
              onChange={(newVal: string) => {
                const newPreviewRecords = [...previewRecords];
                newPreviewRecords[index].imageBase64 = newVal;
                setPreviewRecords(newPreviewRecords);
              }}
            />
          </div>
        );
      },
    },
    {
      label: 'Tên món ăn',
      accessor: 'name',
      width: 200,
    },
    {
      label: 'Loại menu',
      accessor: 'menuType',
    },
    {
      label: 'Phân loại',
      accessor: 'category',
    },
    {
      label: 'Mô tả chi tiết',
      accessor: 'description',
      width: 400,
    },
    {
      label: 'Chất liệu bao bì',
      accessor: 'packaging',
    },
    {
      label: 'Đơn giá (Vnđ)',
      accessor: 'price',
    },
    {
      label: 'Số món chính (món)',
      accessor: 'numberOfMainDishes',
    },
    {
      label: 'Món xào',
      accessor: 'sideDish',
    },
    {
      label: 'Món canh',
      accessor: 'soup',
    },
    {
      label: 'Tráng miệng',
      accessor: 'dessert',
    },
    {
      label: 'Nước uống',
      accessor: 'drink',
    },
    {
      label: 'Thành phần dị ứng',
      accessor: 'allergicIngredients',
    },
    {
      label: 'Ghi chú',
      accessor: 'note',
    },
  ];

  const { isMobileLayout } = useViewport();
  const numberOfCreatedRecords = previewRecords.filter(
    (record) => !!record.status && record.status !== 'loading',
  ).length;
  const totalRecords = previewRecords.length;

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
          {!isMobileLayout && (
            <Button onClick={openImportModal} className={css.lightButton}>
              <IconUploadFile className={css.buttonIcon} />
              Tải món
            </Button>
          )}
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
      {!isMobileLayout && (
        <AlertModal
          isOpen={isImportModalOpen}
          handleClose={onCloseImportModal}
          containerClassName="!min-w-[80vw] !w-full"
          confirmLabel={
            isCreatingModeCompletedOneWayFlag
              ? `${numberOfCreatedRecords}/${totalRecords} đã được tạo, tắt dialog`
              : isCreatingModeOn
              ? `Đang tạo ${numberOfCreatedRecords}/${totalRecords}...`
              : 'Tạo'
          }
          onCancel={onCloseImportModal}
          onConfirm={onImportFoodFromCsv}
          title={<FormattedMessage id="ManagePartnerFoods.importTitle" />}
          cancelLabel="Hủy"
          confirmInProgress={createPartnerFoodFromCsvInProgress}
          confirmDisabled={
            createPartnerFoodFromCsvInProgress ||
            !previewRecords.length ||
            (isCreatingModeOn && numberOfCreatedRecords !== totalRecords) ||
            isCreatingModeCompletedOneWayFlag
          }>
          <p className={css.downloadFileHere}>
            <FormattedMessage
              id="ManagePartnerFoods.sampleFileHere"
              values={{
                link: (
                  <NamedLink
                    target="_blank"
                    path="/static/12032025-PCC-TẠO MÓN ĂN TEMPLATE.xlsx">
                    <FormattedMessage id="ManagePartnerFoods.templateLink" />
                  </NamedLink>
                ),
              }}
            />
          </p>
          <a className={classNames(css.inputWrapper, 'inline-block')}>
            <label
              htmlFor="file"
              className={classNames(
                css.importLabel,
                '!text-blue-500 underline !cursor-pointer !m-0',
              )}>
              <FormattedMessage id="ManagePartnerFoods.importLabel" />
            </label>
            <input
              accept=".xlsx,.xls"
              onChange={onChangeFile}
              type="file"
              className={css.inputFile}
              name="file"
              id="file"
            />

            {createPartnerFoodFromCsvError && (
              <ErrorMessage message={createPartnerFoodFromCsvError.message} />
            )}
          </a>
          {!!previewRecords.length && (
            <PreviewTable columns={columns} data={previewRecords} />
          )}
        </AlertModal>
      )}
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
