import { queryMembersByEmailAdminApi } from '@apis/companyApi';
import type { TUser } from '@utils/types';
import { useState } from 'react';

import useBoolean from './useBoolean';

const useQueryUsers = () => {
  const [users, setUsers] = useState<TUser[]>([]);
  const [queryError, setQueryError] = useState<any>([]);

  const {
    value: queryUsersInProgress,
    setTrue: turnOnUsersInProgress,
    setFalse: turnOffUsersInProgress,
  } = useBoolean(false);

  const queryUsersByEmail = async (emailList: string[]) => {
    try {
      turnOnUsersInProgress();
      const { data } = await queryMembersByEmailAdminApi(emailList);
      setUsers(data);
      turnOffUsersInProgress();
    } catch (error) {
      console.error(error);
      turnOffUsersInProgress();
      setQueryError(error);
    }
  };

  const removeUserById = (id: string) => {
    const newUsersList = [...users];
    setUsers(newUsersList.filter((user) => user.id.uuid !== id));
  };

  return {
    users,
    queryUsersInProgress,
    queryUsersByEmail,
    queryError,
    removeUserById,
  };
};

export default useQueryUsers;
