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
import IconCategory from '@components/Icons/IconCategory/IconCategory';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconFoodListEmpty from '@components/Icons/IconFoodListEmpty/IconFoodListEmpty';
import IconInfoCircle from '@components/Icons/IconInfoCircle/IconInfoCircle';
import IconList from '@components/Icons/IconList/IconList';
import IconPrint from '@components/Icons/IconPrint/IconPrint';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import AlertModal from '@components/Modal/AlertModal';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { partnerPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import {
  FOOD_TYPE_OPTIONS,
  getLabelByKey,
  MENU_OPTIONS,
  SIDE_DISH_OPTIONS,
  SPECIAL_DIET_OPTIONS,
} from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';

import GridFoodListForm from './components/GridFoodListForm/GridFoodListForm';
import FilterForm from './FilterForm/FilterForm';
import { partnerFoodSliceThunks } from './PartnerFood.slice';

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
          path={partnerPaths.EditFood.replace('[foodId]', data.id)}
          className={css.titleRow}
          title={data.id}>
          {data.title}
        </NamedLink>
      );
    },
  },
  {
    key: 'menuType',
    label: (
      <div className={css.menuTypeTableHeaderLabel}>
        <span>Loại menu</span>
        <Tooltip
          overlayClassName={css.overlay}
          overlayInnerStyle={{
            backgroundColor: '#000',
            padding: '8px 12px',
            color: '#fff',
            width: 253,
          }}
          placement="bottom"
          tooltipContent={
            <div>
              Menu cố định: Món ăn thuộc menu được bán thường xuyên các ngày
              trong tuần.
              <br />
              <br />
              Menu theo chu kỳ: Món ăn thuộc menu có sự thay đổi liên tục theo
              các ngày và tuần khác nhau
            </div>
          }>
          <div className={css.iconInfoWrapper}>
            <IconInfoCircle />
          </div>
        </Tooltip>
      </div>
    ),
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

      return (
        <div>
          <NamedLink
            path={partnerPaths.EditFood.replace('[foodId]', data.id)}
            className={css.actionBtn}>
            <IconEdit />
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
    (state) => state.AdminAttributes.categories,
  );

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
          categoryOptions,
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
        'Loại menu': getLabelByKey(MENU_OPTIONS, menuType),
        'Món ăn kèm': sideDishes
          .map((key: string) => getLabelByKey(SIDE_DISH_OPTIONS, key))
          .join(','),
        'Chế độ dinh dưỡng đặc biệt': specialDiets
          .map((key: string) => getLabelByKey(SPECIAL_DIET_OPTIONS, key))
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
    (state) => state.AdminAttributes.categories,
  );

  const packagingOptions = useAppSelector(
    (state) => state.AdminAttributes.packaging,
  );

  const [idsToAction, setIdsToAction] = useState<string[]>([]);
  const [foodToRemove, setFoodToRemove] = useState<any>(null);
  const [file, setFile] = useState<File | null>();
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>();
  const [importType, setImportType] = useState<string>(IMPORT_FILE);
  const [viewListMode, setViewListMode] = useState<string>('grid');

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
    page = 1,
    keywords,
    foodType = '',
    createAtStart = '',
    createAtEnd = '',
  } = router.query;

  const {
    foods,
    queryFoodsInProgress,
    queryFoodsError,
    removeFoodInProgress,
    createPartnerFoodFromCsvInProgress,
    createPartnerFoodFromCsvError,
    managePartnerFoodPagination,
  } = useAppSelector((state) => state.PartnerFood, shallowEqual);

  const getExposeValues = ({ values }: any) => {
    const { rowCheckbox = [] } = values || {};
    setTimeout(() => {
      setIdsToAction(rowCheckbox);
    }, 0);
  };

  const handleSubmitFilter = ({
    foodType,
    keywords,
    createAtStart,
    createAtEnd,
  }: any) => {
    router.push({
      pathname: partnerPaths.ManageFood,
      query: {
        ...(foodType ? { foodType } : {}),
        ...(createAtStart ? { createAtStart } : {}),
        ...(createAtEnd ? { createAtEnd } : {}),
        ...(keywords ? { keywords } : {}),
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
    return dispatch(partnerFoodSliceThunks.queryPartnerFoods(params));
  };

  const removeFood = async () => {
    if (!foodToRemove) return;
    const { id } = foodToRemove;
    const { error } = (await dispatch(
      partnerFoodSliceThunks.removePartnerFood({ id }),
    )) as any;
    if (!error) {
      onClearFoodToRemove();

      return onQueryPartnerFood({ page: 1 });
    }
  };

  const removeCheckedFoods = async () => {
    const { error } = (await dispatch(
      partnerFoodSliceThunks.removePartnerFood({ ids: idsToAction }),
    )) as any;
    if (!error) {
      setIdsToAction([]);
      closeRemoveCheckedModal();

      return onQueryPartnerFood({ page: 1 });
    }
  };

  const parsedFoods = parseEntitiesToTableData(foods, {
    onSetFoodToRemove,
  });

  const handleClearFilter = () => {
    router.push({
      pathname: partnerPaths.ManageFood,
    });
  };

  useEffect(() => {
    onQueryPartnerFood({
      page,
      ...(foodType ? { foodType } : {}),
      ...(createAtStart ? { createAtStart } : {}),
      ...(createAtEnd ? { createAtEnd } : {}),
      ...(keywords ? { keywords } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keywords, foodType, createAtStart, createAtEnd]);

  const onImportFoodFromCsv = async () => {
    const hasValue = importType === IMPORT_FILE ? file : googleSheetUrl;
    if (hasValue) {
      const { error } = (await dispatch(
        partnerFoodSliceThunks.createPartnerFoodFromCsv({
          ...(importType === IMPORT_FILE
            ? { ...(file ? { file } : {}) }
            : { googleSheetUrl }),
        }),
      )) as any;

      if (!error) {
        closeImportModal();
        setFile(null);
      }
    }
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
    const files =
      e.dataTransfer && e.dataTransfer.files.length > 0
        ? [...e.dataTransfer.files]
        : [...e.target.files];

    if (files[0]) {
      setFile(files[0]);
      e.target.value = '';
    }
  };

  const onSetViewListMode = (mode: string) => () => {
    setViewListMode(mode);
  };

  const getGridFoodListFormValues = (values: any) => {
    setIdsToAction(values);
  };

  const onPageChangeInGridFoodListForm = (page: number) => {
    router.push({
      pathname: partnerPaths.ManageFood,
      query: {
        ...router.query,
        page,
      },
    });
  };

  const viewModeContentRendered =
    foods.length === 0 ? (
      <div className={css.emptyList}>
        <IconFoodListEmpty />
        <span>Tạo món ăn đầu tiên ngay bạn nhé!</span>
        <NamedLink className={css.link} path={partnerPaths.CreateFood}>
          <Button className={classNames(css.addButton, css.empty)}>
            Thêm món ăn
          </Button>
        </NamedLink>
        <Button
          onClick={openImportModal}
          className={classNames(css.lightButton, css.empty)}>
          Thêm món ăn hàng loạt
        </Button>
      </div>
    ) : viewListMode === 'grid' ? (
      <GridFoodListForm
        onSubmit={() => {}}
        getGridFoodListFormValues={getGridFoodListFormValues}
        foodList={foods}
        pagination={managePartnerFoodPagination}
        onPageChange={onPageChangeInGridFoodListForm}
        setFoodToRemove={setFoodToRemove}
      />
    ) : (
      <TableForm
        columns={TABLE_COLUMN}
        data={parsedFoods}
        isLoading={queryFoodsInProgress}
        hasCheckbox
        exposeValues={getExposeValues}
        tableBodyCellClassName={css.tableBodyCell}
        pagination={managePartnerFoodPagination}
        paginationPath={partnerPaths.ManageFood}
        tableWrapperClassName={css.tableWrapper}
        tableClassName={css.table}
      />
    );

  const onSearchByFoodName = (values: any) => {
    const { keywords = '' } = values;
    if (keywords) {
      router.push({
        pathname: partnerPaths.ManageFood,
        query: {
          keywords,
        },
      });
    }
  };

  return (
    <div className={css.root}>
      <div className={css.titleWrapper}>
        <h1 className={css.title}>
          <FormattedMessage id="ManagePartnerFoods.title" />
        </h1>
        <RenderWhen condition={foods.length !== 0}>
          <div className={css.titleCtaBtnWrapper}>
            <Button
              onClick={openImportModal}
              variant="secondary"
              className={css.lightButton}>
              Thêm món ăn hàng loạt
            </Button>
            <NamedLink className={css.link} path={partnerPaths.CreateFood}>
              <Button className={css.addButton}>Thêm món ăn</Button>
            </NamedLink>
          </div>
        </RenderWhen>
      </div>
      <div className={css.tableActions}>
        <div className={css.viewTypeWrapper}>
          <div
            className={classNames(css.viewIcon, {
              [css.active]: viewListMode === 'grid',
            })}
            onClick={onSetViewListMode('grid')}>
            <IconCategory />
          </div>
          <div
            className={classNames(css.viewIcon, {
              [css.active]: viewListMode === 'list',
            })}
            onClick={onSetViewListMode('list')}>
            <IconList />
          </div>
        </div>

        <div className={css.ctaButtons}>
          <IntegrationFilterModal
            onClear={handleClearFilter}
            className={css.filterTooltip}
            leftFilters={
              <Tooltip
                overlayClassName={css.overlay}
                tooltipContent={
                  <FilterForm
                    onSubmit={handleSubmitFilter}
                    categoryOptions={categoryOptions}
                    initialValues={{
                      keywords,
                      foodType: foodType as string,
                      createAtStart: createAtStart as string,
                      createAtEnd: createAtEnd as string,
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

          <InlineTextButton
            onClick={makeExcelFile}
            disabled={idsToAction.length === 0}
            className={css.removeButton}>
            <IconPrint
              className={classNames(css.buttonIcon, {
                [css.disabled]: idsToAction.length === 0,
              })}
            />
            <div
              className={classNames(css.buttonIcon, {
                [css.disabled]: idsToAction.length === 0,
              })}>
              In danh sách món ăn
            </div>
          </InlineTextButton>
          <KeywordSearchForm
            onSubmit={onSearchByFoodName}
            initialValues={{
              keywords: keywords as string,
            }}
          />
        </div>
      </div>
      {queryFoodsError && <ErrorMessage message={queryFoodsError.message} />}
      {queryFoodsInProgress ? <LoadingContainer /> : viewModeContentRendered}
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
