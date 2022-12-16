import CreateGroupModal from '@components/CreateGroupModal/CreateGroupModal';
import IconDelete from '@components/IconDelete/IconDelete';
import IconEdit from '@components/IconEdit/IconEdit';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import useBoolean from '@hooks/useBoolean';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { companyInfo } from '@src/redux/slices/company.slice';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import css from './GroupSetting.module.scss';

type TGroupItem = {
  id: string;
  groupName: string;
  memberNumber: string;
};
const GroupSettingPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    value: isOpenCreateGroupModal,
    setFalse: onClose,
    setTrue: openCreateGroupModal,
  } = useBoolean();
  const groupList =
    useAppSelector((state) => state.company.groupList, shallowEqual) || [];
  const companyMembers =
    useAppSelector((state) => state.company.companyMembers, shallowEqual) || [];
  const fetchCompanyInfoInProgress = useAppSelector(
    (state) => state.company.fetchCompanyInfoInProgress,
  );
  const formattedGroupList = useMemo<TRowData[]>(
    () =>
      groupList.reduce(
        (result: any, group: any) => [
          ...result,
          {
            key: group.id,
            data: {
              id: group.id,
              groupName: group.name,
              memberNumber: group.members.length,
            },
          },
        ],
        [],
      ),
    [groupList],
  );

  const TABLE_COLUMN: TColumn[] = [
    {
      key: 'groupName',
      label: 'Ten nhom',
      render: (data: any) => {
        return <span>{data.groupName}</span>;
      },
    },
    {
      key: 'memberNumber',
      label: 'So thanh vien',
      render: (data: any) => {
        return <span>{data.memberNumber}</span>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: ({ id }: TGroupItem) => {
        const onEditGroup = () => {
          router.push(`/company/group-setting/${id}`);
        };
        return (
          <>
            <IconEdit className={css.editBtn} onClick={onEditGroup} />
            <IconDelete className={css.deleteBtn} />
          </>
        );
      },
    },
  ];

  useEffect(() => {
    dispatch(companyInfo());
  }, []);
  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.titleWrapper}>
          <h2>Cai dat nhom</h2>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquid,
            accusantium! Iure porro veritatis, laboriosam non suscipit libero
            sint nesciunt numquam modi. Quam architecto in amet eius, esse vitae
            nemo saepe?
          </p>
        </div>
        <div className={css.addGroupBtn} onClick={openCreateGroupModal}>
          Add
        </div>
      </div>
      <div className={css.tableContainer}>
        <Table
          columns={TABLE_COLUMN}
          data={formattedGroupList}
          isLoading={fetchCompanyInfoInProgress}
        />
      </div>
      <CreateGroupModal
        isOpen={isOpenCreateGroupModal}
        onClose={onClose}
        companyMembers={companyMembers}
      />
    </div>
  );
};

export default GroupSettingPage;
