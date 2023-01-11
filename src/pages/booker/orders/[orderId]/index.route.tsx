import Meta from '@components/Layout/Meta';
import { useIntl } from 'react-intl';

import BookerOrderDetailsPage from './components/BookerOrderDetails.page';

const BookerOrderDetailsRoute = () => {
  const intl = useIntl();

  return (
    <>
      <Meta
        title={intl.formatMessage({ id: 'BookerOrderDetailsRoute.title' })}
      />
      <BookerOrderDetailsPage />
    </>
  );
};

export default BookerOrderDetailsRoute;
