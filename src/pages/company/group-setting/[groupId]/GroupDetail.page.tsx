import IconEdit from '@components/IconEdit/IconEdit';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { groupDetailInfo, groupInfo } from '@src/redux/slices/company.slice';
import filter from 'lodash/filter';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import css from './GroupDetail.module.scss';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'name',
    label: 'Ten',
    render: (data: any) => {
      return <span>{data.name}</span>;
    },
  },
  {
    key: 'email',
    label: 'So thanh vien',
    render: (data: any) => {
      return <span>{data.email}</span>;
    },
  },
  {
    key: 'group',
    label: 'Nhom',
    render: (data: any) => {
      return <span>{data.group}</span>;
    },
  },
  {
    key: 'allergy',
    label: 'Di ung',
    render: (data: any) => {
      return <span>{data.allergy}</span>;
    },
  },
  {
    key: 'nutrition',
    label: 'Che do dinh duong',
    render: (data: any) => {
      return <span>{data.nutrition}</span>;
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

const GroupDetailPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const groupList = useAppSelector(
    (state) => state.company.groupList,
    shallowEqual,
  );
  const groupMembers = useAppSelector(
    (state) => state.company.groupMembers,
    shallowEqual,
  );

  const getGroupNames = (groupIds: string[]) => {
    return filter(groupList, (group: any) => groupIds.includes(group.id))
      .map((group: any) => group.name)
      .join(', ');
  };
  const formattedGroupMembers = useMemo<TRowData[]>(
    () =>
      groupMembers.reduce(
        (result: any, member: any) => [
          ...result,
          {
            key: member.id.uuid,
            data: {
              id: member.id.uuid,
              name: member.attributes.profile.displayName,
              email: member.attributes.email,
              group: getGroupNames(
                member.attributes.profile.metadata.groupList,
              ),
              allergy: [],
              nutrition: [],
            },
          },
        ],
        [],
      ),
    [groupMembers],
  );

  const { groupId = '' } = router.query;
  useEffect(() => {
    dispatch(groupInfo());
    dispatch(
      groupDetailInfo({
        groupId: groupId as string,
      }),
    );
  }, [groupId]);
  return (
    <>
      <div className={css.container}>
        <Table columns={TABLE_COLUMN} data={formattedGroupMembers} />
      </div>
    </>
  );
};

export default GroupDetailPage;
