import IconEdit from '@components/IconEdit/IconEdit';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { groupInfo } from '@src/redux/slices/company.slice';
import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import css from './GroupSetting.module.scss';

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
    key: 'action',
    label: '',
    render: () => {
      return <IconEdit />;
    },
  },
];

const GroupSettingPage = () => {
  const dispatch = useAppDispatch();
  const groupList =
    useAppSelector((state) => state.company.groupList, shallowEqual) || [];
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
  useEffect(() => {
    dispatch(groupInfo());
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
        <div className={css.addGroupBtn}>Add</div>
      </div>
      <div className={css.tableContainer}>
        <Table columns={TABLE_COLUMN} data={formattedGroupList} />
      </div>
    </div>
  );
};

export default GroupSettingPage;
