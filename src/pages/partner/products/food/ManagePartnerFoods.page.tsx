/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import intersection from 'lodash/intersection';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';

import Button, { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconCategory from '@components/Icons/IconCategory/IconCategory';
import IconDanger from '@components/Icons/IconDanger/IconDanger';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconFoodListEmpty from '@components/Icons/IconFoodListEmpty/IconFoodListEmpty';
import IconInfoCircle from '@components/Icons/IconInfoCircle/IconInfoCircle';
import IconList from '@components/Icons/IconList/IconList';
import IconPrint from '@components/Icons/IconPrint/IconPrint';
import IconSwap from '@components/Icons/IconSwap/IconSwap';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import AlertModal from '@components/Modal/AlertModal';
import NamedLink from '@components/NamedLink/NamedLink';
import PopupModal from '@components/PopupModal/PopupModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import Tabs from '@components/Tabs/Tabs';
import Tooltip from '@components/Tooltip/Tooltip';
import {
  parseEntitiesToExportCsv,
  parseEntitiesToTableData,
} from '@helpers/food';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useFoodImportPreview } from '@hooks/useFoodImportPreview';
import { useViewport } from '@hooks/useViewport';
import { getFoodImportPreviewColumns } from '@pages/admin/partner/[restaurantId]/settings/food/getFoodImportPreviewColumns';
import { PreviewTable } from '@pages/admin/partner/[restaurantId]/settings/food/PreviewTable';
import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { partnerPaths } from '@src/paths';
import { CurrentUser, Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EFoodApprovalState } from '@utils/enums';
import type { TListing } from '@utils/types';

import ProductLayout from '../ProductLayout';

import GridFoodListForm from './components/GridFoodListForm/GridFoodListForm';
import MoveFoodToMenuModal from './components/MoveFoodToMenuModal/MoveFoodToMenuModal';
import RowFoodListForm from './components/RowFoodListForm/RowFoodListForm';
import FilterForm from './FilterForm/FilterForm';
import { NEW_FOOD_ID } from './helpers/editFood';
import {
  partnerFoodSliceActions,
  partnerFoodSliceThunks,
} from './PartnerFood.slice';

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

const defaultFoodApprovalTabs = [
  EFoodApprovalState.ACCEPTED,
  EFoodApprovalState.PENDING,
  EFoodApprovalState.DECLINED,
  'draft',
];

const ManagePartnerFoods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const filterFoodSlideModalController = useBoolean();
  const manipulateFoodSlideModalController = useBoolean();
  const cannotRemoveFoodModalController = useBoolean();
  const addFoodSlideModalController = useBoolean();
  const moveFoodToMenuSlideModalController = useBoolean();
  const { isMobileLayout, isTabletLayout } = useViewport();

  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );
  const packagingOptions = useAppSelector(
    (state) => state.SystemAttributes.packaging,
  );

  const [idsToAction, setIdsToAction] = useState<string[]>([]);
  const [foodToRemove, setFoodToRemove] = useState<any>(null);
  const [viewListMode, setViewListMode] = useState<string>('grid');

  const [selectedFood, setSelectedFood] = useState<TListing>(null!);

  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = currentUser ? CurrentUser(currentUser) : null;
  const restaurantId = currentUserGetter?.getMetadata()?.restaurantListingId;

  const {
    previewRecords,
    setPreviewRecords,
    isCreatingModeOn,
    isCreatingModeCompletedOneWayFlag,
    numberOfCreatedRecords,
    totalRecords,
    handleFileChange,
    onImportFoodFromCsv,
    resetImportState,
  } = useFoodImportPreview({
    restaurantId,
    packagingOptions,
    isPartner: true,
  });

  const {
    value: isImportModalOpen,
    setFalse: closeImportModal,
    setTrue: openImportModal,
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
    tab: tabFromQuery = '',
  } = router.query;
  const [foodApprovalActiveTab, setFoodApprovalActiveTab] =
    useState<EFoodApprovalState>(
      (tabFromQuery as EFoodApprovalState) || EFoodApprovalState.ACCEPTED,
    );
  const initDefaultActiveKey = useMemo(() => {
    if (tabFromQuery) {
      const tabIndexMaybe =
        defaultFoodApprovalTabs.findIndex((item) => item === tabFromQuery) + 1;

      return tabIndexMaybe === 0 ? 1 : tabIndexMaybe;
    }

    return 1;
  }, [tabFromQuery]);

  const [defaultActiveKey, setDefaultActiveKey] = useState<number>(
    initDefaultActiveKey!,
  );
  const hasFilterApplied = !!(
    keywords ||
    foodType ||
    createAtStart ||
    createAtEnd
  );

  const {
    foods,
    queryFoodsInProgress,
    queryFoodsError,
    removeFoodInProgress,
    createPartnerFoodFromCsvInProgress,
    createPartnerFoodFromCsvError,
    managePartnerFoodPagination,
    totalAcceptedFoods,
    totalPendingFoods,
    totalDeclinedFoods,
    totalDraftFoods,
    editableFoodMap,
    fetchEditableFoodInProgress,
    acceptedFoods,
    pendingFoods,
    declinedFoods,
    draftFoods,
    menus,
  } = useAppSelector((state) => state.PartnerFood, shallowEqual);

  const getFoods = () => {
    if (!isMobileLayout && !isTabletLayout) {
      return foods;
    }
    switch (foodApprovalActiveTab) {
      case EFoodApprovalState.ACCEPTED:
        return acceptedFoods;
      case EFoodApprovalState.PENDING:
        return pendingFoods;
      case EFoodApprovalState.DECLINED:
        return declinedFoods;
      case 'draft' as EFoodApprovalState:
        return draftFoods;
      default:
        return foods;
    }
  };

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
        ...(createAtEnd
          ? {
              createAtEnd:
                createAtStart && createAtEnd === createAtStart
                  ? createAtEnd + 1
                  : createAtEnd,
            }
          : {}),
        ...(keywords ? { keywords } : {}),
        ...(foodApprovalActiveTab && {
          tab: foodApprovalActiveTab,
        }),
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
    return dispatch(
      partnerFoodSliceThunks.queryPartnerFoods({
        ...params,
        meta_isFoodEnable: true,
      }),
    );
  };

  const removeFood = async () => {
    if (!foodToRemove) return;
    const { id } = foodToRemove;
    const { error } = (await dispatch(
      partnerFoodSliceThunks.removePartnerFood({ id }),
    )) as any;
    if (!error) {
      onClearFoodToRemove();

      return onQueryPartnerFood({
        page: 1,
        ...(isMobileLayout && {
          ...(Object.values(EFoodApprovalState).includes(foodApprovalActiveTab)
            ? {
                adminApproval: foodApprovalActiveTab,
                isDraft: false,
              }
            : {
                isDraft: true,
              }),
        }),
      });
    }
  };

  const removeCheckedFoods = async () => {
    const { error } = (await dispatch(
      partnerFoodSliceThunks.removePartnerFood({ ids: idsToAction }),
    )) as any;
    if (!error) {
      setIdsToAction([]);
      closeRemoveCheckedModal();

      return onQueryPartnerFood({
        page: 1,
        ...(isMobileLayout && {
          ...(Object.values(EFoodApprovalState).includes(foodApprovalActiveTab)
            ? {
                adminApproval: foodApprovalActiveTab,
                isDraft: false,
              }
            : {
                isDraft: true,
              }),
        }),
      });
    }
  };

  const parsedFoods = useMemo(
    () =>
      parseEntitiesToTableData(
        getFoods(),
        {
          onSetFoodToRemove,
        },
        categoryOptions,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(foods), JSON.stringify(categoryOptions)],
  );

  const foodApprovalStateTabItems = useMemo(
    () => [
      {
        key: EFoodApprovalState.ACCEPTED,
        label: (
          <div className={css.tabLabel}>
            <span>Được duyệt</span>
            <div
              data-number
              className={classNames(css.totalItems, {
                [css.tabActive]:
                  foodApprovalActiveTab === EFoodApprovalState.ACCEPTED,
              })}>
              {totalAcceptedFoods}
            </div>
          </div>
        ),
        childrenFn: () => {},
      },
      {
        key: EFoodApprovalState.PENDING,
        label: (
          <div className={css.tabLabel}>
            <span>Chờ duyệt</span>
            <div
              data-number
              className={classNames(css.totalItems, {
                [css.tabActive]:
                  foodApprovalActiveTab === EFoodApprovalState.PENDING,
              })}>
              {totalPendingFoods}
            </div>
          </div>
        ),
        childrenFn: () => {},
      },
      {
        key: EFoodApprovalState.DECLINED,
        label: (
          <div className={css.tabLabel}>
            <span>Từ chối</span>
            <div
              data-number
              className={classNames(css.totalItems, {
                [css.tabActive]:
                  foodApprovalActiveTab === EFoodApprovalState.DECLINED,
              })}>
              {totalDeclinedFoods}
            </div>
          </div>
        ),
        childrenFn: () => {},
      },
      {
        key: 'draft',
        label: (
          <div className={css.tabLabel}>
            <span>Nháp</span>
            <div
              data-number
              className={classNames(css.totalItems, {
                [css.tabActive]:
                  foodApprovalActiveTab === ('draft' as EFoodApprovalState),
              })}>
              {totalDraftFoods}
            </div>
          </div>
        ),
        childrenFn: () => {},
      },
    ],
    [
      totalAcceptedFoods,
      totalDeclinedFoods,
      totalDraftFoods,
      totalPendingFoods,
      foodApprovalActiveTab,
    ],
  );

  const onTabChange = (tab: any) => {
    setFoodApprovalActiveTab(tab?.key);
  };

  const handleClearFilter = () => {
    router.push({
      pathname: partnerPaths.ManageFood,
      query: {
        ...(foodApprovalActiveTab && {
          tab: foodApprovalActiveTab,
        }),
      },
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
    dispatch(partnerFoodSliceActions.setCreateCsvError(null));
    handleFileChange(e);
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

  const noDataContent = !hasFilterApplied ? (
    <div className={css.emptyList}>
      <IconFoodListEmpty />
      <span>Tạo món ăn đầu tiên ngay bạn nhé!</span>
      <NamedLink className={css.link} path={partnerPaths.CreateFood}>
        <Button className={classNames(css.addButton, css.empty)}>
          Thêm món ăn
        </Button>
      </NamedLink>
    </div>
  ) : (
    <div>Không có món ăn nào</div>
  );
  const foodEnableInitialValues = useMemo(
    () =>
      foods.reduce((result: any, _food: TListing) => {
        return {
          ...result,
          [`foodEnable-${_food.id.uuid}`]:
            Listing(_food).getMetadata().isFoodEnable,
        };
      }, {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(foods)],
  );

  const viewModeContentRendered =
    foods.length === 0 ? (
      noDataContent
    ) : viewListMode === 'grid' ? (
      <GridFoodListForm
        onSubmit={() => {}}
        getGridFoodListFormValues={getGridFoodListFormValues}
        foodList={getFoods()}
        pagination={managePartnerFoodPagination}
        onPageChange={onPageChangeInGridFoodListForm}
        setFoodToRemove={setFoodToRemove}
        setSelectedFood={setSelectedFood}
        openManipulateFoodModal={manipulateFoodSlideModalController.setTrue}
        editableFoodMap={editableFoodMap}
        fetchEditableFoodInProgress={fetchEditableFoodInProgress}
        foodApprovalActiveTab={foodApprovalActiveTab}
        initialValues={foodEnableInitialValues}
      />
    ) : (
      <>
        <div className={css.mobileListWrapper}>
          <RowFoodListForm
            onSubmit={() => {}}
            getGridFoodListFormValues={getGridFoodListFormValues}
            foodList={getFoods()}
            pagination={managePartnerFoodPagination}
            onPageChange={onPageChangeInGridFoodListForm}
            setFoodToRemove={setFoodToRemove}
            setSelectedFood={setSelectedFood}
            openManipulateFoodModal={manipulateFoodSlideModalController.setTrue}
            editableFoodMap={editableFoodMap}
            fetchEditableFoodInProgress={fetchEditableFoodInProgress}
            foodApprovalActiveTab={foodApprovalActiveTab}
            initialValues={foodEnableInitialValues}
          />
        </div>
        <div className={css.desktopListWrapper}>
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
        </div>
      </>
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

  const handleSelectRemoveFood = () => {
    manipulateFoodSlideModalController.setFalse();
    const selectedFoodListing = Listing(selectedFood);
    const foodName = selectedFoodListing.getAttributes().title;
    const foodId = selectedFoodListing.getId();
    if (editableFoodMap[foodId]) {
      setFoodToRemove({ id: foodId, title: foodName });
    } else {
      cannotRemoveFoodModalController.setTrue();
    }
  };

  const handleEditFood = () => {
    manipulateFoodSlideModalController.setFalse();

    if (!editableFoodMap[selectedFood?.id.uuid]) {
      return;
    }

    router.push({
      pathname: partnerPaths.EditFood.replace('[foodId]', selectedFood.id.uuid),
      query: {
        fromTab: foodApprovalActiveTab,
      },
    });
  };

  const handleAddFood = () => {
    if (isMobileLayout || isTabletLayout) {
      router.push({
        pathname: partnerPaths.EditFood.replace('[foodId]', NEW_FOOD_ID),
        query: {
          fromTab: foodApprovalActiveTab,
        },
      });
    } else {
      router.push({
        pathname: partnerPaths.CreateFood,
        query: {
          fromTab: foodApprovalActiveTab,
        },
      });
    }
  };

  const handleCloseImportModal = () => {
    dispatch(partnerFoodSliceActions.setCreateCsvError(null));
    resetImportState();
    closeImportModal();
  };

  useEffect(() => {
    if (tabFromQuery) {
      const tabIndexMaybe =
        (foodApprovalStateTabItems || []).findIndex(
          (item) => item.key === tabFromQuery,
        ) + 1;
      setDefaultActiveKey(tabIndexMaybe === 0 ? 1 : tabIndexMaybe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromQuery, foodApprovalStateTabItems]);

  useEffect(() => {
    dispatch(
      partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.ACCEPTED),
    );
    dispatch(
      partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.PENDING),
    );
    dispatch(
      partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.DECLINED),
    );
    dispatch(partnerFoodSliceThunks.fetchDraftFood());
  }, [dispatch]);

  useEffect(() => {
    if (foodApprovalActiveTab === ('draft' as EFoodApprovalState)) {
      dispatch(partnerFoodSliceThunks.fetchDraftFood());
    } else if (foodApprovalActiveTab === EFoodApprovalState.ACCEPTED) {
      dispatch(
        partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.ACCEPTED),
      );
    } else if (foodApprovalActiveTab === EFoodApprovalState.PENDING) {
      dispatch(
        partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.PENDING),
      );
    } else if (foodApprovalActiveTab === EFoodApprovalState.DECLINED) {
      dispatch(
        partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.DECLINED),
      );
    }
  }, [dispatch, foodApprovalActiveTab]);

  useEffect(() => {
    dispatch(partnerFoodSliceThunks.fetchActiveMenus({}));
  }, [dispatch]);

  const handleConfirmImportModal = async () => {
    if (isCreatingModeCompletedOneWayFlag) {
      router.push(partnerPaths.CreateMenu);

      return;
    }

    if (!restaurantId) {
      toast.error('Không tìm thấy thông tin nhà hàng');

      return;
    }

    await onImportFoodFromCsv();
  };

  const columns = useMemo(
    () => getFoodImportPreviewColumns(setPreviewRecords),
    [setPreviewRecords],
  );

  return (
    <ProductLayout
      currentPage="food"
      shouldHideAddProductButton={false}
      shouldHideImportProductButton={false}
      handleImportProduct={openImportModal}
      handleAddProduct={handleAddFood}>
      <div className={css.root}>
        <div className={css.tableActions}>
          <div className={css.ctaViewTypeWrapper}>
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
            <div className={css.ctaIconBtns}>
              <InlineTextButton
                className={css.iconBtn}
                onClick={makeExcelFile}
                disabled={hasFilterApplied && foods.length === 0}>
                <IconPrint />
              </InlineTextButton>
              <InlineTextButton
                className={css.iconBtn}
                disabled={idsToAction.length === 0 || removeFoodInProgress}
                onClick={openRemoveCheckedModal}>
                <IconDelete />
              </InlineTextButton>
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
                      onClearForm={handleClearFilter}
                      initialValues={{
                        keywords,
                        foodType: foodType as string,
                        createAtStart: createAtStart
                          ? new Date(+createAtStart).getTime()
                          : undefined,
                        createAtEnd: createAtEnd
                          ? new Date(+createAtEnd).getTime()
                          : undefined,
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
              disabled={hasFilterApplied && foods.length === 0}
              className={css.removeButton}>
              <IconPrint
                className={classNames(css.buttonIcon, {
                  [css.disabled]: foods.length === 0,
                })}
              />
              <div
                className={classNames(css.buttonIcon, {
                  [css.disabled]: hasFilterApplied && foods.length === 0,
                })}>
                In danh sách món ăn
              </div>
            </InlineTextButton>

            <KeywordSearchForm
              onSubmit={onSearchByFoodName}
              initialValues={{
                keywords: keywords as string,
              }}
              inputClassName={css.searchInput}
              className={css.searchInputWrapper}
            />
            <Button
              type="button"
              variant="secondary"
              className={css.mobileFilterBtn}
              onClick={filterFoodSlideModalController.setTrue}>
              <IconFilter className={css.filterIcon} />
            </Button>
          </div>

          <div className={css.foodApprovalTabWrapper}>
            <Tabs
              disabled={queryFoodsInProgress}
              items={foodApprovalStateTabItems as any}
              onChange={onTabChange}
              defaultActiveKey={`${defaultActiveKey}`}
            />
          </div>
        </div>
        {queryFoodsError && <ErrorMessage message={queryFoodsError.message} />}
        {queryFoodsInProgress ? <LoadingContainer /> : viewModeContentRendered}
        <AlertModal
          isOpen={isImportModalOpen}
          handleClose={handleCloseImportModal}
          containerClassName={
            previewRecords.length > 0 ? '!min-w-[80vw] !w-full' : undefined
          }
          confirmLabel={
            isCreatingModeCompletedOneWayFlag
              ? 'Tạo menu'
              : isCreatingModeOn
              ? `Đang tạo ${numberOfCreatedRecords}/${totalRecords}...`
              : 'Tạo'
          }
          onCancel={handleCloseImportModal}
          onConfirm={handleConfirmImportModal}
          title={<FormattedMessage id="ManagePartnerFoods.importTitle" />}
          cancelLabel="Hủy"
          confirmInProgress={createPartnerFoodFromCsvInProgress}
          confirmDisabled={
            previewRecords.some((record) => record.imageBase64Loading) ||
            createPartnerFoodFromCsvInProgress ||
            !previewRecords.length ||
            (isCreatingModeOn && numberOfCreatedRecords !== totalRecords)
          }>
          <p className={css.downloadFileHere}>
            <FormattedMessage
              id="ManagePartnerFoods.downloadFileHere"
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
          {isCreatingModeCompletedOneWayFlag && (
            <div className="flex justify-center items-center">
              <p className="font-bold text-black text-sm">
                {numberOfCreatedRecords}/{totalRecords} món ăn đã tải lên
              </p>
            </div>
          )}
        </AlertModal>
        <AlertModal
          title={<FormattedMessage id="ManagePartnerFoods.removeTitle" />}
          isOpen={
            (foodToRemove || removeCheckedModalOpen) &&
            (editableFoodMap[foodToRemove?.id] ||
              intersection(Object.keys(editableFoodMap), idsToAction).length >
                0)
          }
          handleClose={
            removeCheckedModalOpen
              ? closeRemoveCheckedModal
              : onClearFoodToRemove
          }
          onCancel={
            removeCheckedModalOpen
              ? closeRemoveCheckedModal
              : onClearFoodToRemove
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
          containerClassName={css.confirmContainer}
          shouldFullScreenInMobile={false}
          confirmDisabled={removeFoodInProgress}>
          <p className={css.removeContent}>
            <FormattedMessage
              id="ManagePartnerFoods.removeContent"
              values={{
                foodName: (
                  <span className={css.foodTitle}>
                    {removeCheckedModalOpen ? (
                      <FormattedMessage
                        id="ManagePartnerFoods.foodLength"
                        values={{ foodLength: idsToAction.length }}
                      />
                    ) : (
                      foodToRemove?.title
                    )}
                  </span>
                ),
              }}
            />
          </p>
        </AlertModal>
        <PopupModal
          id="CannotRemoveFoodModal"
          isOpen={cannotRemoveFoodModalController.value}
          handleClose={cannotRemoveFoodModalController.setFalse}
          containerClassName={css.confirmContainer}
          shouldHideIconClose>
          <>
            <div className={css.cannotRemoveFoodModalTitle}>
              <IconDanger className={css.icon} />
              <span className={css.title}>Không thể xoá Món</span>
            </div>
            <div className={css.content}>
              Món ăn đang được triển khai trong đơn hàng.
            </div>
            <Button
              onClick={cannotRemoveFoodModalController.setFalse}
              variant="secondary"
              type="button"
              className={css.noRemoveFoodConfirmBtn}>
              Đã hiểu
            </Button>
          </>
        </PopupModal>
        <SlideModal
          id="FilterFoodModal"
          isOpen={filterFoodSlideModalController.value}
          onClose={filterFoodSlideModalController.setFalse}>
          <FilterForm
            onSubmit={handleSubmitFilter}
            categoryOptions={categoryOptions}
            onClearForm={handleClearFilter}
            isMobile
            initialValues={{
              keywords,
              foodType: foodType as string,
              createAtStart: createAtStart
                ? new Date(+createAtStart).getTime()
                : undefined,
              createAtEnd: createAtEnd
                ? new Date(+createAtEnd).getTime()
                : undefined,
            }}
          />
        </SlideModal>
        <SlideModal
          id="ManipulateFoodModal"
          isOpen={manipulateFoodSlideModalController.value}
          onClose={manipulateFoodSlideModalController.setFalse}>
          <div className={css.actionsBtnWrapper}>
            <RenderWhen
              condition={
                foodApprovalActiveTab === EFoodApprovalState.ACCEPTED &&
                menus.length > 0
              }>
              <div
                className={css.item}
                onClick={moveFoodToMenuSlideModalController.setTrue}>
                <IconSwap />
                <span>Di chuyển vào menu</span>
              </div>
            </RenderWhen>
            <div
              className={classNames(css.item, {
                [css.disabled]: !editableFoodMap[selectedFood?.id.uuid],
              })}
              onClick={handleEditFood}>
              <IconEdit />
              <span>Chỉnh sửa món ăn</span>
            </div>
            <div className={css.item} onClick={handleSelectRemoveFood}>
              <IconDelete />
              <span>Xóa món ăn</span>
            </div>
          </div>
        </SlideModal>
        <SlideModal
          id="AddFoodModal"
          modalTitle="Thêm"
          isOpen={addFoodSlideModalController.value}
          onClose={addFoodSlideModalController.setFalse}>
          <div className={css.actionsBtnWrapper}>
            <div className={css.item} onClick={handleAddFood}>
              <span>Thêm món ăn</span>
            </div>
          </div>
        </SlideModal>
        <MoveFoodToMenuModal
          isOpen={moveFoodToMenuSlideModalController.value}
          onClose={moveFoodToMenuSlideModalController.setFalse}
          selectedFood={selectedFood}
          menus={menus}
          onCloseManiplateFoodModal={
            manipulateFoodSlideModalController.setFalse
          }
        />
      </div>
    </ProductLayout>
  );
};

export default ManagePartnerFoods;
