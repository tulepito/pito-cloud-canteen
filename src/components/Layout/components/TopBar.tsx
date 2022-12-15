import PitoLogo from '@components/PitoLogo/PitoLogo';
import type { RootState } from '@redux/store';
import get from 'lodash/get';
import { useSelector } from 'react-redux';

import css from './TopBar.module.scss';

const TopBar = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const email = get(currentUser, 'attributes.email');

  return (
    <div className={css.root}>
      <PitoLogo />
      {currentUser && currentUser !== null ? <div>{email}</div> : null}
    </div>
  );
};

export default TopBar;
