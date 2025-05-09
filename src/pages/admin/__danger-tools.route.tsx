/* eslint-disable no-alert */
import { useState } from 'react';

import Button from '@components/Button/Button';
import { useAppDispatch } from '@hooks/reduxHooks';
import { PartnerManageMenusThunks } from '@pages/partner/products/menu/PartnerManageMenus.slice';

function MenuEndDateBulkChangingSection() {
  const dispatch = useAppDispatch();
  const [data, setData] = useState('');

  return (
    <>
      {/* <Button
        onClick={() => {
          if (window.confirm('Bạn chắc chưa?') === false) return;
          dispatch(PartnerManageMenusThunks.changeMenuEndDateInBulk());
        }}>
        Thay đổi toàn bộ ngày kết thúc của toàn bộ menu thành 31/12/2024
      </Button> */}
      <Button
        onClick={() => {
          if (window.confirm('Bạn chắc chưa?') === false) return;
          dispatch(
            PartnerManageMenusThunks.fetchAllBookersAndParticipants({
              type: 'fetch-all-bookers-participants',
            }),
          );
        }}>
        Xuất danh sách người dùng
      </Button>
      <Button
        onClick={() => {
          if (window.confirm('Bạn chắc chưa?') === false) return;
          dispatch(
            PartnerManageMenusThunks.fetchAllBookersAndParticipants({
              type: 'fetch-all-partners',
            }),
          )
            .unwrap()
            .then((res) => {
              setData(JSON.stringify(res, null, 2));
            });
        }}>
        Xuất danh sách đối tác
      </Button>

      {data}
    </>
  );
}

export default function Admin() {
  return <MenuEndDateBulkChangingSection />;
}
