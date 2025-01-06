import { useEffect } from 'react';

import { checkRoleOfCurrentUser } from '@helpers/auth';
import { useAppSelector } from '@hooks/reduxHooks';
import { ECompanyPermission } from '@src/utils/enums';

function GleapCSSInjector() {
  const currentUser = useAppSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (
      !checkRoleOfCurrentUser(currentUser, [
        ECompanyPermission.owner,
        ECompanyPermission.booker,
        ECompanyPermission.participant,
      ])
    ) {
      document.body.classList.add('no-gleap');
    } else {
      document.body.classList.remove('no-gleap');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id?.uuid]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      document.body.classList.add('mobile-gleap');
    } else {
      document.body.classList.remove('mobile-gleap');
    }
  }, []);

  return null;
}

export default GleapCSSInjector;
