import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import IconTick from '@components/Icons/IconTick/IconTick';
import { TableForm } from '@components/Table/Table';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { EAttributeSetting } from '@src/utils/enums';
import { required } from '@src/utils/validators';

import AddAttributeModal from './components/AddAttributeModal/AddAttributeModal';
import { AdminAttributesSettingThunks } from './Attributes.slice';

import css from './Attributes.module.scss';

const AdminAttributesSettingPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState(EAttributeSetting.MEAL_STYLES);
  const [onEditingRow, setOnEditingRow] = useState();
  const [onDeletingRow, setOnDeletingRow] = useState();
  const [currentTableFormValue, setCurrentTableFormValue] = useState<any>({});
  const addAttributeModalControl = useBoolean();
  const deleteAttributesModalControl = useBoolean();
  const [submitError, setSubmitError] = useState<string>('');

  const { rowCheckbox = [] } = currentTableFormValue;

  const getExposeValues = ({ values }: any) => {
    setCurrentTableFormValue(values);
  };
  const mealStyles = useAppSelector(
    (state) => state.AdminAttributesSetting.categories,
  );
  const nutritions = useAppSelector(
    (state) => state.AdminAttributesSetting.nutritions,
  );
  const daySessions = useAppSelector(
    (state) => state.AdminAttributesSetting.daySessions,
  );
  const packaging = useAppSelector(
    (state) => state.AdminAttributesSetting.packaging,
  );
  const updateAttributeInProgress = useAppSelector(
    (state) => state.AdminAttributesSetting.updateAttributeInProgress,
  );
  const fetchAttributesInProgress = useAppSelector(
    (state) => state.AdminAttributesSetting.fetchAttributesInProgress,
  );

  const allAttributes = {
    mealStyles,
    nutritions,
    daySessions,
    packaging,
  };

  const attributeTotalItems = useMemo(
    () => ({
      [EAttributeSetting.MEAL_STYLES]: mealStyles.length,
      [EAttributeSetting.NUTRITIONS]: nutritions.length,
      [EAttributeSetting.DAY_SESSIONS]: daySessions.length,
      [EAttributeSetting.PACKAGING]: packaging.length,
    }),
    [
      daySessions.length,
      mealStyles.length,
      nutritions.length,
      packaging.length,
    ],
  );

  const parseEntitiesToTableData = (entities: any, attribute: string) => {
    if (attribute === EAttributeSetting.DAY_SESSIONS) {
      return entities.map((item: any) => ({
        key: `${attribute} - ${item.key}`,
        data: {
          value: item.label,
          key: item.key,
          startTime: item.time.start,
          endTime: item.time.end,
        },
      }));
    }

    return entities.map((item: any) => ({
      key: `${attribute} - ${item.key}`,
      data: {
        value: item.label,
        key: item.key,
      },
    }));
  };

  const mealStylesTableData = parseEntitiesToTableData(
    mealStyles,
    EAttributeSetting.MEAL_STYLES,
  );
  const nutritionsTableData = parseEntitiesToTableData(
    nutritions,
    EAttributeSetting.NUTRITIONS,
  );
  const daySessionsTableData = parseEntitiesToTableData(
    daySessions,
    EAttributeSetting.DAY_SESSIONS,
  );
  const packagingTableData = parseEntitiesToTableData(
    packaging,
    EAttributeSetting.PACKAGING,
  );

  const deleteButtonDisabled = useMemo(
    () =>
      rowCheckbox.reduce((result: string[], item: string) => {
        if (item.startsWith(activeTab)) {
          result.push(item.split(' - ')[1]);
        }

        return result;
      }, []).length === 0,
    [activeTab, rowCheckbox],
  );

  useEffect(() => {
    dispatch(AdminAttributesSettingThunks.fetchAttributes());
  }, []);

  const onOpenAddAttributeModal = () => {
    addAttributeModalControl.setTrue();
  };

  const onAddNew = async (
    attribute: EAttributeSetting,
    label: string,
    time?: { start: string; end: string },
  ) => {
    setSubmitError('');
    if (
      allAttributes[attribute].findIndex(
        (item: any) => item.label === label,
      ) !== -1
    ) {
      return setSubmitError('Giá trị đã tồn tại');
    }

    const { meta } = await dispatch(
      AdminAttributesSettingThunks.addAttributes({
        [attribute]: label,
        time,
      }),
    );
    if (meta.requestStatus !== 'fulfilled') {
      return setSubmitError('Có lỗi xảy ra');
    }
    addAttributeModalControl.setFalse();
  };
  const onEdit = async (attribute: string, key: string, label: string) => {
    await dispatch(
      AdminAttributesSettingThunks.updateAttributes({
        [attribute]: {
          key,
          label,
        },
      }),
    );
  };
  const onDelete = async (attribute: string, key: string[]) => {
    await dispatch(
      AdminAttributesSettingThunks.deleteAttributes({
        [attribute]: key,
      }),
    );
  };

  const onDeleteMultipleAttributes = async () => {
    const keys = rowCheckbox.reduce((result: string[], item: string) => {
      if (item.startsWith(activeTab)) {
        result.push(item.split(' - ')[1]);
      }

      return result;
    }, []);

    await onDelete(activeTab, keys);
    deleteAttributesModalControl.setFalse();
  };

  const onTabChange = (tab: any) => {
    setActiveTab(tab?.key);
  };

  const onKeywordSearch = (e: any) => {
    console.log(e);
  };

  const daySessionsTimeColumn = [
    {
      key: 'time',
      label: intl.formatMessage({
        id: 'AdminAttributesSettingPage.attribute.daySessions.time',
      }),
      render: ({ startTime, endTime }: any) => {
        return (
          <div className={css.timeRange}>{`${startTime} - ${endTime}`}</div>
        );
      },
    },
  ];

  const tableColumnFn = (attribute: string) => {
    return [
      {
        key: 'attribute',
        label: `Tên ${intl.formatMessage({
          id: `AdminAttributesSettingPage.attribute.${attribute}`,
        })}`,
        render: ({ value, key }: any) => {
          return onEditingRow === key ? (
            <FieldTextInput
              id={`${attribute} - ${key}`}
              name={`${attribute} - ${key}`}
              defaultValue={value}
              validate={required('Vui lòng nhập giá trị')}
            />
          ) : (
            <div className={css.attributeName}>{value}</div>
          );
        },
      },
      {
        key: 'creator',
        label: intl.formatMessage({ id: 'AdminAttributesSettingPage.creator' }),
        render: ({ creator }: any) => {
          return <div className={css.creator}>{creator || 'Admin'}</div>;
        },
      },
      ...(attribute === EAttributeSetting.DAY_SESSIONS
        ? daySessionsTimeColumn
        : []),
      {
        key: 'action',
        label: '',
        render: ({ key, value }: any) => {
          const handleEditRow = () => {
            if (onEditingRow && onEditingRow !== key) return;
            setOnEditingRow(key);
          };

          const handleSaveRow = async (e: any) => {
            e.stopPropagation();
            if (currentTableFormValue) {
              const { [`${attribute} - ${key}`]: label } =
                currentTableFormValue;
              if (label !== value) await onEdit(attribute, key, label);
              setOnEditingRow(undefined);
            }
          };

          const onEditInProgressIcon = updateAttributeInProgress ? (
            <IconSpinner className={css.loadingIcon} />
          ) : (
            <IconTick className={css.black} onClick={handleSaveRow} />
          );

          const handleDeleteRow = async () => {
            setOnDeletingRow(key);
            await onDelete(attribute, [key]);
            setOnDeletingRow(undefined);
          };

          return (
            <div className={css.action}>
              <div className={css.actionBtn} onClick={handleEditRow}>
                {onEditingRow === key ? onEditInProgressIcon : <IconEdit />}
              </div>
              <div className={css.actionBtn} onClick={handleDeleteRow}>
                {onDeletingRow === key && updateAttributeInProgress ? (
                  <IconSpinner className={css.loadingIcon} />
                ) : (
                  <IconDelete />
                )}
              </div>
            </div>
          );
        },
      },
    ];
  };

  const tabItems = Object.values(EAttributeSetting).map((attribute) => ({
    key: attribute,
    label: (
      <div className={css.tabLabel}>
        <span>
          {intl.formatMessage({
            id: `AdminAttributesSettingPage.tab.${attribute}`,
          })}
        </span>
        <div data-number className={css.totalItems}>
          {attributeTotalItems[attribute]}
        </div>
      </div>
    ),

    childrenFn: (childProps: any) => {
      return (
        <TableForm
          columns={tableColumnFn(attribute)}
          hasCheckbox
          data={childProps[attribute]}
          tableBodyCellClassName={css.tableBodyCell}
          exposeValues={getExposeValues}
          isLoading={fetchAttributesInProgress}
        />
      );
    },
    childrenProps: {
      mealStyles: mealStylesTableData,
      nutritions: nutritionsTableData,
      daySessions: daySessionsTableData,
      packaging: packagingTableData,
    },
  }));

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h2>
          {intl.formatMessage({ id: 'AdminAttributesSettingPage.pageTitle' })}
        </h2>
        <KeywordSearchForm onSubmit={onKeywordSearch} />
      </div>
      <div>
        <div className={css.actionBtns}>
          <Button
            variant="secondary"
            disabled={deleteButtonDisabled}
            onClick={deleteAttributesModalControl.setTrue}>
            {intl.formatMessage({
              id: 'AdminAttributesSettingPage.header.deleteBtn',
            })}
          </Button>
          <Button onClick={onOpenAddAttributeModal}>
            {intl.formatMessage({
              id: 'AdminAttributesSettingPage.header.addBtn',
            })}
          </Button>
        </div>
        <Tabs items={tabItems as any} onChange={onTabChange} />
      </div>
      <AddAttributeModal
        isOpen={addAttributeModalControl.value}
        onClose={addAttributeModalControl.setFalse}
        onAddAttribute={onAddNew}
        inProgress={updateAttributeInProgress}
        submitErrorText={submitError}
        activeTab={activeTab}
      />
      <ConfirmationModal
        id="DeleteAttributesModal"
        isOpen={deleteAttributesModalControl.value}
        onClose={deleteAttributesModalControl.setFalse}
        title="Xóa thuộc tính"
        description="Bạn có chắc chắn muốn xóa những thuộc tính này?"
        onConfirm={onDeleteMultipleAttributes}
        confirmText="Xóa"
        isConfirmButtonLoading={updateAttributeInProgress}
      />
    </div>
  );
};

export default AdminAttributesSettingPage;
