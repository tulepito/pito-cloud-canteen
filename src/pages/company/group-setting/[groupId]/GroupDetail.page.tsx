import Table from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { groupDetailInfo, groupInfo } from '@src/redux/slices/company.slice';
import filter from 'lodash/filter';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import css from './GroupDetail.module.scss';

const columnList = [
  { label: 'Ten', name: 'name' },
  { label: 'Email', name: 'email' },
  { label: 'Nhom', name: 'group' },
  { label: 'Di ung', name: 'allergy' },
  { label: 'Che do dinh duong', name: 'nutrition' },
  { label: '', name: 'actionField' },
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
  const formattedGroupMembers = useMemo(
    () =>
      groupMembers.reduce(
        (result: any, member: any) => [
          ...result,
          {
            id: member.id.uuid,
            name: member.attributes.profile.displayName,
            email: member.attributes.email,
            group: getGroupNames(member.attributes.profile.metadata.groupList),
            allergy: [],
            nutrition: [],
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
      {groupId}
      <div className={css.container}>
        <Table
          columnList={columnList}
          data={formattedGroupMembers}
          dataType="member"
        />
      </div>
    </>
  );
};

export default GroupDetailPage;
