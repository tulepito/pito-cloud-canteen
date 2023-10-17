import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { uniqBy } from 'lodash';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  companyMemberActions,
  companyMemberThunks,
} from '@redux/slices/companyMember.slice';
import { User } from '@src/utils/data';

export const useAddMemberEmail = () => {
  const dispatch = useAppDispatch();
  const [emailList, setEmailList] = useState<string[]>([]);
  const [loadedResult, setLoadedResult] = useState<any[]>([]);

  const checkedEmailInputChunk = useAppSelector(
    (state) => state.companyMember.checkedEmailInputChunk,
    shallowEqual,
  );

  const addMembersInProgress = useAppSelector(
    (state) => state.companyMember.addMembersInProgress,
  );

  useEffect(() => {
    if (checkedEmailInputChunk) {
      setLoadedResult(
        uniqBy([...loadedResult, ...checkedEmailInputChunk], 'email'),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedEmailInputChunk]);

  const removeEmailValue = (email: string) => {
    const newEmailList = emailList.filter((_email) => _email !== email);
    const newLoadResult = loadedResult.filter(
      (_result) => _result.email !== email,
    );
    setEmailList(newEmailList);
    setLoadedResult(newLoadResult);
  };

  const onAddMembersSubmit = async () => {
    const noAccountEmailList = loadedResult
      .filter((_result) => _result.response.status === 404)
      .map((_result) => _result.email);
    const userIdList = loadedResult
      .filter((_result) => _result.response.status === 200)
      .map((_result) => User(_result.response.user).getId());
    const { meta } = await dispatch(
      companyMemberThunks.addMembers({ noAccountEmailList, userIdList }),
    );
    if (meta.requestStatus === 'fulfilled') {
      setEmailList([]);
      setLoadedResult([]);
      dispatch(companyMemberActions.resetCheckedEmailInputChunk());
    }
  };

  const checkEmailList = async (value: string[]) => {
    await dispatch(companyMemberThunks.checkEmailExisted(value));
  };

  return {
    emailList,
    setEmailList,
    loadedResult,
    setLoadedResult,
    removeEmailValue,
    onAddMembersSubmit,
    checkEmailList,
    addMembersInProgress,
  };
};
