import { useAppSelector } from '@hooks/reduxHooks';
import { User } from '@utils/data';
import { ECompanyStatus, EUserPermission } from '@utils/enums';
import type { TUser } from '@utils/types';

const useActiveCompany = () => {
  const { userPermission, currentUser } = useAppSelector((state) => state.user);
  const { status } = User(currentUser as unknown as TUser).getMetadata();
  const isInactiveCompany =
    userPermission === EUserPermission.company &&
    status === ECompanyStatus.unactive;

  return { isInactiveCompany };
};

export default useActiveCompany;
