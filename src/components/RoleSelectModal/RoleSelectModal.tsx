import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { InlineTextButton } from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { companyThunks } from '@redux/slices/company.slice';
import { userActions } from '@redux/slices/user.slice';
import { CurrentUser, User } from '@src/utils/data';
import type { EUserRole } from '@src/utils/enums';

import { mapUserPermissionByRole } from './helpers/mapUserPermissionByRole';

import css from './RoleSelectModal.module.scss';

type TRoleSelectModalProps = {
  isOpen: boolean;
  handleClose: () => void;
};

type TRoleItemProps = {
  roleName: string;
  companyName: string;
  onChangeRole: () => void;
};

const RoleItem: React.FC<TRoleItemProps> = (props: any) => {
  const { roleName, companyName, onChangeRole } = props;

  return (
    <div className={css.role} onClick={onChangeRole}>
      <div className={css.name}>{roleName}</div>
      <div className={css.company}>{companyName}</div>
    </div>
  );
};

const RoleSelectModal: React.FC<TRoleSelectModalProps> = (props) => {
  const { isOpen, handleClose } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const handleLogoutFn = useLogout();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const roles = useAppSelector((state) => state.user.roles);
  const bookerCompany = useAppSelector((state) => state.company.bookerCompany);

  const bookerCompanyUser = User(bookerCompany);
  const { companyName } = bookerCompanyUser.getPublicData();

  const currentUserGetter = CurrentUser(currentUser!);
  const { firstName, lastName } = currentUserGetter.getProfile();
  const fullName = `${lastName} ${firstName}`;

  const { companyList = [] } = currentUserGetter.getMetadata();

  const handleChangeRole = (role: EUserRole) => () => {
    dispatch(userActions.setRole(role));
    dispatch(userActions.setUserPermission(mapUserPermissionByRole(role)));
    handleClose();
  };

  useEffect(() => {
    if (roles.length > 1) {
      dispatch(companyThunks.bookerFetchCompany(companyList[0]));
    }
  }, [companyList, dispatch, roles]);

  return (
    <Modal
      id="RoleSelectModal"
      isOpen={isOpen}
      shouldHideIconClose
      title=""
      containerClassName={css.modalContainer}
      handleClose={handleClose}>
      <div className={css.content}>
        <div className={css.title}>
          Xin chào {fullName}, hãy chọn vai trò của bạn
        </div>
        <div className={css.roles}>
          {roles.map((role) => (
            <RoleItem
              key={role}
              roleName={intl.formatMessage({
                id: `RoleSelectModal.role.${role}`,
              })}
              companyName={companyName}
              onChangeRole={handleChangeRole(role)}
            />
          ))}
        </div>
        <InlineTextButton
          className={css.changeAccount}
          onClick={handleLogoutFn}>
          Đăng nhập tài khoản khác
        </InlineTextButton>
      </div>
    </Modal>
  );
};

export default RoleSelectModal;
