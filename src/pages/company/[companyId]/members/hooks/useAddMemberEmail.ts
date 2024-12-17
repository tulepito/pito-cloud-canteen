import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { uniqBy } from 'lodash';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  companyMemberActions,
  companyMemberThunks,
} from '@redux/slices/companyMember.slice';
import { User } from '@src/utils/data';
import type { TUser } from '@src/utils/types';

const isSuccessResponse = (_result: any) => _result.response.status === 200;
const isNotFoundResponse = (_result: any) => _result.response.status === 404;

const isUserHasCompany = (user: TUser) =>
  !isEmpty(User(user).getMetadata().company);

export const filterHasAccountUsers = (
  loadedResult: any[],
  skipHasCompanyCheck = true,
  needUsersHaveCompany = false,
) => {
  return compact(
    loadedResult.map((_result) => {
      if (isSuccessResponse(_result)) {
        const { user } = _result.response;
        const isValid = needUsersHaveCompany === isUserHasCompany(user);

        return skipHasCompanyCheck || (!skipHasCompanyCheck && isValid)
          ? user
          : null;
      }

      return null;
    }),
  );
};

export const filterHasAccountUserIds = (
  loadedResult: any[],
  skipHasCompanyCheck = true,
  needUsersHaveCompany = false,
) =>
  compact(
    filterHasAccountUsers(
      loadedResult,
      skipHasCompanyCheck,
      needUsersHaveCompany,
    ).map((u) => u?.id?.uuid),
  );

export const filterNoAccountUserEmail = (loadedResult: any[]) => {
  return loadedResult
    .filter(isNotFoundResponse)
    .map((_result) => _result.email);
};

export const useAddMemberEmail = (options?: { orderId?: string }) => {
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
      const newLoadedResult = uniqBy(
        [...loadedResult, ...checkedEmailInputChunk],
        'email',
      );

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
      companyMemberThunks.addMembers({
        noAccountEmailList,
        userIdList,
        orderId: options?.orderId,
      }),
    );

    if (meta.requestStatus === 'fulfilled') {
      setEmailList([]);
      setLoadedResult([]);
      dispatch(companyMemberActions.resetCheckedEmailInputChunk());
    }
  };

  const onAddMembersSubmitInQuizFlow = async (_loadedResult: any[]) => {
    const noAccountEmailList = filterNoAccountUserEmail(_loadedResult);
    const userIdList = filterHasAccountUserIds(_loadedResult, false);
    const { meta } = await dispatch(
      companyMemberThunks.addMembers({
        noAccountEmailList,
        userIdList,
        orderId: options?.orderId,
      }),
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
