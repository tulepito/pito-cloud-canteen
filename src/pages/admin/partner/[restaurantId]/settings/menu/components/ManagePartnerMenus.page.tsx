import { InlineTextButton } from '@components/Button/Button';
import IconDelete from '@components/IconDelete/IconDelete';
import IconEdit from '@components/IconEdit/IconEdit';
import IconDuplicate from '@components/Icons/IconDuplicate/IconDuplicate';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import { useAppDispatch } from '@hooks/reduxHooks';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import { EMenuTypes } from '@utils/enums';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import css from './ManagePartnerMenus.module.scss';

type TManagePartnerMenusPageProps = {
  menuType: typeof EMenuTypes.cycleMenu | typeof EMenuTypes.fixedMenu;
};

const TABLE_COLUNMS: TColumn[] = [
  {
    key: 'title',
    label: 'Tên menu',
    render: ({ title }) => {
      return <div>{title}</div>;
    },
  },
  {
    key: 'applyDates',
    label: 'Thời gian áp dụng',
    render: ({ startDate, endDate }) => {
      return (
        <div>
          {startDate} - {endDate}
        </div>
      );
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: ({ startDate, endDate }) => {
      return (
        <div>
          {startDate} - {endDate}
        </div>
      );
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: ({ id, restaurantId }) => {
      return (
        <div>
          <NamedLink
            path={`/admin/partner/${restaurantId}/settings/menu/${id}`}
            className={css.actionBtn}>
            <IconEdit />
          </NamedLink>
          <NamedLink
            path={`/admin/partner/${restaurantId}/settings/menu/create?duplicateId=${id}`}
            className={css.actionBtn}>
            <IconDuplicate />
          </NamedLink>
          <InlineTextButton
            type="button"
            onClick={() => {}}
            className={css.actionBtn}>
            <IconDelete />
          </InlineTextButton>
        </div>
      );
    },
  },
];

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

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage
          id={
            menuType === EMenuTypes.cycleMenu
              ? 'ManagePartnerMenusPage.cycleMenuTitle'
              : 'ManagePartnerMenusPage.fixedMenuTitle'
          }
        />
      </h1>
      <TableForm columns={TABLE_COLUNMS} data={[]} />
    </div>
  );
};

export default ManagePartnerMenusPage;
