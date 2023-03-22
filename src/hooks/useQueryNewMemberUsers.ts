import { useState } from 'react';

import { queryMembersByEmailAdminApi } from '@apis/companyApi';
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

  const setInitialUsers = (newUsers: TUser[] = []) => {
    setUsers(newUsers);
  };

  const queryUsersByEmail = async (
    emailList: string[],
    reset: boolean = false,
  ) => {
    try {
      turnOnUsersInProgress();
      const { data } = await queryMembersByEmailAdminApi(emailList);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      reset ? setUsers(data) : setUsers([...users, ...data]);
      turnOffUsersInProgress();
    } catch (error) {
      console.error(error);
      setNotFoundUsers([...emailList, ...notFoundUsers]);
      turnOffUsersInProgress();
      setQueryError(error);
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
