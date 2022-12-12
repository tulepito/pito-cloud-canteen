import Table from '@components/Table/Table';
import { useRouter } from 'next/router';
import React from 'react';

import css from './GroupDetail.module.scss';

const columnList = [
  { label: 'Ten', name: 'name' },
  { label: 'Email', name: 'email' },
  { label: 'Nhom', name: 'group' },
  { label: 'Di ung', name: 'allergy' },
  { label: 'Che do dinh duong', name: 'nutrition' },
  { label: '', name: 'actionField' },
];

const data = [
  {
    id: '123',
    name: 'jolie',
    email: 'jolie@gmail.com',
    group: ['Nhom 1', 'Nhom 2'],
    allergy: ['Hai san'],
    nutrition: ['Keto'],
  },
  {
    id: '456',
    name: 'jolie',
    email: 'jolie@gmail.com',
    group: ['Nhom 1', 'Nhom 2'],
    allergy: ['Hai san'],
    nutrition: ['Keto'],
  },
  {
    id: '789',
    name: 'jolie',
    email: 'jolie@gmail.com',
    group: ['Nhom 1'],
    allergy: [],
    nutrition: [],
  },
];

const GroupDetailPage = () => {
  const router = useRouter();
  const { groupId } = router.query;
  return (
    <>
      {groupId}
      <div className={css.container}>
        <Table columnList={columnList} data={data} />
      </div>
    </>
  );
};

export default GroupDetailPage;
