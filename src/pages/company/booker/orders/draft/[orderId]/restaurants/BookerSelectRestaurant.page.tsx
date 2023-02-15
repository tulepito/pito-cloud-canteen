import RestaurantCard from '@components/RestaurantCard/RestaurantCard';
import { useRouter } from 'next/router';

import Layout from '../../../components/Layout/Layout';
import css from './BookerSelectRestaurant.module.scss';

function BookerSelectRestaurant() {
  const router = useRouter();
  const { timestamp } = router.query;
  console.log('timestamp', timestamp);

  return (
    <Layout className={css.root}>
      <div>
        <RestaurantCard />
      </div>
    </Layout>
  );
}

export default BookerSelectRestaurant;
