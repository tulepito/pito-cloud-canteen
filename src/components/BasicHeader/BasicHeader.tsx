import NamedLink from '@components/NamedLink/NamedLink';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import { generalPaths } from '@src/paths';

import css from './BasicHeader.module.scss';

type TBasicHeaderProps = {};

const BasicHeader: React.FC<TBasicHeaderProps> = () => {
  return (
    <div className={css.root}>
      <NamedLink path={generalPaths.Home}>
        <div className={css.headerRight}>
          <PitoLogo className={css.logo} variant="secondary" />
        </div>
      </NamedLink>
    </div>
  );
};

export default BasicHeader;
