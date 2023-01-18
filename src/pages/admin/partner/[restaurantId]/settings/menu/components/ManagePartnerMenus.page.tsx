import { useAppDispatch } from '@hooks/reduxHooks';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import type { EMenuTypes } from '@utils/enums';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

type TManagePartnerMenusPageProps = {
  menuType: typeof EMenuTypes.cycleMenu | typeof EMenuTypes.fixedMenu;
};

const ManagePartnerMenusPage: React.FC<TManagePartnerMenusPageProps> = (
  props,
) => {
  const { menuType } = props;
  const { restaurantId } = useRouter().query;
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (menuType && restaurantId)
      dispatch(
        menusSliceThunks.queryPartnerMenus({
          menuType,
          restaurantId,
        }),
      );
  }, [menuType, restaurantId, dispatch]);

  return <>Hello</>;
};

export default ManagePartnerMenusPage;
