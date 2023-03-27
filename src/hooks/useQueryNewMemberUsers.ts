import { useState } from 'react';

import { queryMembersByEmailAdminApi } from '@apis/companyApi';
import { getUniqueString, getUniqueUsers } from '@src/utils/data';
import { storableAxiosError } from '@src/utils/errors';
import type { TUser } from '@utils/types';

import useBoolean from './useBoolean';

const useQueryNewMemberUsers = () => {
  const [users, setUsers] = useState<TUser[]>([]);
  const [notFoundUsers, setNotFoundUsers] = useState<string[]>([]);
  const [queryError, setQueryError] = useState<any>([]);

  const {
    value: queryUsersInProgress,
    setTrue: turnOnUsersInProgress,
    setFalse: turnOffUsersInProgress,
  } = useBoolean(false);

  const setInitialUsers = (
    newUsers: TUser[] = [],
    newNotFoundUsers: string[] = [],
  ) => {
    setUsers(newUsers);
    setNotFoundUsers(newNotFoundUsers);
  };

  const queryUsersByEmail = async (
    emailList: string[],
    companyId: string,
    reset: boolean = false,
  ) => {
    try {
      turnOnUsersInProgress();
      const { data } = await queryMembersByEmailAdminApi({
        emails: emailList,
        companyId,
      });
      const { users: newUsers, noExistedUsers } = data;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      const mergedUser = [...users, ...newUsers];
      const nonDuplicatedUser = reset
        ? getUniqueUsers(data)
        : getUniqueUsers(mergedUser);
      setUsers(nonDuplicatedUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      reset
        ? setNotFoundUsers(noExistedUsers)
        : setNotFoundUsers(
            getUniqueString([...notFoundUsers, ...noExistedUsers]),
          );
      turnOffUsersInProgress();
    } catch (error) {
      console.error(error);
      turnOffUsersInProgress();
      setQueryError(storableAxiosError(error));
    }
  };

  const removeUserById = (id: string) => {
    const newUsersList = [...users];
    setUsers(newUsersList.filter((user) => user.id.uuid !== id));
  };

  const removeNotFoundUserByEmail = (email: string) => {
    const newNotFoundUsers = [...notFoundUsers];
    setNotFoundUsers(
      newNotFoundUsers.filter((userEmail) => userEmail !== email),
    );
  };

  return {
    users,
    queryUsersInProgress,
    queryUsersByEmail,
    queryError,
    removeUserById,
    notFoundUsers,
    removeNotFoundUserByEmail,
    setInitialUsers,
  };
};

export default useQueryNewMemberUsers;
