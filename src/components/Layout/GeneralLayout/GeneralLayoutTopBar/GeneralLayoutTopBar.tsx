import PITOLogo from '@components/PITOLogo/PITOLogo';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import get from 'lodash/get';
import Link from 'next/link';

import css from './GeneralLayoutTopBar.module.scss';

const GeneralLayoutTopBar = () => {
  const currentUser = useAppSelector(currentUserSelector);
  const email = get(currentUser, 'attributes.email');

  return (
    <div className={css.root}>
      <Link href="/">
        <PITOLogo className={css.logo} />
      </Link>
      {currentUser && currentUser !== null ? <div>{email}</div> : null}
    </div>
  );
};

export default GeneralLayoutTopBar;
