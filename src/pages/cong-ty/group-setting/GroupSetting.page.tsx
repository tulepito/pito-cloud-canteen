import Table from '@components/Table/Table';

import css from './GroupSetting.module.scss';

const columnList = [
  { label: 'Group name', name: 'groupName' },
  { label: 'Member number', name: 'memberNumber' },
  { label: '', name: 'editField' },
];

const data = [
  { id: '123', groupName: 'Nhom 1', memberNumber: 12 },
  { id: '456', groupName: 'Nhom 2', memberNumber: 12 },
  { id: '789', groupName: 'Nhom 3', memberNumber: 12 },
];

const GroupSettingPage = () => {
  return (
    <>
      <div className={css.tableContainer}>
        <Table columnList={columnList} data={data} />
      </div>
    </>
  );
};

export default GroupSettingPage;
