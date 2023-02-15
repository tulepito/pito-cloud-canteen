import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useState } from 'react';

import css from './BookerSelectRestaurant.module.scss';
import ResultDetailModal from './components/ResultDetailModal/ResultDetailModal';
import ResultList from './components/ResultList/ResultList';

function BookerSelectRestaurant() {
  const router = useRouter();
  const { timestamp } = router.query;
  console.log('timestamp', timestamp);

  const [filterMobileMenuOpen, setFilterMobileMenuOpen] = useState(false);

  const handleFilterMobileMenuClick = () => {
    setFilterMobileMenuOpen(!filterMobileMenuOpen);
  };

  return (
    <div className={css.root}>
      <div className={css.main}>
        <div
          className={classNames(css.filterMobileMenu, {
            [css.filterMobileMenuOpened]: filterMobileMenuOpen,
          })}
          onClick={handleFilterMobileMenuClick}>
          Menu
        </div>
        <div
          className={classNames(css.sidebar, {
            [css.sidebarOpened]: filterMobileMenuOpen,
          })}>
          Hello
        </div>
        <div className={css.result}>
          <ResultList
            className={css.resultList}
            restaurants={[
              { id: '1' },
              { id: '2' },
              { id: '3' },
              { id: '4' },
              { id: '5' },
            ]}
          />
        </div>
        <ResultDetailModal />
      </div>
    </div>
  );
}

export default BookerSelectRestaurant;
