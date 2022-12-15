import Table from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { groupInfo } from '@src/redux/slices/company.slice';
import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import css from './GroupSetting.module.scss';

const columnList = [
  { label: 'Group name', name: 'groupName' },
  { label: 'Member number', name: 'memberNumber' },
  { label: '', name: 'editField' },
];

const GroupSettingPage = () => {
  const dispatch = useAppDispatch();
  const groupList =
    useAppSelector((state) => state.company.groupList, shallowEqual) || [];
  const formattedGroupList = useMemo(
    () =>
      groupList.reduce(
        (result: any, group: any) => [
          ...result,
          {
            id: group.id,
            groupName: group.name,
            memberNumber: group.members.length,
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
    <>
      <div className={css.tableContainer}>
        <Table
          columnList={columnList}
          data={formattedGroupList}
          dataType={'group'}
        />
      </div>
    </>
  );
};

export default GroupSettingPage;
