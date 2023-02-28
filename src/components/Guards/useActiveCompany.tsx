import { useAppSelector } from '@hooks/reduxHooks';
import { User } from '@utils/data';
import { ECompanyStatus, EUserPermission } from '@utils/enums';
import type { TUser } from '@utils/types';

const useActiveCompany = () => {
  const { userPermission, currentUser } = useAppSelector((state) => state.user);
  const { status } = User(currentUser as unknown as TUser).getMetadata();
  const isCompanyActive =
    userPermission === EUserPermission.company &&
    status === ECompanyStatus.active;

  return { isCompanyActive };
};

export default useActiveCompany;
