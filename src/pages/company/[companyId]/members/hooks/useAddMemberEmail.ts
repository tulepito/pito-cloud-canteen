import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { uniqBy } from 'lodash';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  companyMemberActions,
  companyMemberThunks,
} from '@redux/slices/companyMember.slice';
import { User } from '@src/utils/data';

export const filterHasAccountUsers = (loadedResult: any[]) => {
  return loadedResult
    .filter((_result) => _result.response.status === 200)
    .map((_result) => _result.response.user);
};

export const filterHasAccountUserIds = (loadedResult: any[]) => {
  return loadedResult
    .filter((_result) => _result.response.status === 200)
    .map((_result) => User(_result.response.user).getId());
};

export const filterNoAccountUserEmail = (loadedResult: any[]) => {
  return loadedResult
    .filter((_result) => _result.response.status === 404)
    .map((_result) => _result.email);
};

export const useAddMemberEmail = () => {
  const dispatch = useAppDispatch();
  const [emailList, setEmailList] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [noAccountEmails, setNoAccountEmails] = useState<string[]>([]);
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
      const newLoadedResult = uniqBy(
        [...loadedResult, ...checkedEmailInputChunk],
        'email',
      );

      setNoAccountEmails(filterNoAccountUserEmail(newLoadedResult));
      setUserIds(filterHasAccountUserIds(newLoadedResult));
      setLoadedResult(newLoadedResult);
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
    const noAccountEmailList = filterNoAccountUserEmail(loadedResult);
    const userIdList = filterHasAccountUserIds(loadedResult);
    const { meta } = await dispatch(
      companyMemberThunks.addMembers({ noAccountEmailList, userIdList }),
    );
    if (meta.requestStatus === 'fulfilled') {
      setEmailList([]);
      setLoadedResult([]);
      dispatch(companyMemberActions.resetCheckedEmailInputChunk());
    }
  };

  const onAddMembersSubmitInQuizFlow = async (_loadedResult: any[]) => {
    const noAccountEmailList = filterNoAccountUserEmail(_loadedResult);
    const userIdList = filterHasAccountUserIds(_loadedResult);
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
    const { payload } = await dispatch(
      companyMemberThunks.checkEmailExisted(value),
    );

    return payload;
  };

  return {
    userIds,
    noAccountEmails,
    emailList,
    setEmailList,
    loadedResult,
    setLoadedResult,
    removeEmailValue,
    onAddMembersSubmit,
    checkEmailList,
    addMembersInProgress,
    onAddMembersSubmitInQuizFlow,
  };
};
