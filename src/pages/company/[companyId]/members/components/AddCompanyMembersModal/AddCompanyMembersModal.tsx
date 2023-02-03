import Button from '@components/Button/Button';
import IconModalClose from '@components/Icons/IconModalClose/IconModalClose';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  companyMemberThunks,
  resetCheckedEmailInputChunk,
} from '@redux/slices/companyMember.slice';
import { USER } from '@utils/data';
import type { TCurrentUser, TUser } from '@utils/types';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import AddCompanyMembersForm from '../AddCompanyMembersForm/AddCompanyMembersForm';
import css from './AddCompanyMembersModal.module.scss';

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
const AddCompanyMembersModal: React.FC<CreateGroupModalProps> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { isOpen, onClose } = props;
  const [emailList, setEmailList] = useState<string[]>([]);
  const [loadedResult, setLoadedResult] = useState<any[]>([]);

  const checkEmailExistedInProgress = useAppSelector(
    (state) => state.companyMember.checkEmailExistedInProgress,
  );
  const checkedEmailInputChunk = useAppSelector(
    (state) => state.companyMember.checkedEmailInputChunk,
    shallowEqual,
  );
  const { addMembersInProgress, addMembersError } = useAppSelector(
    (state) => state.companyMember,
  );
  const companyAccount = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );

  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );

  const removeEmailValue = (email: string) => {
    const newEmailList = emailList.filter((_email) => _email !== email);
    const newLoadResult = loadedResult.filter(
      (_result) => _result.email !== email,
    );
    setEmailList(newEmailList);
    setLoadedResult(newLoadResult);
  };

  useEffect(() => {
    if (checkedEmailInputChunk) {
      setLoadedResult([...loadedResult, ...checkedEmailInputChunk]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedEmailInputChunk]);
  const checkEmailList = (value: string[]) => {
    dispatch(companyMemberThunks.checkEmailExisted(value));
  };
  const onAddMembersSubmit = () => {
    dispatch(resetCheckedEmailInputChunk());
    const noAccountEmailList = loadedResult
      .filter((_result) => _result.response.statusCode)
      .map((_result) => _result.email);
    const userIdList = loadedResult
      .filter((_result) => !_result.response.statusCode)
      .map((_result) => USER(_result.response).getId());
    dispatch(
      companyMemberThunks.addMembers({ noAccountEmailList, userIdList }),
    ).then(() => {
      setEmailList([]);
      setLoadedResult([]);
      onClose();
    });
  };

  if (!isOpen) {
    return null;
  }
  const modalClasses = classNames(css.modal, {
    [css.open]: isOpen,
  });
  return (
    <div className={modalClasses}>
      <div className={css.overlay}>
        <OutsideClickHandler onOutsideClick={onClose}>
          <div className={css.modalContainer}>
            <div className={css.modalHeader}>
              <span className={css.modalTitle}>
                {intl.formatMessage({
                  id: 'AddCompanyMembersModal.modalTitle',
                })}
              </span>
              <IconModalClose onClick={onClose} />
            </div>
            <div className={css.modalContent}>
              <AddCompanyMembersForm
                onSubmit={onAddMembersSubmit}
                initialValues={[]}
                emailList={emailList}
                setEmailList={setEmailList}
                loadedResult={loadedResult}
                checkInputEmailValue={checkEmailList}
                emailCheckingInProgress={checkEmailExistedInProgress}
                companyAccount={companyAccount as TUser}
                removeEmailValue={removeEmailValue}
                addMembersInProgress={addMembersInProgress}
                addMembersError={addMembersError}
                currentUser={currentUser as TCurrentUser}
              />
            </div>
            <div className={css.modalFooter}>
              <Button className={css.cancelBtn} onClick={onClose}>
                {intl.formatMessage({ id: 'AddCompanyMembersModal.cancel' })}
              </Button>
            </div>
          </div>
        </OutsideClickHandler>
      </div>
    </div>
  );
};

export default AddCompanyMembersModal;
