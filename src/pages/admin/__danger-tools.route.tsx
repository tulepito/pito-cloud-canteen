/* eslint-disable no-alert */
import Button from '@components/Button/Button';
import { useAppDispatch } from '@hooks/reduxHooks';
import { PartnerManageMenusThunks } from '@pages/partner/products/menu/PartnerManageMenus.slice';

function MenuEndDateBulkChangingSection() {
  const dispatch = useAppDispatch();

  return (
    <Button
      onClick={() => {
        if (window.confirm('Bạn chắc chưa?') === false) return;
        dispatch(PartnerManageMenusThunks.changeMenuEndDateInBulk());
      }}>
      Thay đổi toàn bộ ngày kết thúc của toàn bộ menu thành 31/12/2024
    </Button>
  );
}

export default function Admin() {
  return <MenuEndDateBulkChangingSection />;
}
